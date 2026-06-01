import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './i18n';
import { registerSW } from 'virtual:pwa-register';
import { validateEnvironment } from './utils/env';

// Apply saved theme before React renders — prevents flash of wrong theme
const savedTheme = localStorage.getItem('ns-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Validate environment configurations
validateEnvironment();

// Register service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

