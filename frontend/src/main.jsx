import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const textScale = Number(localStorage.getItem('techasset_texto') || 100);
document.documentElement.style.fontSize = `${Math.max(100, Math.min(150, textScale))}%`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
