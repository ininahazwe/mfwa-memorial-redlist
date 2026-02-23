// ============================================
// POINT D'ENTRÉE DE L'APPLICATION
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Rendu de l'application
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);