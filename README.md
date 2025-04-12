# Face Recognition Frontend

Real-time face recognition web application with React.

## Quick Start

### 1. Install Yarn
```bash
# Using npm
npm install -g yarn

# On macOS with Homebrew
brew install yarn

# On Windows with Chocolatey
choco install yarn
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Set Environment
Create `.env` file:
```env
VITE_BACKEND_URL=http://your-backend-url
```

### 4. Run Application

#### Development Mode
```bash
yarn dev
```
Visit `http://localhost:5173`

#### Production with Docker
```bash
# Build image
docker build -t face-recognition-frontend .

# Run container
docker run -d -p 80:80 \
  -e VITE_BACKEND_URL=http://your-backend-url \
  --name face-recognition-app \
  face-recognition-frontend
```
Visit `http://localhost`

## Requirements
- Node.js v16+
- Webcam
- Modern browser (Chrome recommended)

## Features
- Real-time face detection
- Live camera feed
- Verification badge (75%+ confidence)
- Detailed results page
- Responsive design

## Troubleshooting

### Camera Issues
- Allow camera permissions in browser
- Check if camera is used by another app
- Use good lighting

### Docker Issues
- Make sure port 80 is free
- Check logs: `docker logs face-recognition-app`
- Verify backend URL is correct
