import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, ArrowLeft, Info } from 'lucide-react';
import { Language, getTranslations } from '../utils/i18n';

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

  const parseDocument = async (fileUrl: string, fileType: string): Promise<{ extracted_text: string; detected_language: string }> => {
    // Simulate calling the document-parser function with language context
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate occasional parsing failures
        if (Math.random() < 0.1) { // 10% chance of failure
          reject(new Error('Document unreadable'));
          return;
        }
        
        // Return content in the selected language
        const content = language === 'es' ? `CONTRATO DE ARRENDAMIENTO

## 1. Información de las personas
Arrendador: Juan Pérez García, mayor de edad, con domicilio en Calle Principal 123.
Arrendatario: María López Rodríguez, mayor de edad, con domicilio en Avenida Secundaria 456.

## 2. Qué se acuerda
El arrendador da en arrendamiento al arrendatario el inmueble ubicado en Calle Ejemplo 789, para uso habitacional.

## 3. Tiempo del acuerdo
El presente contrato tendrá una duración de 12 meses, iniciando el 1 de enero de 2024.

## 4. Dinero y pagos
La renta mensual será de $15,000.00 pesos mexicanos, pagadera los primeros cinco días de cada mes.

## 5. Garantías
El arrendatario entregará un depósito equivalente a dos meses de renta como garantía.

## 6. Obligaciones del propietario
- Entregar el inmueble en condiciones habitables
- Realizar reparaciones mayores
- Respetar el uso pacífico del inmueble

## 7. Obligaciones del inquilino
- Pagar la renta puntualmente
- Usar el inmueble conforme a su destino
- Conservar el inmueble en buen estado
- No subarrendar sin autorización

## 8. Cómo termina el acuerdo
El contrato podrá terminarse por vencimiento del plazo o por incumplimiento de cualquiera de las partes.`
        : language === 'fr' ? `CONTRAT DE LOCATION

## 1. Informations des personnes
Bailleur: Juan Pérez García, majeur, domicilié Calle Principal 123.
Locataire: María López Rodríguez, majeure, domiciliée Avenida Secundaria 456.

## 2. Ce qui est convenu
Le bailleur loue au locataire le bien immobilier situé Calle Ejemplo 789, à usage d'habitation.

## 3. Durée de l'accord
Le présent contrat aura une durée de 12 mois, commençant le 1er janvier 2024.

## 4. Argent et paiements
Le loyer mensuel sera de 15 000,00 pesos mexicains, payable dans les cinq premiers jours de chaque mois.

## 5. Garanties
Le locataire versera un dépôt équivalent à deux mois de loyer comme garantie.

## 6. Obligations du propriétaire
- Livrer le bien en conditions habitables
- Effectuer les réparations majeures
- Respecter l'usage paisible du bien

## 7. Obligations du locataire
- Payer le loyer ponctuellement
- Utiliser le bien conformément à sa destination
- Conserver le bien en bon état
- Ne pas sous-louer sans autorisation

## 8. Comment se termine l'accord
Le contrat pourra se terminer par expiration du délai ou par manquement de l'une des parties.`
        : `RENTAL AGREEMENT

## 1. Personal Information
Landlord: Juan Pérez García, of legal age, residing at Calle Principal 123.
Tenant: María López Rodríguez, of legal age, residing at Avenida Secundaria 456.

## 2. What is agreed
The landlord rents to the tenant the property located at Calle Ejemplo 789, for residential use.

## 3. Agreement duration
This contract will have a duration of 12 months, starting January 1, 2024.

## 4. Money and payments
The monthly rent will be $15,000.00 Mexican pesos, payable within the first five days of each month.

## 5. Guarantees
The tenant will provide a deposit equivalent to two months' rent as guarantee.

## 6. Landlord obligations
- Deliver the property in habitable conditions
- Perform major repairs
- Respect peaceful use of the property

## 7. Tenant obligations
- Pay rent punctually
- Use the property according to its intended purpose
- Keep the property in good condition
- Not sublease without authorization

## 8. How the agreement ends
The contract may be terminated by expiration of the term or by breach by either party.`;
        
        resolve({
          extracted_text: content,
          detected_language: language
        });
      }, 2000);
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

      // Step 3: Parse document
      setUploadState({
        status: 'processing',
        progress: 75,
        message: language === 'es' ? 'Extrayendo y analizando texto...'
          : language === 'fr' ? 'Extraction et analyse du texte...'
          : language === 'de' ? 'Text extrahieren und analysieren...'
          : language === 'pt' ? 'Extraindo e analisando texto...'
          : language === 'ar' ? 'استخراج وتحليل النص...'
          : language === 'zh' ? '提取和分析文本...'
          : language === 'hi' ? 'टेक्स्ट निकाल रहे हैं और विश्लेषण कर रहे हैं...'
          : 'Extracting and analyzing text...'
      });

      const fileType = file.type.includes('pdf') ? 'pdf' : 
                      file.type.includes('word') ? 'docx' : 'image';
      
      const { extracted_text, detected_language } = await parseDocument(fileUrl, fileType);

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
      const errorMessage = error instanceof Error && error.message === 'Document unreadable' 
        ? (language === 'es' ? 'Este documento no se pudo leer. Por favor intenta con un archivo diferente o asegúrate de que el documento contenga texto legible.'
          : language === 'fr' ? 'Ce document n\'a pas pu être lu. Veuillez essayer avec un fichier différent ou assurez-vous que le document contient du texte lisible.'
          : language === 'de' ? 'Dieses Dokument konnte nicht gelesen werden. Bitte versuchen Sie es mit einer anderen Datei oder stellen Sie sicher, dass das Dokument lesbaren Text enthält.'
          : language === 'pt' ? 'Este documento não pôde ser lido. Por favor, tente com um arquivo diferente ou certifique-se de que o documento contenha texto legível.'
          : language === 'ar' ? 'لا يمكن قراءة هذه الوثيقة. يرجى المحاولة بملف مختلف أو التأكد من أن الوثيقة تحتوي على نص قابل للقراءة.'
          : language === 'zh' ? '无法读取此文档。请尝试其他文件或确保文档包含可读文本。'
          : language === 'hi' ? 'यह दस्तावेज़ पढ़ा नहीं जा सका। कृपया एक अलग फ़ाइल आज़माएं या सुनिश्चित करें कि दस्तावेज़ में पठनीय टेक्स्ट है।'
          : 'This document could not be read. Please try a different file or ensure the document contains readable text.')
        : (language === 'es' ? 'Error al procesar el documento. Por favor intenta de nuevo.'
          : language === 'fr' ? 'Échec du traitement du document. Veuillez réessayer.'
          : language === 'de' ? 'Fehler beim Verarbeiten des Dokuments. Bitte versuchen Sie es erneut.'
          : language === 'pt' ? 'Falha ao processar documento. Por favor, tente novamente.'
          : language === 'ar' ? 'فشل في معالجة الوثيقة. يرجى المحاولة مرة أخرى.'
          : language === 'zh' ? '处理文档失败。请重试。'
          : language === 'hi' ? 'दस्तावेज़ प्रसंस्करण विफल। कृपया पुनः प्रयास करें।'
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
              {t.uploadSubtitle}
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          {uploadState.status === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-300 ${
                dragActive 
                  ? 'border-just-moss bg-just-moss/10 dark:bg-just-moss/20' 
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
                className="bg-just-brown dark:bg-just-moss text-just-white px-6 py-3 rounded-xl font-medium hover:bg-just-forest dark:hover:bg-just-brown focus:outline-none focus:ring-2 focus:ring-just-moss focus:ring-offset-2 transition-colors duration-300"
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
                {t.supportedFormats}
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
                {uploadState.status === 'uploading' ? t.uploading : t.processing}
              </h3>
              <p className="text-just-gray dark:text-gray-400 mb-6">
                {uploadState.message}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-just-sand dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-just-moss h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-just-gray dark:text-gray-400">
                {uploadState.progress}% {language === 'es' ? 'completado' 
                  : language === 'fr' ? 'terminé'
                  : language === 'de' ? 'abgeschlossen'
                  : language === 'pt' ? 'concluído'
                  : language === 'ar' ? 'مكتمل'
                  : language === 'zh' ? '完成'
                  : language === 'hi' ? 'पूर्ण'
                  : 'complete'
                }
              </p>
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
              <p className="text-sm text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Redirigiendo al resumen...'
                  : language === 'fr' ? 'Redirection vers le résumé...'
                  : language === 'de' ? 'Weiterleitung zur Zusammenfassung...'
                  : language === 'pt' ? 'Redirecionando para o resumo...'
                  : language === 'ar' ? 'إعادة التوجيه إلى الملخص...'
                  : language === 'zh' ? '重定向到摘要...'
                  : language === 'hi' ? 'सारांश पर रीडायरेक्ट कर रहे हैं...'
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
                {language === 'es' ? 'Error en la Subida'
                  : language === 'fr' ? 'Échec du Téléchargement'
                  : language === 'de' ? 'Upload Fehlgeschlagen'
                  : language === 'pt' ? 'Falha no Upload'
                  : language === 'ar' ? 'فشل التحميل'
                  : language === 'zh' ? '上传失败'
                  : language === 'hi' ? 'अपलोड विफल'
                  : 'Upload Failed'
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

        {/* Help Section */}
        <div className="bg-just-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h4 className="font-semibold text-just-forest dark:text-just-white mb-3 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            {language === 'es' ? '¿Qué pasa después?'
              : language === 'fr' ? 'Que se passe-t-il ensuite?'
              : language === 'de' ? 'Was passiert als nächstes?'
              : language === 'pt' ? 'O que acontece depois?'
              : language === 'ar' ? 'ماذا يحدث بعد ذلك؟'
              : language === 'zh' ? '接下来会发生什么？'
              : language === 'hi' ? 'आगे क्या होता है?'
              : 'What happens next?'
            }
          </h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-just-moss/20 dark:bg-just-moss/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-just-moss">1</span>
              </div>
              <p className="text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Extraeremos todo el texto de tu documento usando tecnología OCR avanzada'
                  : language === 'fr' ? 'Nous extrairons tout le texte de votre document en utilisant une technologie OCR avancée'
                  : language === 'de' ? 'Wir extrahieren den gesamten Text aus Ihrem Dokument mit fortschrittlicher OCR-Technologie'
                  : language === 'pt' ? 'Extrairemos todo o texto do seu documento usando tecnologia OCR avançada'
                  : language === 'ar' ? 'سنستخرج كل النص من وثيقتك باستخدام تقنية OCR المتقدمة'
                  : language === 'zh' ? '我们将使用先进的OCR技术从您的文档中提取所有文本'
                  : language === 'hi' ? 'हम उन्नत OCR तकनीक का उपयोग करके आपके दस्तावेज़ से सभी टेक्स्ट निकालेंगे'
                  : 'We\'ll extract all the text from your document using advanced OCR technology'
                }
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-just-moss/20 dark:bg-just-moss/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-just-moss">2</span>
              </div>
              <p className="text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Nuestra IA traducirá términos legales complejos a español claro en nivel B1'
                  : language === 'fr' ? 'Notre IA traduira les termes juridiques complexes en français clair au niveau B1'
                  : language === 'de' ? 'Unsere KI übersetzt komplexe Rechtsbegriffe in klares Deutsch auf B1-Niveau'
                  : language === 'pt' ? 'Nossa IA traduzirá termos jurídicos complexos para português claro no nível B1'
                  : language === 'ar' ? 'سيترجم الذكاء الاصطناعي المصطلحات القانونية المعقدة إلى عربية واضحة في المستوى B1'
                  : language === 'zh' ? '我们的AI将复杂的法律术语翻译成B1级别的清晰中文'
                  : language === 'hi' ? 'हमारा AI जटिल कानूनी शब्दों को B1 स्तर की स्पष्ट हिंदी में अनुवाद करेगा'
                  : 'Our AI will translate complex legal terms into plain language at B1 reading level'
                }
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-just-moss/20 dark:bg-just-moss/30 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-just-moss">3</span>
              </div>
              <p className="text-just-gray dark:text-gray-400">
                {language === 'es' ? 'Obtendrás un resumen claro y una guía opcional paso a paso para los próximos pasos'
                  : language === 'fr' ? 'Vous obtiendrez un résumé clair et un guide optionnel étape par étape pour les prochaines étapes'
                  : language === 'de' ? 'Sie erhalten eine klare Zusammenfassung und eine optionale Schritt-für-Schritt-Anleitung für die nächsten Schritte'
                  : language === 'pt' ? 'Você receberá um resumo claro e um guia opcional passo a passo para os próximos passos'
                  : language === 'ar' ? 'ستحصل على ملخص واضح ودليل اختياري خطوة بخطوة للخطوات التالية'
                  : language === 'zh' ? '您将获得清晰的摘要和可选的后续步骤指南'
                  : language === 'hi' ? 'आपको एक स्पष्ट सारांश और अगले चरणों के लिए एक वैकल्पिक चरणबद्ध गाइड मिलेगी'
                  : 'You\'ll get a clear summary and optional step-by-step guidance for next steps'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-just-moss/10 to-just-brown/10 dark:from-just-moss/20 dark:to-just-brown/20 rounded-2xl p-6">
          <h4 className="font-semibold text-just-forest dark:text-just-white mb-3">
            💡 {language === 'es' ? 'Consejos para mejores resultados'
              : language === 'fr' ? 'Conseils pour de meilleurs résultats'
              : language === 'de' ? 'Tipps für bessere Ergebnisse'
              : language === 'pt' ? 'Dicas para melhores resultados'
              : language === 'ar' ? 'نصائح للحصول على أفضل النتائج'
              : language === 'zh' ? '获得最佳结果的提示'
              : language === 'hi' ? 'बेहतर परिणामों के लिए सुझाव'
              : 'Tips for best results'
            }
          </h4>
          <ul className="space-y-2 text-just-gray dark:text-gray-400 text-sm">
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Asegúrate de que tu documento tenga texto claro y legible'
                : language === 'fr' ? 'Assurez-vous que votre document a un texte clair et lisible'
                : language === 'de' ? 'Stellen Sie sicher, dass Ihr Dokument klaren, lesbaren Text hat'
                : language === 'pt' ? 'Certifique-se de que seu documento tenha texto claro e legível'
                : language === 'ar' ? 'تأكد من أن وثيقتك تحتوي على نص واضح ومقروء'
                : language === 'zh' ? '确保您的文档具有清晰可读的文本'
                : language === 'hi' ? 'सुनिश्चित करें कि आपके दस्तावेज़ में स्पष्ट, पठनीय टेक्स्ट है'
                : 'Ensure your document has clear, readable text'
              }
            </li>
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Para imágenes, asegúrate de que el texto no esté borroso o muy pequeño'
                : language === 'fr' ? 'Pour les images, assurez-vous que le texte n\'est pas flou ou trop petit'
                : language === 'de' ? 'Stellen Sie bei Bildern sicher, dass der Text nicht unscharf oder zu klein ist'
                : language === 'pt' ? 'Para imagens, certifique-se de que o texto não esteja desfocado ou muito pequeno'
                : language === 'ar' ? 'بالنسبة للصور، تأكد من أن النص ليس ضبابيًا أو صغيرًا جدًا'
                : language === 'zh' ? '对于图像，确保文本不模糊或太小'
                : language === 'hi' ? 'छवियों के लिए, सुनिश्चित करें कि टेक्स्ट धुंधला या बहुत छोटा नहीं है'
                : 'For images, make sure the text is not blurry or too small'
              }
            </li>
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Los archivos PDF y DOCX generalmente proporcionan los mejores resultados'
                : language === 'fr' ? 'Les fichiers PDF et DOCX fournissent généralement les meilleurs résultats'
                : language === 'de' ? 'PDF- und DOCX-Dateien liefern in der Regel die besten Ergebnisse'
                : language === 'pt' ? 'Arquivos PDF e DOCX geralmente fornecem os melhores resultados'
                : language === 'ar' ? 'ملفات PDF و DOCX عادة ما تعطي أفضل النتائج'
                : language === 'zh' ? 'PDF和DOCX文件通常提供最佳结果'
                : language === 'hi' ? 'PDF और DOCX फ़ाइलें आमतौर पर सर्वोत्तम परिणाम प्रदान करती हैं'
                : 'PDF and DOCX files generally provide the best results'
              }
            </li>
            <li className="flex items-start">
              <span className="text-just-moss mr-2">•</span>
              {language === 'es' ? 'Los documentos en español se procesarán con mayor precisión'
                : language === 'fr' ? 'Les documents en français seront traités avec plus de précision'
                : language === 'de' ? 'Dokumente auf Deutsch werden genauer verarbeitet'
                : language === 'pt' ? 'Documentos em português serão processados com maior precisão'
                : language === 'ar' ? 'الوثائق باللغة العربية ستتم معالجتها بدقة أكبر'
                : language === 'zh' ? '中文文档将得到更准确的处理'
                : language === 'hi' ? 'हिंदी में दस्तावेज़ अधिक सटीकता से संसाधित होंगे'
                : 'Documents in your selected language will be processed more accurately'
              }
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}