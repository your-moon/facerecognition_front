import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Camera from './Camera';
import ResultPage from './ResultPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1>Face Recognition</h1>
        <Routes>
          <Route path="/" element={<Camera />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
