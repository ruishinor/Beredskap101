import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';
import './index.css';
import './i18n';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  window.addEventListener('error', (event) => {
    console.error('Unhandled global error:', event.error || event.message);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    let controlled = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // An accepted update claims every open tab. Reload them together so
      // none keeps importing old lazy chunks after precache cleanup.
      if (controlled) window.location.reload();
      else controlled = true;
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        const announceWaiting = () => {
          if (registration.waiting && navigator.serviceWorker.controller) window.dispatchEvent(new Event('beredskap101:update-ready'));
        };
        announceWaiting();
        registration.addEventListener('updatefound', () => {
          registration.installing?.addEventListener('statechange', announceWaiting);
        });
      }).catch((error) => {
        console.warn('Service worker registration failed', error);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('Unregistered active service worker for development:', registration);
        });
      }
    });
  }
}
