import React from 'react';
import './App.css';
import Chatbot from './Chatbot';

function App() {
  return (
     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-sky-900">Financial Report Chatbot</h1>
      <Chatbot />
    </div>
  );
}

export default App;
