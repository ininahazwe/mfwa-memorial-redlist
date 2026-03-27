// ============================================
// POINT D'ENTRÉE DE L'APPLICATION - DEBUG
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { suppressWarnings } from './utils/warning-suppressor';

suppressWarnings();

console.log("🔵 [MAIN] Starting app initialization...");
console.log("🔵 [MAIN] Environment variables:", {
    apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
});

const root = document.getElementById('root');
console.log("🔵 [MAIN] Root element found:", !!root);

if (!root) {
    console.error("❌ [MAIN] ROOT ELEMENT NOT FOUND!");
    throw new Error('Root element not found');
}

try {
    console.log("🔵 [MAIN] Creating React root...");
    ReactDOM.createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
    console.log("🟢 [MAIN] App mounted successfully");
} catch (error) {
    console.error("❌ [MAIN] Failed to mount app:", error);
    throw error;
}
