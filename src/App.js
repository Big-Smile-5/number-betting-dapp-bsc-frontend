import React from 'react';
import Home from './components/home.js';
import { ToastProvider } from 'react-toast-notifications'
import './App.css';

function App() {
  return (
    <>
      <ToastProvider>
        <Home />
      </ToastProvider>
    </>
  );
}

export default App;
