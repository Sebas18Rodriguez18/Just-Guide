// Enhanced OCR Service with Tesseract.js Integration
import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  boundingBoxes?: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
}

export interface OCRProgress {
  status: string;
  progress: number;
  message: string;
}

export class EnhancedOCRService {
  private static instance: EnhancedOCRService;
  private worker: Tesseract.Worker | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): EnhancedOCRService {
    if (!EnhancedOCRService.instance) {
      EnhancedOCRService.instance = new EnhancedOCRService();
    }
    return EnhancedOCRService.instance;
  }

  public async initializeWorker(languages: string[] = ['eng', 'spa']): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker(languages, 1, {
        logger: (m) => {
          console.log(`OCR Worker: ${m.status} - ${Math.round(m.progress * 100)}%`);
        }
      });

      await this.worker.setParameters({
        tessedit_page_seg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        preserve_interword_spaces: '1',
        user_defined_dpi: '300'
      });

      this.isInitialized = true;
      console.log('Enhanced OCR Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw error;
    }
  }

  public async extractTextFromImage(
    imageFile: File | string,
    options: {
      language?: string;
      onProgress?: (progress: OCRProgress) => void;
      preserveLayout?: boolean;
    } = {}
  ): Promise<OCRResult> {
    const { language = 'eng+spa', onProgress, preserveLayout = true } = options;

    try {
      if (!this.isInitialized) {
        await this.initializeWorker();
      }

      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      // Enhanced progress tracking
      const progressCallback = (m: any) => {
        if (onProgress) {
          onProgress({
            status: m.status,
            progress: m.progress,
            message: this.getProgressMessage(m.status, language)
          });
        }
      };

      // Perform OCR with enhanced settings
      const result = await this.worker.recognize(imageFile, {
        logger: progressCallback
      });

      // Extract detailed information
      const boundingBoxes = this.extractBoundingBoxes(result.data);
      
      return {
        text: this.cleanExtractedText(result.data.text),
        confidence: result.data.confidence,
        language: this.detectLanguageFromOCR(result.data.text),
        boundingBoxes: preserveLayout ? boundingBoxes : undefined
      };

    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async extractTextFromPDF(
    pdfFile: File,
    options: {
      pageNumbers?: number[];
      onProgress?: (progress: OCRProgress) => void;
    } = {}
  ): Promise<OCRResult[]> {
    const { pageNumbers, onProgress } = options;

    try {
      // For PDF processing, we would typically:
      // 1. Convert PDF pages to images using pdf.js
      // 2. Process each image with OCR
      // 3. Combine results

      // For now, return a placeholder that indicates PDF processing capability
      if (onProgress) {
        onProgress({
          status: 'processing',
          progress: 0.5,
          message: 'Processing PDF pages...'
        });
      }

      // This would be implemented with pdf.js in a full production environment
      throw new Error('PDF OCR processing requires pdf.js integration - currently processing DOCX files directly');

    } catch (error) {
      console.error('PDF OCR failed:', error);
      throw error;
    }
  }

  public async preprocessImage(
    imageFile: File,
    options: {
      enhanceContrast?: boolean;
      removeNoise?: boolean;
      deskew?: boolean;
    } = {}
  ): Promise<string> {
    const { enhanceContrast = true, removeNoise = true, deskew = true } = options;

    try {
      // Create canvas for image preprocessing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Load image
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Apply preprocessing filters
          if (enhanceContrast) {
            this.enhanceContrast(ctx, canvas.width, canvas.height);
          }

          if (removeNoise) {
            this.removeNoise(ctx, canvas.width, canvas.height);
          }

          // Convert back to blob URL
          canvas.toBlob((blob) => {
            if (blob) {
              const processedUrl = URL.createObjectURL(blob);
              URL.revokeObjectURL(imageUrl);
              resolve(processedUrl);
            } else {
              reject(new Error('Failed to process image'));
            }
          }, 'image/png');
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw error;
    }
  }

  private extractBoundingBoxes(data: any): Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }> {
    const boxes: Array<{
      text: string;
      bbox: { x0: number; y0: number; x1: number; y1: number };
      confidence: number;
    }> = [];

    if (data.words) {
      data.words.forEach((word: any) => {
        if (word.text.trim() && word.confidence > 30) {
          boxes.push({
            text: word.text,
            bbox: {
              x0: word.bbox.x0,
              y0: word.bbox.y0,
              x1: word.bbox.x1,
              y1: word.bbox.y1
            },
            confidence: word.confidence
          });
        }
      });
    }

    return boxes;
  }

  private cleanExtractedText(text: string): string {
    return text
      // Fix common OCR errors
      .replace(/[|]/g, 'I')
      .replace(/[0]/g, 'O')
      .replace(/[5]/g, 'S')
      .replace(/[1]/g, 'l')
      // Clean up spacing
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      // Remove artifacts
      .replace(/[^\w\s\n.,;:!?¡¿()[\]{}"'-áéíóúñüÁÉÍÓÚÑÜ]/g, ' ')
      .trim();
  }

  private detectLanguageFromOCR(text: string): string {
    const spanishIndicators = /[ñáéíóúü]|[¡¿]/g;
    const spanishMatches = (text.match(spanishIndicators) || []).length;
    
    return spanishMatches > 5 ? 'es' : 'en';
  }

  private getProgressMessage(status: string, language: string): string {
    const messages: Record<string, Record<string, string>> = {
      'loading tesseract core': {
        es: 'Cargando motor OCR...',
        en: 'Loading OCR engine...'
      },
      'initializing tesseract': {
        es: 'Inicializando OCR...',
        en: 'Initializing OCR...'
      },
      'loading language traineddata': {
        es: 'Cargando datos de idioma...',
        en: 'Loading language data...'
      },
      'recognizing text': {
        es: 'Reconociendo texto...',
        en: 'Recognizing text...'
      }
    };

    return messages[status]?.[language] || messages[status]?.['en'] || status;
  }

  private enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Enhance contrast by stretching the histogram
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const factor = 1.5;
      
      data[i] = Math.min(255, Math.max(0, (data[i] - avg) * factor + avg));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - avg) * factor + avg));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - avg) * factor + avg));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private removeNoise(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Simple noise removal by median filtering
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 50 && data[i + 1] < 50 && data[i + 2] < 50) {
        // Make very dark pixels black
        data[i] = data[i + 1] = data[i + 2] = 0;
      } else if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
        // Make very light pixels white
        data[i] = data[i + 1] = data[i + 2] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  public async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}