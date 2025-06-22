import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, ArrowLeft, Info, Eye } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';
import { parseDocumentWithOCR } from '../utils/ocrService';

interface UploadDocumentPageProps {
  onNavigateBack: () => void;
  onNavigateToSummary: (docId: string) => void;
  userId: string;
  language: Language;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  error?: string;
  ocrProgress?: number;
}

export default function UploadDocumentPage({ 
  onNavigateBack, 
  onNavigateToSummary, 
  userId,
  language 
}: UploadDocumentPageProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(language);

  const acceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif']
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      return language === 'es' ? 'El archivo debe ser menor a 10MB' 
        : language === 'fr' ? 'Le fichier doit faire moins de 10 Mo'
        : language === 'de' ? 'Die Datei muss kleiner als 10 MB sein'
        : language === 'pt' ? 'O arquivo deve ter menos de 10MB'
        : language === 'ar' ? 'يجب أن يكون حجم الملف أقل من 10 ميجابايت'
        : language === 'zh' ? '文件大小必须小于10MB'
        : language === 'hi' ? 'फ़ाइल का आकार 10MB से कम होना चाहिए'
        : 'File size must be less than 10MB';
    }

    const isValidType = Object.keys(acceptedTypes).includes(file.type) ||
      file.name.toLowerCase().match(/\.(pdf|docx|jpg|jpeg|png|gif)$/);
    
    if (!isValidType) {
      return language === 'es' ? 'Por favor sube un archivo PDF, DOCX o imagen (JPG, PNG, GIF)'
        : language === 'fr' ? 'Veuillez télécharger un fichier PDF, DOCX ou image (JPG, PNG, GIF)'
        : language === 'de' ? 'Bitte laden Sie eine PDF-, DOCX- oder Bilddatei (JPG, PNG, GIF) hoch'
        : language === 'pt' ? 'Por favor, envie um arquivo PDF, DOCX ou imagem (JPG, PNG, GIF)'
        : language === 'ar' ? 'يرجى تحميل ملف PDF أو DOCX أو صورة (JPG، PNG، GIF)'
        : language === 'zh' ? '请上传PDF、DOCX或图像文件（JPG、PNG、GIF）'
        : language === 'hi' ? 'कृपया PDF, DOCX या छवि फ़ाइल (JPG, PNG, GIF) अपलोड करें'
        : 'Please upload a PDF, DOCX, or image file (JPG, PNG, GIF)';
    }

    return null;
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    // Simulate Supabase storage upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/storage/documents/${userId}/${Date.now()}-${file.name}`);
      }, 1500);
    });
  };

  const createDocumentRecord = async (file: File, fileUrl: string): Promise<string> => {
    // Simulate creating document record
    const documentData = {
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      document_type: file.type.includes('pdf') ? 'PDF' : 
                    file.type.includes('word') ? 'DOCX' : 'Image',
      language: language, // Use selected language
      file_url: fileUrl,
      user_id: userId,
      upload_date: new Date().toISOString()
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('doc-' + Date.now()); // Mock document ID
      }, 500);
    });
  };

  const updateDocumentWithParsedData = async (docId: string, extractedText: string, detectedLanguage: string): Promise<void> => {
    // Simulate updating document with parsed data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
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
      // Step 1: Upload file
      setUploadState({
        status: 'uploading',
        progress: 25,
        message: t.uploading
      });

      const fileUrl = await uploadToSupabase(file);

      // Step 2: Create document record
      setUploadState({
        status: 'uploading',
        progress: 50,
        message: language === 'es' ? 'Creando registro del documento...' 
          : language === 'fr' ? 'Création de l\'enregistrement du document...'
          : language === 'de' ? 'Erstelle Dokumenteneintrag...'
          : language === 'pt' ? 'Criando registro do documento...'
          : language === 'ar' ? 'إنشاء سجل الوثيقة...'
          : language === 'zh' ? '创建文档记录...'
          : language === 'hi' ? 'दस्तावेज़ रिकॉर्ड बना रहे हैं...'
          : 'Creating document record...'
      });

      const docId = await createDocumentRecord(file, fileUrl);

      // Step 3: Parse document with real OCR
      setUploadState({
        status: 'processing',
        progress: 60,
        message: language === 'es' ? 'Extrayendo texto con IA...'
          : language === 'fr' ? 'Extraction de texte avec IA...'
          : language === 'de' ? 'Text mit KI extrahieren...'
          : language === 'pt' ? 'Extraindo texto com IA...'
          : language === 'ar' ? 'استخراج النص بالذكاء الاصطناعي...'
          : language === 'zh' ? '使用AI提取文本...'
          : language === 'hi' ? 'AI के साथ टेक्स्ट निकाल रहे हैं...'
          : 'Extracting text with AI...'
      });

      const { extracted_text, detected_language, confidence } = await parseDocumentWithOCR(
        file, 
        language,
        (ocrProgress) => {
          setUploadState(prev => ({
            ...prev,
            progress: 60 + (ocrProgress * 20), // OCR takes 20% of total progress
            ocrProgress: ocrProgress
          }));
        }
      );

      if (confidence < 0.5) {
        throw new Error('Document text quality too low for reliable processing');
      }

      // Step 4: Update document with parsed data
      setUploadState({
        status: 'processing',
        progress: 90,
        message: language === 'es' ? 'Finalizando documento...'
          : language === 'fr' ? 'Finalisation du document...'
          : language === 'de' ? 'Dokument fertigstellen...'
          : language === 'pt' ? 'Finalizando documento...'
          : language === 'ar' ? 'إنهاء الوثيقة...'
          : language === 'zh' ? '完成文档...'
          : language === 'hi' ? 'दस्तावेज़ को अंतिम रूप दे रहे हैं...'
          : 'Finalizing document...'
      });

      await updateDocumentWithParsedData(docId, extracted_text, detected_language);

      // Step 5: Success
      setUploadState({
        status: 'success',
        progress: 100,
        message: language === 'es' ? '¡Documento procesado exitosamente!'
          : language === 'fr' ? 'Document traité avec succès!'
          : language === 'de' ? 'Dokument erfolgreich verarbeitet!'
          : language === 'pt' ? 'Documento processado com sucesso!'
          : language === 'ar' ? 'تم معالجة الوثيقة بنجاح!'
          : language === 'zh' ? '文档处理成功！'
          : language === 'hi' ? 'दस्तावेज़ सफलतापूर्वक संसाधित!'
          : 'Document processed successfully!'
      });

      // Redirect to summary page after a brief delay
      setTimeout(() => {
        onNavigateToSummary(docId);
      }, 1500);

    } catch (error) {
      const errorMessage = error instanceof Error && error.message.includes('quality too low')
        ? (language === 'es' ? 'La calidad del texto en el documento es demasiado baja. Por favor, intenta con una imagen más clara o un documento de mejor calidad.'
          : language === 'fr' ? 'La qualité du texte dans le document est trop faible. Veuillez essayer avec une image plus claire ou un document de meilleure qualité.'
          : 'Document text quality is too low. Please try with a clearer image or better quality document.')
        : error instanceof Error && error.message === 'Document unreadable' 
        ? (language === 'es' ? 'Este documento no se pudo leer. Por favor intenta con un archivo diferente o asegúrate de que el documento contenga texto legible.'
          : language === 'fr' ? 'Ce document n\'a pas pu être lu. Veuillez essayer avec un fichier différent ou assurez-vous que le document contient du texte lisible.'
          : 'This document could not be read. Please try a different file or ensure the document contains readable text.')
        : (language === 'es' ? 'Error al procesar el documento. Por favor intenta de nuevo.'
          : language === 'fr' ? 'Échec du traitement du document. Veuillez réessayer.'
          : 'Failed to process document. Please try again.');

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

  const resetUpload = () => {
    setUploadState({
      status: 'idle',
      progress: 0,
      message: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-just-beige to-just-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onNavigateBack}
            className="inline-flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-just-forest dark:bg-just-moss rounded-2xl mb-4 shadow-lg">
              <Upload className="w-8 h-8 text-just-white" />
            </div>
            <h1 className="text-3xl font-bold text-just-forest dark:text-just-white mb-2">
              {t.uploadTitle}
            </h1>
            <p className="text-just-hunter dark:text-gray-300 text-lg">
              {language === 'es' ? 'Sube tu documento legal y nuestra IA lo simplificará usando OCR avanzado'
                : language === 'fr' ? 'Téléchargez votre document juridique et notre IA le simplifiera avec OCR avancé'
                : 'Upload your legal document and our AI will simplify it using advanced OCR'
              }
            </p>
          </div>
        </div>

        {/* Welcome Guide */}
        {showWelcome && uploadState.status === 'idle' && (
          <div className="bg-gradient-to-r from-just-moss/10 to-just-brown/10 dark:from-just-moss/20 dark:to-just-brown/20 rounded-2xl p-6 mb-6 border border-just-moss/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-just-forest dark:text-just-white mb-2 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  {language === 'es' ? '¡Bienvenido a JustGuide!' : 'Welcome to JustGuide!'}
                </h3>
                <p className="text-just-hunter dark:text-gray-300 text-sm mb-3">
                  {language === 'es' 
                    ? 'Estás a punto de experimentar cómo la IA puede transformar documentos legales complejos en guías claras y accionables.'
                    : 'You\'re about to experience how AI can transform complex legal documents into clear, actionable guides.'
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-just-moss/20 text-just-forest dark:text-just-moss px-2 py-1 rounded-lg text-xs font-medium">
                    {language === 'es' ? 'OCR Inteligente' : 'Smart OCR'}
                  </span>
                  <span className="bg-just-brown/20 text-just-forest dark:text-just-brown px-2 py-1 rounded-lg text-xs font-medium">
                    {language === 'es' ? 'Multiidioma' : 'Multilingual'}
                  </span>
                  <span className="bg-just-forest/20 text-just-forest dark:text-just-forest px-2 py-1 rounded-lg text-xs font-medium">
                    {language === 'es' ? 'Jurisdicción Inteligente' : 'Smart Jurisdiction'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-just-gray hover:text-just-forest dark:hover:text-just-white transition-colors duration-200 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          {uploadState.status === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20 scale-105' 
                  : 'border-just-sand dark:border-gray-600 hover:border-just-moss hover:bg-just-moss/5 dark:hover:bg-just-moss/10'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="w-16 h-16 bg-just-sand dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-just-hunter dark:text-gray-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
                {t.dropDocument}
              </h3>
              <p className="text-just-gray dark:text-gray-400 mb-6">
                {language === 'es' ? 'o haz clic para buscar tus archivos'
                  : language === 'fr' ? 'ou cliquez pour parcourir vos fichiers'
                  : language === 'de' ? 'oder klicken Sie, um Ihre Dateien zu durchsuchen'
                  : language === 'pt' ? 'ou clique para navegar pelos seus arquivos'
                  : language === 'ar' ? 'أو انقر لتصفح ملفاتك'
                  : language === 'zh' ? '或点击浏览您的文件'
                  : language === 'hi' ? 'या अपनी फ़ाइलों को ब्राउज़ करने के लिए क्लिक करें'
                  : 'or click to browse your files'
                }
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-all duration-300 hover:scale-105"
              >
                {t.chooseFile}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-sm text-just-gray dark:text-gray-400 mt-4">
                {language === 'es' ? 'Formatos: PDF, DOCX, JPG, PNG, GIF (máx 10MB) • OCR inteligente incluido'
                  : 'Formats: PDF, DOCX, JPG, PNG, GIF (max 10MB) • Smart OCR included'
                }
              </p>
            </div>
          )}

          {/* Processing States */}
          {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
            <div className="text-center">
              <div className="w-16 h-16 bg-just-moss/20 dark:bg-just-moss/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-just-moss animate-spin" />
              </div>
              
              <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
                {uploadState.status === 'uploading' ? t.uploading : 
                 language === 'es' ? 'Procesando con IA' : 'Processing with AI'}
              </h3>
              <p className="text-just-gray dark:text-gray-400 mb-6">
                {uploadState.message}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-just-moss to-just-brown h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-just-gray dark:text-gray-400">
                  {uploadState.progress}% {language === 'es' ? 'completado' : 'complete'}
                </span>
                {uploadState.ocrProgress !== undefined && (
                  <span className="text-just-moss font-medium">
                    OCR: {Math.round(uploadState.ocrProgress * 100)}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Success State */}
          {uploadState.status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
                {t.success}
              </h3>
              <p className="text-just-gray dark:text-gray-400 mb-4">
                {uploadState.message}
              </p>
              <p className="text-sm text-just-moss font-medium">
                {language === 'es' ? 'Redirigiendo al resumen...'
                  : 'Redirecting to summary...'
                }
              </p>
            </div>
          )}

          {/* Error State */}
          {uploadState.status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-just-forest dark:text-just-white mb-2">
                {language === 'es' ? 'Error en el Procesamiento'
                  : 'Processing Failed'
                }
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-6">
                {uploadState.error}
              </p>
              
              <button
                onClick={resetUpload}
                className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
              >
                {t.tryAgain}
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Help Section */}
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h4 className="font-semibold text-just-forest dark:text-just-white mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            {language === 'es' ? 'Tecnología Avanzada de IA'
              : 'Advanced AI Technology'
            }
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-just-beige/50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-8 h-8 bg-just-moss/20 dark:bg-just-moss/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-just-moss font-bold">1</span>
              </div>
              <h5 className="font-medium text-just-forest dark:text-just-white mb-1">
                {language === 'es' ? 'OCR Inteligente' : 'Smart OCR'}
              </h5>
              <p className="text-xs text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Extrae texto de imágenes y documentos escaneados con precisión'
                  : 'Extracts text from images and scanned documents with precision'
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-just-beige/50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-8 h-8 bg-just-brown/20 dark:bg-just-brown/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-just-brown font-bold">2</span>
              </div>
              <h5 className="font-medium text-just-forest dark:text-just-white mb-1">
                {language === 'es' ? 'IA Legal' : 'Legal AI'}
              </h5>
              <p className="text-xs text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Simplifica términos legales complejos según tu jurisdicción'
                  : 'Simplifies complex legal terms based on your jurisdiction'
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-just-beige/50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-8 h-8 bg-just-forest/20 dark:bg-just-forest/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-just-forest font-bold">3</span>
              </div>
              <h5 className="font-medium text-just-forest dark:text-just-white mb-1">
                {language === 'es' ? 'Guía Personalizada' : 'Personal Guide'}
              </h5>
              <p className="text-xs text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Genera pasos específicos basados en tu documento'
                  : 'Generates specific steps based on your document'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-just-moss/10 to-just-brown/10 dark:from-just-moss/20 dark:to-just-brown/20 rounded-2xl p-6">
          <h4 className="font-semibold text-just-forest dark:text-just-white mb-3">
            💡 {language === 'es' ? 'Consejos para mejores resultados'
              : 'Tips for best results'
            }
          </h4>
          <ul className="space-y-2 text-just-gray dark:text-gray-400 text-sm">
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Para imágenes: usa buena iluminación y enfoque nítido'
                : 'For images: use good lighting and sharp focus'
              }
            </li>
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Los documentos en español, inglés, francés y portugués tienen mejor precisión'
                : 'Documents in Spanish, English, French, and Portuguese have better accuracy'
              }
            </li>
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Los archivos PDF nativos se procesan más rápido que las imágenes'
                : 'Native PDF files process faster than images'
              }
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}