import React, { useState, useRef } from 'react';
import { Upload, Loader2, ArrowLeft, Info, Eye, AlertCircle, CheckCircle, File } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { parseDocument } from '../utils/documentParser';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { AIService } from '../utils/aiService';
import { AnalyticsService } from '../utils/analyticsService';
import { smartCapitalize } from '../utils/textCapitalization';
import Swal from 'sweetalert2';
import Navbar from './Navbar';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'ai_processing' | 'success' | 'error';
  progress: number;
  message: string;
  error?: string;
  parseProgress?: number;
  aiProgress?: number;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(language);
  const analytics = AnalyticsService.getInstance();
  const aiService = AIService.getInstance();

  // Only accept DOCX files
  const acceptedTypes = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return smartCapitalize(language === 'es' ? 'el archivo debe ser menor a 10MB' : 'file size must be less than 10MB', 'sentence', language);
    }

    const isValidType = Object.keys(acceptedTypes).some(type => file.type === type) ||
                       Object.values(acceptedTypes).flat().some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      return smartCapitalize(
        language === 'es' 
          ? 'solo se admiten archivos DOCX' 
          : 'only DOCX files are allowed',
        'sentence',
        language
      );
    }

    return null;
  };

  const uploadToSupabase = async (file: File): Promise<{ publicUrl: string, filePath: string }> => {
    if (!user) {
      throw new Error(smartCapitalize(language === 'es' ? 'debes iniciar sesión para subir documentos.' : 'you must be logged in to upload documents.', 'sentence', language));
    }
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('documents').upload(filePath, file);
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
    return { publicUrl: publicUrlData.publicUrl, filePath };
  };

  const createDocumentRecord = async (file: File, fileUrl: string): Promise<string> => {
    const documentData = {
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
    const startTime = Date.now();
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
          error: smartCapitalize(language === 'es' ? 'debes iniciar sesión para subir documentos.' : 'you must be logged in to upload documents.', 'sentence', language)
        });
        return;
      }

      // Track upload start
      analytics.trackDocumentUpload('DOCX', language, file.size);

      // Step 1: Upload file
      setUploadState({
        status: 'uploading',
        progress: 10,
        message: smartCapitalize(t.uploading, 'sentence', language)
      });
      const { publicUrl } = await uploadToSupabase(file);

      // Step 2: Create document record
      setUploadState({
        status: 'uploading',
        progress: 20,
        message: smartCapitalize(language === 'es' ? 'creando registro del documento...' : 'creating document record...', 'sentence', language)
      });
      const docId = await createDocumentRecord(file, publicUrl);

      let extractedText = '';
      let detectedLanguage = language;

      // Step 3: Process DOCX file
      setUploadState({
        status: 'processing',
        progress: 40,
        message: smartCapitalize(language === 'es' ? 'extrayendo texto del documento DOCX...' : 'extracting text from DOCX document...', 'sentence', language)
      });

      const parseResult = await parseDocument(file, (parseProgress) => {
        setUploadState(prev => ({
          ...prev,
          progress: 40 + (parseProgress * 20),
          parseProgress: parseProgress
        }));
      });

      extractedText = parseResult.extracted_text;
      detectedLanguage = parseResult.detected_language;

      // Step 4: AI Enhancement
      setUploadState({
        status: 'ai_processing',
        progress: 70,
        message: smartCapitalize(language === 'es' ? 'mejorando texto con IA...' : 'enhancing text with AI...', 'sentence', language)
      });

      // Use AI service for language detection and text enhancement
      const languageResult = await aiService.detectLanguage(extractedText);
      if (languageResult.confidence > 0.8) {
        detectedLanguage = languageResult.language;
      }

      // Step 5: Update document with extracted text
      setUploadState({
        status: 'processing',
        progress: 85,
        message: smartCapitalize(language === 'es' ? 'guardando texto extraído...' : 'saving extracted text...', 'sentence', language)
      });

      await updateDocumentWithParsedData(docId, extractedText, detectedLanguage);

      // Step 6: Generate guide with AI enhancement
      setUploadState({
        status: 'ai_processing',
        progress: 95,
        message: smartCapitalize(language === 'es' ? 'generando guía inteligente...' : 'generating intelligent guide...', 'sentence', language)
      });

      const guide = await generateStepByStepGuide(extractedText, language);
      await supabase.from('simplified_guides').insert([
        {
          document_id: docId,
          steps: guide.steps,
          summary: guide.summary,
          reading_level: guide.reading_level,
          created_at: new Date().toISOString()
        }
      ]);

      // Track successful processing
      const processingTime = Date.now() - startTime;
      analytics.trackDocumentProcessing(docId, processingTime, true);
      analytics.trackGuideGeneration(docId, language, guide.jurisdiction || 'Unknown', guide.steps.length);

      // Step 7: Success
      setUploadState({
        status: 'success',
        progress: 100,
        message: smartCapitalize(language === 'es' ? '¡documento procesado exitosamente con IA!' : 'document processed successfully with AI!', 'sentence', language)
      });

      // Show enhanced success message
      Swal.fire({
        icon: 'success',
        title: smartCapitalize(language === 'es' ? '¡documento procesado con IA!' : 'document processed with AI!', 'sentence', language),
        html: `
          <div class="text-left">
            <p><strong>${smartCapitalize(language === 'es' ? 'archivo:' : 'file:', 'sentence', language)}</strong> ${file.name}</p>
            <p><strong>${smartCapitalize(language === 'es' ? 'tipo:' : 'type:', 'sentence', language)}</strong> DOCX</p>
            <p><strong>${smartCapitalize(language === 'es' ? 'idioma detectado:' : 'detected language:', 'sentence', language)}</strong> ${detectedLanguage === 'es' ? 'Español' : 'English'}</p>
            <p><strong>${smartCapitalize(language === 'es' ? 'palabras extraídas:' : 'words extracted:', 'sentence', language)}</strong> ${extractedText.split(/\s+/).length}</p>
            <p><strong>${smartCapitalize(language === 'es' ? 'pasos generados:' : 'steps generated:', 'sentence', language)}</strong> ${guide.steps.length}</p>
            <div class="mt-3 p-2 bg-blue-50 rounded">
              <small class="text-blue-600">✨ ${smartCapitalize(language === 'es' ? 'procesado con IA avanzada' : 'processed with advanced AI', 'sentence', language)}</small>
            </div>
          </div>
        `,
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: smartCapitalize(language === 'es' ? 'ver resumen' : 'view summary', 'sentence', language)
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          navigate(`/summary/${docId}`);
        }
      });

      setTimeout(() => {
        navigate(`/summary/${docId}`);
      }, 4500);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      let errorMessage = '';
      let errorType = 'unknown';

      if (error instanceof Error) {
        errorMessage = error.message;
        errorType = error.name;
      } else if (typeof error === 'string') {
        errorMessage = error;
        errorType = 'string_error';
      } else {
        errorMessage = smartCapitalize(language === 'es' ? 'error desconocido al procesar el documento.' : 'unknown error processing document.', 'sentence', language);
      }

      // Track failed processing
      analytics.trackDocumentProcessing('unknown', processingTime, false, errorType);

      Swal.fire({
        icon: 'error',
        title: smartCapitalize(language === 'es' ? 'error al procesar documento' : 'error processing document', 'sentence', language),
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
      setSelectedFile(files[0]);
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
      setSelectedFile(files[0]);
      handleFileUpload(files[0]);
    }
  };

  const getProgressColor = () => {
    switch (uploadState.status) {
      case 'ai_processing': return 'bg-purple-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-just-moss';
    }
  };

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'ai_processing': return <File className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      <Navbar />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start justify-start mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
            disabled={uploadState.status === 'uploading' || uploadState.status === 'processing' || uploadState.status === 'ai_processing'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">{smartCapitalize(t.back, 'sentence', language)}</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-just-forest dark:text-just-white mb-2 flex items-center justify-center">
            <Upload className="w-7 h-7 mr-3 text-just-moss" />
            {smartCapitalize(t.uploadDocument, 'sentence', language)}
          </h1>
          <p className="text-just-gray dark:text-gray-400 text-lg">
            {smartCapitalize(
              language === 'es' 
                ? 'sube archivos DOCX para procesamiento con IA avanzada'
                : 'upload DOCX files for advanced AI processing',
              'sentence',
              language
            )}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto">
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
                      <File className="w-12 h-12 text-blue-600" />
                    </div>
                    <p className="text-just-hunter dark:text-gray-300 mb-4 text-center font-medium">
                      {smartCapitalize(
                        language === 'es' 
                          ? 'arrastra y suelta tu archivo DOCX aquí'
                          : 'drag and drop your DOCX file here',
                        'sentence',
                        language
                      )}
                    </p>
                    <p className="text-sm text-just-gray dark:text-gray-400 mb-4 text-center">
                      {smartCapitalize(
                        language === 'es' 
                          ? 'solo archivos DOCX (Word) con procesamiento IA'
                          : 'only DOCX (Word) files with AI processing',
                        'sentence',
                        language
                      )}
                    </p>
                  </>
                )}

                {(uploadState.status === 'processing' || uploadState.status === 'ai_processing') && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      {getStatusIcon()}
                      <Loader2 className="w-8 h-8 text-just-moss animate-spin ml-2" />
                    </div>
                    <p className="text-just-hunter dark:text-gray-300 mt-4 font-medium">
                      {uploadState.message}
                    </p>
                    {uploadState.aiProgress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadState.aiProgress * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-just-gray dark:text-gray-400 mt-1">
                          {smartCapitalize(language === 'es' ? 'procesamiento IA...' : 'AI processing...', 'sentence', language)}
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
                    {smartCapitalize(language === 'es' ? 'seleccionar archivo DOCX' : 'select DOCX file', 'sentence', language)}
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {uploadState.status !== 'idle' && (
                <div className="mb-6">
                  <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${getProgressColor()}`}
                      style={{ width: `${uploadState.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-just-gray dark:text-gray-400">
                      {uploadState.progress}% - {uploadState.message}
                    </p>
                  </div>
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
                  <File className="w-4 h-4 mr-2" />
                  <span className="text-xs">DOCX</span>
                </div>
                <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="text-xs">
                    {smartCapitalize(language === 'es' ? 'máx 10MB' : 'max 10MB', 'sentence', language)}
                  </span>
                </div>
                <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                  <File className="w-4 h-4 mr-2" />
                  <span className="text-xs">
                    {smartCapitalize(language === 'es' ? 'Word document' : 'Word document', 'sentence', language)}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">
                      {smartCapitalize(language === 'es' ? '¿por qué solo DOCX?' : 'why only DOCX?', 'sentence', language)}
                    </p>
                    <p>
                      {smartCapitalize(
                        language === 'es' 
                          ? 'los archivos DOCX (Microsoft Word) permiten una extracción de texto más precisa y estructurada para nuestro sistema de IA, resultando en guías legales de mayor calidad.'
                          : 'DOCX (Microsoft Word) files allow for more accurate and structured text extraction for our AI system, resulting in higher quality legal guides.',
                        'sentence',
                        language
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}