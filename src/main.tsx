import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// FIXME: a custom font should be used. Eg:
// import '@fontsource-variable/<font-name>';

console.log('Main.tsx loading...', new Date().toISOString());

const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h1>Error: Root element not found</h1><p>The application failed to initialize because the root element is missing.</p></div>';
  throw new Error('Root element not found');
}

try {
  console.log('Creating React root...');
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `<div style="padding: 20px; font-family: Arial; background: white;"><h1 style="color: red;">Render Error</h1><pre style="background: #f5f5f5; padding: 10px; border: 1px solid #ccc; overflow: auto;">${error}</pre></div>`;
}
