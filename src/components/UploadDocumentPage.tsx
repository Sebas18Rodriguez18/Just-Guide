import React, { useState, useRef } from 'react';
import { Upload, Loader2, ArrowLeft, Info, Eye, AlertCircle, CheckCircle, File, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { parseDocument } from '../utils/documentParser';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import Swal from 'sweetalert2';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  error?: string;
  parseProgress?: number;
}

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const { user, language } = useAppContext();
  const userId = user?.id || '';
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(language);

  // Solo aceptar DOCX
  const acceptedTypes = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return language === 'es' ? 'El archivo debe ser menor a 10MB' : 'File size must be less than 10MB';
    }

    const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.name.toLowerCase().endsWith('.docx');
    
    if (!isDOCX) {
      return language === 'es' 
        ? 'Solo se admiten archivos DOCX' 
        : 'Only DOCX files are allowed';
    }

    return null;
  };

  const uploadToSupabase = async (file: File): Promise<{ publicUrl: string, filePath: string }> => {
    if (!user) {
      throw new Error(language === 'es' ? 'Debes iniciar sesión para subir documentos.' : 'You must be logged in to upload documents.');
    }
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('documents').upload(filePath, file);
    if (error) throw error;
    let publicUrl = '';
    const { data: signedData, error: signedError } = await supabase.storage.from('documents').createSignedUrl(filePath, 60 * 60);
    if (signedError) {
      const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      publicUrl = publicUrlData.publicUrl;
    } else {
      publicUrl = signedData.signedUrl;
    }
    return { publicUrl, filePath };
  };

  type DocumentInsert = {
    title: string;
    document_type: string;
    language: string;
    file_url: string;
    user_id: string;
    upload_date: string;
    status?: string;
  };

  const createDocumentRecord = async (file: File, fileUrl: string): Promise<string> => {
    const documentData: DocumentInsert = {
      title: file.name.replace(/\.[^/.]+$/, ''),
      document_type: 'DOCX',
      language: language,
      file_url: fileUrl,
      user_id: userId,
      upload_date: new Date().toISOString(),
      status: 'in-progress',
    };
    const { data, error } = await supabase.from('documents').insert([documentData]).select('id').single();
    if (error) throw new Error(error.message);
    return data.id;
  };

  const updateDocumentWithParsedData = async (docId: string, extractedText: string, detectedLanguage: string): Promise<void> => {
    const { error } = await supabase.from('documents').update({
      extracted_text: extractedText,
      detected_language: detectedLanguage,
      status: 'completed',
    }).eq('id', docId);
    if (error) throw new Error(error.message);
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({
        status: 'error',
        progress: 0,
        message: '',
        error: validationError
      });
      return;
    }

    try {
      if (!user) {
        setUploadState({
          status: 'error',
          progress: 0,
          message: '',
          error: language === 'es' ? 'Debes iniciar sesión para subir documentos.' : 'You must be logged in to upload documents.'
        });
        return;
      }

      // Paso 1: Subir archivo
      setUploadState({
        status: 'uploading',
        progress: 25,
        message: t.uploading
      });
      const { publicUrl } = await uploadToSupabase(file);

      // Paso 2: Crear registro del documento
      setUploadState({
        status: 'uploading',
        progress: 40,
        message: language === 'es' ? 'Creando registro del documento...' : 'Creating document record...'
      });
      const docId = await createDocumentRecord(file, publicUrl);

      // Paso 3: Extraer texto del documento DOCX
      setUploadState({
        status: 'processing',
        progress: 50,
        message: language === 'es' ? 'Extrayendo texto del documento DOCX...' : 'Extracting text from DOCX document...'
      });

      const parseResult = await parseDocument(file, (parseProgress) => {
        setUploadState(prev => ({
          ...prev,
          progress: 50 + (parseProgress * 30), // 30% del progreso total para parsing
          parseProgress: parseProgress
        }));
      });

      if (parseResult.confidence < 0.5) {
        throw new Error(language === 'es' ? 'La calidad del texto extraído es muy baja' : 'Extracted text quality is too low');
      }

      // Paso 4: Actualizar documento con texto extraído
      setUploadState({
        status: 'processing',
        progress: 85,
        message: language === 'es' ? 'Guardando texto extraído...' : 'Saving extracted text...'
      });

      await updateDocumentWithParsedData(docId, parseResult.extracted_text, parseResult.detected_language);

      // Paso 5: Generar guía paso a paso
      setUploadState({
        status: 'processing',
        progress: 95,
        message: language === 'es' ? 'Generando guía paso a paso...' : 'Generating step-by-step guide...'
      });

      const guide = await generateStepByStepGuide(parseResult.extracted_text, parseResult.detected_language);
      await supabase.from('simplified_guides').insert([
        {
          document_id: docId,
          steps: guide.steps,
          summary: guide.summary,
          reading_level: guide.reading_level,
          created_at: new Date().toISOString()
        }
      ]);

      // Paso 6: Éxito
      setUploadState({
        status: 'success',
        progress: 100,
        message: language === 'es' ? '¡Documento DOCX procesado exitosamente!' : 'DOCX document processed successfully!'
      });

      // Mostrar información del documento procesado
      Swal.fire({
        icon: 'success',
        title: language === 'es' ? '¡Documento DOCX Procesado!' : 'DOCX Document Processed!',
        html: `
          <div class="text-left">
            <p><strong>${language === 'es' ? 'Archivo:' : 'File:'}</strong> ${file.name}</p>
            <p><strong>${language === 'es' ? 'Tipo:' : 'Type:'}</strong> DOCX</p>
            <p><strong>${language === 'es' ? 'Idioma:' : 'Language:'}</strong> ${parseResult.detected_language === 'es' ? 'Español' : 'English'}</p>
            <p><strong>${language === 'es' ? 'Palabras:' : 'Words:'}</strong> ${parseResult.word_count}</p>
            <p><strong>${language === 'es' ? 'Confianza:' : 'Confidence:'}</strong> ${Math.round(parseResult.confidence * 100)}%</p>
          </div>
        `,
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: language === 'es' ? 'Ver Resumen' : 'View Summary'
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          navigate(`/summary/${docId}`);
        }
      });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate(`/summary/${docId}`);
      }, 3500);

    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = language === 'es' ? 'Error desconocido al procesar el documento.' : 'Unknown error processing document.';
      }

      Swal.fire({
        icon: 'error',
        title: language === 'es' ? 'Error al procesar documento DOCX' : 'Error processing DOCX document',
        text: errorMessage
      });

      setUploadState({
        status: 'error',
        progress: 0,
        message: '',
        error: errorMessage
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header Mejorado con Botones Prominentes */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Botones de Navegación Prominentes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
              disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">{t.back}</span>
            </button>
            
            {/* BOTÓN PRINCIPAL: Volver al Panel - MUY VISIBLE */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-just-brown to-just-forest dark:from-just-moss dark:to-just-brown text-just-white rounded-xl font-semibold hover:from-just-forest hover:to-just-hunter dark:hover:from-just-brown dark:hover:to-just-forest transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
            >
              <Home className="w-5 h-5 mr-2" />
              <span className="text-lg">
                {language === 'es' ? 'Volver al Panel' : 'Back to Dashboard'}
              </span>
            </button>
          </div>

          {/* Título de la Página */}
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-just-forest dark:text-just-white mb-2 flex items-center justify-center">
              <Upload className="w-7 h-7 mr-3 text-just-moss" />
              {t.uploadDocument}
            </h1>
            <p className="text-just-gray dark:text-gray-400 text-lg">
              {language === 'es' 
                ? 'Sube archivos DOCX en español o inglés'
                : 'Upload DOCX files in Spanish or English'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-fade-in">
            {/* Drop Zone */}
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 mb-6 transition-all duration-200 ${
                dragActive 
                  ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 scale-105' 
                  : 'border-just-sand dark:border-gray-700 bg-just-beige/50 dark:bg-gray-900/30'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadState.status === 'idle' && (
                <>
                  <div className="mb-4">
                    <File className="w-16 h-16 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-just-hunter dark:text-gray-300 mb-4 text-center font-medium">
                    {language === 'es' 
                      ? 'Arrastra y suelta tu archivo DOCX aquí'
                      : 'Drag and drop your DOCX file here'
                    }
                  </p>
                  <p className="text-sm text-just-gray dark:text-gray-400 mb-4 text-center">
                    {language === 'es' 
                      ? 'Solo documentos DOCX en español e inglés'
                      : 'Only DOCX documents in Spanish and English'
                    }
                  </p>
                </>
              )}

              {uploadState.status === 'processing' && (
                <div className="text-center">
                  <File className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-just-hunter dark:text-gray-300 mt-4 font-medium">
                    {uploadState.message}
                  </p>
                  {uploadState.parseProgress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-just-moss h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadState.parseProgress * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-just-gray dark:text-gray-400 mt-1">
                        {language === 'es' ? 'Extrayendo texto de DOCX...' : 'Extracting text from DOCX...'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <input
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />
              
              {uploadState.status === 'idle' && (
                <button
                  className="mt-4 bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest transition-all duration-200 flex items-center hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {language === 'es' ? 'Seleccionar Archivo DOCX' : 'Select DOCX File'}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {uploadState.status !== 'idle' && (
              <div className="mb-6">
                <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className="bg-just-moss h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${uploadState.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-just-gray dark:text-gray-400 text-center">
                  {uploadState.progress}% - {uploadState.message}
                </p>
              </div>
            )}

            {/* Status Messages */}
            {uploadState.status === 'error' && (
              <div className="flex items-center text-red-600 dark:text-red-400 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{uploadState.error}</span>
              </div>
            )}

            {uploadState.status === 'success' && (
              <div className="flex items-center text-green-600 dark:text-green-400 mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{uploadState.message}</span>
              </div>
            )}

            {/* File Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <Info className="w-4 h-4 mr-2" />
                <span className="text-xs">Solo DOCX</span>
              </div>
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-xs">
                  {language === 'es' ? 'Privado y seguro' : 'Private & secure'}
                </span>
              </div>
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <Upload className="w-4 h-4 mr-2" />
                <span className="text-xs">
                  {language === 'es' ? 'Máx 10MB' : 'Max 10MB'}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">
                    {language === 'es' ? '¿Por qué solo DOCX?' : 'Why only DOCX?'}
                  </p>
                  <p>
                    {language === 'es' 
                      ? 'Los archivos DOCX ofrecen la mejor calidad de extracción de texto y preservan el formato original del documento.'
                      : 'DOCX files offer the best text extraction quality and preserve the original document formatting.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Flotante Adicional para Volver al Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-just-brown to-just-forest dark:from-just-moss dark:to-just-brown text-just-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
          title={language === 'es' ? 'Volver al Panel Principal' : 'Back to Main Dashboard'}
          disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
        >
          <Home className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}