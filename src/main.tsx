import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';

// Configure PDF.js worker with multiple fallback URLs for better reliability
import * as pdfjs from 'pdfjs-dist';

// Try multiple CDN sources for better reliability
const workerSources = [
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`,
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
];

// Set the worker source with fallback
pdfjs.GlobalWorkerOptions.workerSrc = workerSources[0];

// Test worker availability and fallback if needed
const testWorker = () => {
  try {
    // Try to create a simple worker to test if the URL works
    const worker = new Worker(pdfjs.GlobalWorkerOptions.workerSrc);
    worker.terminate();
    console.log('PDF.js worker configured successfully');
  } catch (error) {
    console.warn('Primary PDF.js worker failed, trying fallback...');
    // Try fallback sources
    for (let i = 1; i < workerSources.length; i++) {
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = workerSources[i];
        const worker = new Worker(pdfjs.GlobalWorkerOptions.workerSrc);
        worker.terminate();
        console.log(`PDF.js worker configured with fallback source ${i}`);
        break;
      } catch (fallbackError) {
        console.warn(`Fallback source ${i} also failed`);
        if (i === workerSources.length - 1) {
          console.error('All PDF.js worker sources failed');
        }
      }
    }
  }
};

// Test worker on load
testWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);