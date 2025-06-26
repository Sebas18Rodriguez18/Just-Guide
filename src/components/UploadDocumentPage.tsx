import React, { useState, useRef } from 'react';
import { Upload, Loader2, ArrowLeft, Info, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { getTranslations } from '../utils/i18n';
import { parseDocumentWithOCR } from '../utils/ocrService';
import { supabase } from '../utils/supabaseClient';
import { generateStepByStepGuide } from '../utils/guideGenerator';
import Swal from 'sweetalert2';

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  error?: string;
  ocrProgress?: number;
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

  // Eliminar referencias a currentUser, usar solo user del contexto
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

  // Reemplazar createDocumentRecord para insertar en Supabase
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
      document_type: file.type.includes('pdf') ? 'PDF' : 
                    file.type.includes('word') ? 'DOCX' : 'Image',
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

  // Reemplazar updateDocumentWithParsedData para actualizar en Supabase
  const updateDocumentWithParsedData = async (docId: string, extractedText: string, detectedLanguage: string): Promise<void> => {
    const { error } = await supabase.from('documents').update({
      extracted_text: extractedText,
      detected_language: detectedLanguage,
      status: 'completed',
      // processed_at eliminado porque no existe en la tabla
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
      // Step 2: Upload file
      setUploadState({
        status: 'uploading',
        progress: 25,
        message: t.uploading
      });
      const { publicUrl } = await uploadToSupabase(file);
      // Step 3: Create document record
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
      const docId = await createDocumentRecord(file, publicUrl);
      // Step 4: Parse document with real OCR
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

      // Step 5: Update document with parsed data
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

      // Step 6: Generar y guardar la guía paso a paso con datos reales
      setUploadState({
        status: 'processing',
        progress: 95,
        message: language === 'es'
          ? 'Generando guía paso a paso...'
          : language === 'fr'
          ? 'Génération du guide étape par étape...'
          : language === 'de'
          ? 'Schritt-für-Schritt-Anleitung wird erstellt...'
          : language === 'pt'
          ? 'Gerando guia passo a passo...'
          : language === 'ar'
          ? 'جارٍ إنشاء الدليل خطوة بخطوة...'
          : language === 'zh'
          ? '正在生成分步指南...'
          : language === 'hi'
          ? 'स्टेप-बाय-स्टेप गाइड बना रहे हैं...'
          : 'Generating step-by-step guide...'
      });

      const guide = await generateStepByStepGuide(extracted_text, language);
      await supabase.from('simplified_guides').insert([
        {
          document_id: docId,
          steps: guide.steps,
          summary: guide.summary,
          reading_level: guide.reading_level,
          created_at: new Date().toISOString()
        }
      ]);

      // Step 7: Success
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
        navigate(`/summary/${docId}`);
      }, 1500);

    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = language === 'es' ? 'Error desconocido al procesar el documento.' : 'Unknown error processing document.';
      }
      // Mostrar notificación clara
      Swal.fire({
        icon: 'error',
        title: language === 'es' ? 'Error al subir documento' : 'Error uploading document',
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
    <div className="min-h-screen flex items-center justify-center bg-just-beige dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-fade-in">
          <h2 className="text-xl font-bold text-just-forest dark:text-just-white mb-4 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-just-moss" /> {t.uploadDocument}
          </h2>
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 mb-6 transition-colors duration-200 ${dragActive ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20' : 'border-just-sand dark:border-gray-700 bg-just-beige/50 dark:bg-gray-900/30'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-just-hunter dark:text-gray-300 mb-2 text-center">
              {language === 'es' ? 'Arrastra y suelta aquí o selecciona un archivo.' : 'Drag and drop here or select a file.'}
            </p>
            <input
              type="file"
              accept=".pdf, .docx, .jpg, .jpeg, .png, .gif"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              className="mt-2 bg-just-moss text-just-white px-4 py-2 rounded-xl font-medium hover:bg-just-forest transition-colors duration-200 flex items-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState.status === 'uploading'}
            >
              {uploadState.status === 'uploading' ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Upload className="w-5 h-5 mr-2" />} 
              {uploadState.status === 'uploading' ? t.uploading : t.uploadDocument}
            </button>
          </div>
          {uploadState.status !== 'idle' && (
            <div className="mb-4">
              {uploadState.status === 'uploading' && (
                <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                  <div className="bg-just-moss h-3 rounded-full transition-all duration-300" style={{ width: `${uploadState.progress}%` }}></div>
                </div>
              )}
              {uploadState.status === 'error' && (
                <div className="flex items-center text-red-600 dark:text-red-400 mt-2">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{uploadState.error}</span>
                </div>
              )}
              {uploadState.status === 'success' && (
                <div className="flex items-center text-green-600 dark:text-green-400 mt-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>{language === 'es' ? '¡Documento procesado exitosamente!' : 'Document processed successfully!'}</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-just-hunter dark:text-gray-300 hover:text-just-forest dark:hover:text-just-moss transition-colors duration-200 mt-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> {language === 'es' ? 'Volver al inicio' : 'Back to Home'}
          </button>
          <div className="flex justify-center mt-6 space-x-4">
            <div className="flex items-center text-just-hunter dark:text-gray-400">
              <Info className="w-5 h-5 mr-1" />
              <span className="text-xs">PDF, DOCX, JPG, PNG, GIF</span>
            </div>
            <div className="flex items-center text-just-hunter dark:text-gray-400">
              <Eye className="w-5 h-5 mr-1" />
              <span className="text-xs">{language === 'es' ? 'Privado y seguro' : 'Private & secure'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}