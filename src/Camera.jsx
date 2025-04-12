import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CAPTURE_INTERVAL = 500; // Reduced to 500ms for more frequent updates
const CANVAS_WIDTH = 480; // Increased by 50% from 320
const CANVAS_HEIGHT = 360; // Increased by 50% from 240

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastCaptureTimeRef = useRef(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const drawFaceRectangle = useCallback((result) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d', { alpha: false });
    
    // Draw the video frame
    ctx.drawImage(videoRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw rectangles for each face
    if (result?.results) {
      result.results.forEach(face => {
        // Check if face is verified
        if (face.confidence >= 0.75 && face.matched) {
          setIsVerified(true);
          
          // Capture the current frame for the result page
          const captureCanvas = document.createElement('canvas');
          captureCanvas.width = CANVAS_WIDTH;
          captureCanvas.height = CANVAS_HEIGHT;
          const captureCtx = captureCanvas.getContext('2d');
          
          // Draw the current frame
          captureCtx.drawImage(videoRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          
          // Draw the face rectangle and info
          captureCtx.strokeStyle = '#00ff00';
          captureCtx.lineWidth = 2;
          captureCtx.strokeRect(
            face.location.left,
            face.location.top,
            face.location.right - face.location.left,
            face.location.bottom - face.location.top
          );

          // Navigate to result page with the verified face data and image
          navigate('/result', { 
            state: { 
              personData: {
                ...face,
                timestamp: new Date().toISOString(),
                verificationId: Math.random().toString(36).substr(2, 9),
                capturedImage: captureCanvas.toDataURL('image/jpeg', 0.9)
              }
            }
          });
          return;
        }

        const { location, name, confidence } = face;
        
        // Draw rectangle
        ctx.strokeStyle = face.matched ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          location.left,
          location.top,
          location.right - location.left,
          location.bottom - location.top
        );
        
        // Setup text style
        ctx.fillStyle = face.matched ? '#00ff00' : '#ff0000';
        ctx.font = '16px Arial';
        
        // Draw background for text
        const text = `${name} (${(confidence * 100).toFixed(1)}%)`;
        const textMetrics = ctx.measureText(text);
        const textHeight = 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
          location.left - 2,
          location.top - textHeight - 8,
          textMetrics.width + 4,
          textHeight + 4
        );
        
        // Draw text
        ctx.fillStyle = face.matched ? '#00ff00' : '#ff0000';
        ctx.fillText(
          text,
          location.left,
          location.top - 5
        );
      });
    }
  }, [navigate]);

  const captureAndSendFrame = useCallback(async () => {
    if (!videoRef.current || !isStreaming || isVerified) return;

    const now = Date.now();
    if (now - lastCaptureTimeRef.current < CAPTURE_INTERVAL) return;
    lastCaptureTimeRef.current = now;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const frame = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/recognize-face-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ frame }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setRecognitionResult(data);
      }
    } catch (err) {
      console.error('Error sending frame:', err);
      setError('Failed to communicate with server: ' + err.message);
    }
  }, [isStreaming, isVerified]);

  const renderFrame = useCallback(() => {
    if (!isStreaming || isVerified) return;
    
    drawFaceRectangle(recognitionResult);
    captureAndSendFrame();
    
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [isStreaming, drawFaceRectangle, captureAndSendFrame, recognitionResult, isVerified]);

  const restartDetection = () => {
    setIsVerified(false);
    setRecognitionResult(null);
    renderFrame();
  };

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            facingMode: 'user',
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Failed to access camera: ' + err.message);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isStreaming && !isVerified) {
      renderFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, renderFrame, isVerified]);

  return (
    <div className="camera-container" style={{ 
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      gap: '30px', // Increased gap
      zIndex: 1000,
      alignItems: 'flex-start',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: '30px', // Increased padding
      borderRadius: '16px', // Increased border radius
      backdropFilter: 'blur(8px)'
    }}>
      <div>
        {error && (
          <div className="error" style={{ color: 'red', padding: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <div style={{ 
          position: 'relative', 
          width: `${CANVAS_WIDTH}px`, 
          height: `${CANVAS_HEIGHT}px`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <video ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          {isVerified && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10
            }}>
              <button
                onClick={restartDetection}
                style={{
                  backgroundColor: '#00ff00',
                  color: '#000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Restart Detection
              </button>
            </div>
          )}
        </div>
      </div>

      {recognitionResult && (
        <div style={{ 
          padding: '20px',
          backgroundColor: 'rgba(33, 33, 33, 0.95)',
          borderRadius: '12px',
          color: '#fff',
          minWidth: '375px', // Increased by 50% from 250px
          maxHeight: '360px', // Match video height
          overflowY: 'auto',
          height: 'fit-content',
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#fff'
          }}>Recognition Results</h3>
          <p style={{ 
            margin: '0 0 15px 0',
            fontSize: '18px',
            color: '#fff'
          }}>Faces Found: {recognitionResult.faces_found}</p>
          {recognitionResult.results.map((face, index) => (
            <div key={index} style={{ 
              marginTop: '12px',
              padding: '15px',
              backgroundColor: face.matched ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
              borderRadius: '8px',
              borderLeft: `6px solid ${face.matched ? '#00ff00' : '#ff0000'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <p style={{ margin: '0', fontSize: '18px', fontWeight: '500' }}>
                  Name: {face.name}
                </p>
                {face.confidence >= 0.75 && (
                  <div style={{
                    backgroundColor: '#00ff00',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000'
                  }}>
                    ✓
                  </div>
                )}
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                Confidence: {(face.confidence * 100).toFixed(1)}%
              </p>
              <p style={{ margin: '0', fontSize: '16px' }}>
                Matched: {face.matched ? 'Yes' : 'No'}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Camera; 