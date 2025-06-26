import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';

// Configure PDF.js worker for PDF parsing
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);