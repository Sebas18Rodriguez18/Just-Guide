import React, { useState, useRef } from 'react';
import { Upload, Loader2, ArrowLeft, Info, Eye, AlertCircle, CheckCircle, File, Image, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { parseDocument } from '../utils/documentParser';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import { EnhancedOCRService } from '../utils/enhancedOCR';
import { AIService } from '../utils/aiService';
import { AnalyticsService } from '../utils/analyticsService';
import { smartCapitalize } from '../utils/textCapitalization';
import Swal from 'sweetalert2';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'ocr' | 'ai_processing' | 'success' | 'error';
  progress: number;
  message: string;
  error?: string;
  parseProgress?: number;
  ocrProgress?: number;
  aiProgress?: number;
}

export default function EnhancedUploadPage() {
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(language);
  const analytics = AnalyticsService.getInstance();
  const ocrService = EnhancedOCRService.getInstance();
  const aiService = AIService.getInstance();

  // Enhanced file type support
  const acceptedTypes = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/tiff': ['.tiff', '.tif']
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 15 * 1024 * 1024; // 15MB for images
    if (file.size > maxSize) {
      return smartCapitalize(language === 'es' ? 'el archivo debe ser menor a 15MB' : 'file size must be less than 15MB', 'sentence', language);
    }

    const isValidType = Object.keys(acceptedTypes).some(type => file.type === type) ||
                       Object.values(acceptedTypes).flat().some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      return smartCapitalize(
        language === 'es' 
          ? 'solo se admiten archivos DOCX, PDF e imágenes (JPG, PNG, TIFF)' 
          : 'only DOCX, PDF and image files (JPG, PNG, TIFF) are allowed',
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
      document_type: file.type.includes('image') ? 'IMAGE' : file.type.includes('pdf') ? 'PDF' : 'DOCX',
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
      analytics.trackDocumentUpload(
        file.type.includes('image') ? 'IMAGE' : file.type.includes('pdf') ? 'PDF' : 'DOCX',
        language,
        file.size
      );

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

      // Step 3: Process based on file type
      if (file.type.includes('image')) {
        // Enhanced OCR processing for images
        setUploadState({
          status: 'ocr',
          progress: 30,
          message: smartCapitalize(language === 'es' ? 'procesando imagen con OCR avanzado...' : 'processing image with advanced OCR...', 'sentence', language)
        });

        const ocrResult = await ocrService.extractTextFromImage(file, {
          language: language === 'es' ? 'spa' : 'eng',
          onProgress: (progress) => {
            setUploadState(prev => ({
              ...prev,
              progress: 30 + (progress.progress * 30),
              ocrProgress: progress.progress,
              message: progress.message
            }));
          }
        });

        extractedText = ocrResult.text;
        detectedLanguage = ocrResult.language;

      } else if (file.type.includes('pdf')) {
        // PDF processing (would require pdf.js integration)
        setUploadState({
          status: 'processing',
          progress: 40,
          message: smartCapitalize(language === 'es' ? 'procesando archivo PDF...' : 'processing PDF file...', 'sentence', language)
        });

        // For now, use existing document parser
        const parseResult = await parseDocument(file, (parseProgress) => {
          setUploadState(prev => ({
            ...prev,
            progress: 40 + (parseProgress * 20),
            parseProgress: parseProgress
          }));
        });

        extractedText = parseResult.extracted_text;
        detectedLanguage = parseResult.detected_language;

      } else {
        // DOCX processing
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
      }

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
            <p><strong>${smartCapitalize(language === 'es' ? 'tipo:' : 'type:', 'sentence', language)}</strong> ${file.type.includes('image') ? 'IMAGE' : file.type.includes('pdf') ? 'PDF' : 'DOCX'}</p>
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

  const handleFileSelect = (files: FileList | File[]) => {
    const file = Array.isArray(files) ? files[0] : files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.includes('image')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const getProgressColor = () => {
    switch (uploadState.status) {
      case 'ocr': return 'bg-blue-500';
      case 'ai_processing': return 'bg-purple-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-just-moss';
    }
  };

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'ocr': return <Eye className="w-5 h-5" />;
      case 'ai_processing': return <Zap className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Upload className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-just-beige dark:bg-gray-900">
      {/* Header */}
      <div className="bg-just-white dark:bg-gray-800 shadow-sm border-b border-just-sand dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-start mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-just-sand dark:bg-gray-700 text-just-hunter dark:text-gray-300 rounded-xl hover:bg-just-moss/20 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 shadow-md"
              disabled={uploadState.status === 'uploading' || uploadState.status === 'processing' || uploadState.status === 'ocr' || uploadState.status === 'ai_processing'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-medium">{smartCapitalize(t.back, 'sentence', language)}</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-just-forest dark:text-just-white mb-2 flex items-center justify-center">
              <Upload className="w-7 h-7 mr-3 text-just-moss" />
              {smartCapitalize(t.uploadDocument, 'sentence', language)}
              <Zap className="w-5 h-5 ml-2 text-purple-500" />
            </h1>
            <p className="text-just-gray dark:text-gray-400 text-lg">
              {smartCapitalize(
                language === 'es' 
                  ? 'sube archivos DOCX, PDF o imágenes - procesamiento con IA avanzada'
                  : 'upload DOCX, PDF or image files - advanced AI processing',
                'sentence',
                language
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-8">
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
                  <div className="mb-4 flex items-center space-x-2">
                    <File className="w-12 h-12 text-blue-600" />
                    <Image className="w-12 h-12 text-green-600" />
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-just-hunter dark:text-gray-300 mb-4 text-center font-medium">
                    {smartCapitalize(
                      language === 'es' 
                        ? 'arrastra y suelta tu archivo aquí'
                        : 'drag and drop your file here',
                      'sentence',
                      language
                    )}
                  </p>
                  <p className="text-sm text-just-gray dark:text-gray-400 mb-4 text-center">
                    {smartCapitalize(
                      language === 'es' 
                        ? 'DOCX, PDF e imágenes (JPG, PNG, TIFF) con procesamiento IA'
                        : 'DOCX, PDF and images (JPG, PNG, TIFF) with AI processing',
                      'sentence',
                      language
                    )}
                  </p>
                </>
              )}

              {(uploadState.status === 'processing' || uploadState.status === 'ocr' || uploadState.status === 'ai_processing') && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    {getStatusIcon()}
                    <Loader2 className="w-8 h-8 text-just-moss animate-spin ml-2" />
                  </div>
                  <p className="text-just-hunter dark:text-gray-300 mt-4 font-medium">
                    {uploadState.message}
                  </p>
                  {uploadState.ocrProgress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadState.ocrProgress * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-just-gray dark:text-gray-400 mt-1">
                        {smartCapitalize(language === 'es' ? 'procesamiento OCR...' : 'OCR processing...', 'sentence', language)}
                      </p>
                    </div>
                  )}
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

              {/* Preview for images */}
              {previewUrl && uploadState.status !== 'idle' && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-xs max-h-48 rounded-lg shadow-md"
                  />
                </div>
              )}

              <input
                type="file"
                accept=".docx,.pdf,.jpg,.jpeg,.png,.tiff,.tif"
                onChange={handleInputChange}
                ref={fileInputRef}
                className="hidden"
              />
              
              {uploadState.status === 'idle' && (
                <button
                  className="mt-4 bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest transition-all duration-200 flex items-center hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {smartCapitalize(language === 'es' ? 'seleccionar archivo' : 'select file', 'sentence', language)}
                  <Zap className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>

            {/* Enhanced Progress Bar */}
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
                  <div className="flex items-center space-x-1">
                    {uploadState.status === 'ocr' && <Eye className="w-4 h-4 text-blue-500" />}
                    {uploadState.status === 'ai_processing' && <Zap className="w-4 h-4 text-purple-500" />}
                  </div>
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

            {/* Enhanced File Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <File className="w-4 h-4 mr-2" />
                <span className="text-xs">DOCX/PDF</span>
              </div>
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <Image className="w-4 h-4 mr-2" />
                <span className="text-xs">
                  {smartCapitalize(language === 'es' ? 'imágenes OCR' : 'OCR images', 'sentence', language)}
                </span>
              </div>
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-xs">
                  {smartCapitalize(language === 'es' ? 'IA avanzada' : 'advanced AI', 'sentence', language)}
                </span>
              </div>
              <div className="flex items-center justify-center text-just-hunter dark:text-gray-400">
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-xs">
                  {smartCapitalize(language === 'es' ? 'máx 15MB' : 'max 15MB', 'sentence', language)}
                </span>
              </div>
            </div>

            {/* Enhanced Info Box */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <div className="flex items-center mr-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <Zap className="w-4 h-4 text-purple-500 ml-1" />
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">
                    {smartCapitalize(language === 'es' ? '¿por qué procesamiento con IA?' : 'why AI processing?', 'sentence', language)}
                  </p>
                  <p>
                    {smartCapitalize(
                      language === 'es' 
                        ? 'nuestro sistema combina OCR avanzado con IA de Hugging Face para extraer texto de cualquier formato y generar guías legales inteligentes.'
                        : 'our system combines advanced OCR with Hugging Face AI to extract text from any format and generate intelligent legal guides.',
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
  );
}