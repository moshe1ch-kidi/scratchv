import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode removed purely to prevent double-initialization issues with Blockly in some dev environments, 
  // though the useEffect cleanup handles it. keeping it off for smoother visual init.
  <App />
);
