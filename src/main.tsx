import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';

console.log('🚀 Inicializando JustGuide...');
console.log('📄 Soporte para documentos DOCX habilitado');
console.log('🌐 Idiomas soportados: Español e Inglés');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);