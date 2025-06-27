// Enhanced AI Service with Hugging Face Integration
import { HfInference } from '@huggingface/inference';

export interface AIServiceConfig {
  provider: 'huggingface' | 'openai' | 'local';
  apiKey?: string;
  model?: string;
}

export interface SimplificationResult {
  simplifiedText: string;
  readingLevel: string;
  confidence: number;
  keyTerms: string[];
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  supportedLanguages: string[];
}

export class AIService {
  private static instance: AIService;
  private hf: HfInference | null = null;
  private config: AIServiceConfig;

  private constructor() {
    this.config = {
      provider: 'huggingface',
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
      model: 'microsoft/DialoGPT-medium'
    };

    if (this.config.apiKey) {
      this.hf = new HfInference(this.config.apiKey);
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Enhanced language detection using Hugging Face
  public async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      if (this.hf) {
        // Use Hugging Face language detection model
        const result = await this.hf.textClassification({
          model: 'facebook/fasttext-language-identification',
          inputs: text.substring(0, 500) // Limit input for performance
        });

        if (result && Array.isArray(result) && result.length > 0) {
          const topResult = result[0];
          return {
            language: this.mapLanguageCode(topResult.label),
            confidence: topResult.score,
            supportedLanguages: ['es', 'en', 'fr', 'pt', 'de']
          };
        }
      }

      // Fallback to local detection
      return this.fallbackLanguageDetection(text);
    } catch (error) {
      console.error('Hugging Face language detection failed:', error);
      return this.fallbackLanguageDetection(text);
    }
  }

  // Enhanced text simplification using Hugging Face
  public async simplifyLegalText(
    text: string, 
    targetLanguage: string = 'en',
    readingLevel: string = 'B1'
  ): Promise<SimplificationResult> {
    try {
      if (this.hf && text.length > 50) {
        // Use Hugging Face text simplification
        const prompt = this.buildSimplificationPrompt(text, targetLanguage, readingLevel);
        
        const result = await this.hf.textGeneration({
          model: 'facebook/bart-large-cnn',
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.3,
            do_sample: true,
            top_p: 0.9
          }
        });

        if (result && result.generated_text) {
          const simplifiedText = this.extractSimplifiedText(result.generated_text, prompt);
          return {
            simplifiedText,
            readingLevel,
            confidence: 0.85,
            keyTerms: this.extractKeyTerms(simplifiedText)
          };
        }
      }

      // Fallback to local simplification
      return this.fallbackSimplification(text, targetLanguage, readingLevel);
    } catch (error) {
      console.error('Hugging Face simplification failed:', error);
      return this.fallbackSimplification(text, targetLanguage, readingLevel);
    }
  }

  // Enhanced summarization using Hugging Face
  public async summarizeDocument(
    text: string, 
    language: string = 'en',
    maxLength: number = 300
  ): Promise<{ summary: string; keyPoints: string[] }> {
    try {
      if (this.hf && text.length > 100) {
        const result = await this.hf.summarization({
          model: 'facebook/bart-large-cnn',
          inputs: text.substring(0, 2000), // Limit input for performance
          parameters: {
            max_length: maxLength,
            min_length: 50,
            do_sample: false
          }
        });

        if (result && result.summary_text) {
          return {
            summary: result.summary_text,
            keyPoints: this.extractKeyPoints(result.summary_text, language)
          };
        }
      }

      // Fallback to local summarization
      return this.fallbackSummarization(text, language);
    } catch (error) {
      console.error('Hugging Face summarization failed:', error);
      return this.fallbackSummarization(text, language);
    }
  }

  // Translation using Hugging Face
  public async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      if (this.hf && sourceLanguage !== targetLanguage) {
        const modelName = this.getTranslationModel(sourceLanguage, targetLanguage);
        
        const result = await this.hf.translation({
          model: modelName,
          inputs: text
        });

        if (result && result.translation_text) {
          return result.translation_text;
        }
      }

      return text; // Return original if translation fails
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }

  // Helper methods
  private mapLanguageCode(hfLabel: string): string {
    const mapping: Record<string, string> = {
      '__label__es': 'es',
      '__label__en': 'en',
      '__label__fr': 'fr',
      '__label__pt': 'pt',
      '__label__de': 'de',
      'LABEL_es': 'es',
      'LABEL_en': 'en',
      'LABEL_fr': 'fr',
      'LABEL_pt': 'pt',
      'LABEL_de': 'de'
    };
    return mapping[hfLabel] || 'en';
  }

  private buildSimplificationPrompt(text: string, language: string, level: string): string {
    const prompts = {
      es: `Simplifica el siguiente texto legal para un nivel de lectura ${level}. Usa palabras simples y oraciones cortas:\n\n${text}\n\nTexto simplificado:`,
      en: `Simplify the following legal text for a ${level} reading level. Use simple words and short sentences:\n\n${text}\n\nSimplified text:`
    };
    return prompts[language as keyof typeof prompts] || prompts.en;
  }

  private extractSimplifiedText(generated: string, prompt: string): string {
    return generated.replace(prompt, '').trim();
  }

  private extractKeyTerms(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const legalTerms = words.filter(word => 
      word.length > 5 && 
      (word.includes('contract') || word.includes('legal') || word.includes('law') ||
       word.includes('contrato') || word.includes('ley') || word.includes('derecho'))
    );
    return [...new Set(legalTerms)].slice(0, 5);
  }

  private extractKeyPoints(summary: string, language: string): string[] {
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }

  private getTranslationModel(source: string, target: string): string {
    const models: Record<string, string> = {
      'es-en': 'Helsinki-NLP/opus-mt-es-en',
      'en-es': 'Helsinki-NLP/opus-mt-en-es',
      'fr-en': 'Helsinki-NLP/opus-mt-fr-en',
      'en-fr': 'Helsinki-NLP/opus-mt-en-fr'
    };
    return models[`${source}-${target}`] || 'Helsinki-NLP/opus-mt-en-es';
  }

  // Fallback methods for when Hugging Face is unavailable
  private fallbackLanguageDetection(text: string): LanguageDetectionResult {
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'];
    const englishWords = ['the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that'];
    
    const words = text.toLowerCase().split(/\s+/).slice(0, 50);
    const spanishCount = words.filter(w => spanishWords.includes(w)).length;
    const englishCount = words.filter(w => englishWords.includes(w)).length;
    
    return {
      language: spanishCount > englishCount ? 'es' : 'en',
      confidence: Math.max(spanishCount, englishCount) / words.length,
      supportedLanguages: ['es', 'en']
    };
  }

  private fallbackSimplification(text: string, language: string, level: string): SimplificationResult {
    // Basic text simplification rules
    let simplified = text
      .replace(/\b(nevertheless|however)\b/gi, 'but')
      .replace(/\b(therefore|consequently)\b/gi, 'so')
      .replace(/\b(furthermore|additionally)\b/gi, 'also')
      .replace(/\b(sin embargo|no obstante)\b/gi, 'pero')
      .replace(/\b(por consiguiente|por lo tanto)\b/gi, 'por eso');

    return {
      simplifiedText: simplified,
      readingLevel: level,
      confidence: 0.7,
      keyTerms: this.extractKeyTerms(simplified)
    };
  }

  private fallbackSummarization(text: string, language: string): { summary: string; keyPoints: string[] } {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    const keyPoints = sentences.slice(0, 5).map(s => s.trim());
    
    return { summary, keyPoints };
  }
}