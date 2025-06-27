// ElevenLabs Voice Service for JustGuide
export interface VoiceConfig {
  voiceId: string;
  name: string;
  language: 'es' | 'en';
  gender: 'male' | 'female';
}

// ElevenLabs voice configurations
const VOICE_CONFIGS: VoiceConfig[] = [
  // Spanish voices
  {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - Spanish female
    name: 'Bella',
    language: 'es',
    gender: 'female'
  },
  {
    voiceId: 'ThT5KcBeYPX3keUQqHPh', // Diego - Spanish male
    name: 'Diego', 
    language: 'es',
    gender: 'male'
  },
  // English voices
  {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - English male
    name: 'Adam',
    language: 'en',
    gender: 'male'
  },
  {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - English female (multilingual)
    name: 'Bella',
    language: 'en', 
    gender: 'female'
  }
];

export class VoiceService {
  private static instance: VoiceService;
  private apiKey: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;

  private constructor() {
    // In production, this would come from environment variables
    // For demo purposes, we'll use a placeholder
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || null;
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public getVoiceForLanguage(language: 'es' | 'en', gender: 'male' | 'female' = 'female'): VoiceConfig {
    const voices = VOICE_CONFIGS.filter(v => v.language === language && v.gender === gender);
    return voices[0] || VOICE_CONFIGS[0];
  }

  public async synthesizeSpeech(
    text: string, 
    language: 'es' | 'en' = 'en',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        console.warn('ElevenLabs API key not configured. Using fallback TTS.');
        return this.fallbackTTS(text, language);
      }

      const voice = this.getVoiceForLanguage(language);
      
      if (onProgress) onProgress(0.1);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: this.cleanTextForSpeech(text),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (onProgress) onProgress(0.7);

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      if (onProgress) onProgress(1.0);

      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error);
      return this.fallbackTTS(text, language);
    }
  }

  private fallbackTTS(text: string, language: 'es' | 'en'): string {
    // Fallback to browser's Speech Synthesis API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(this.cleanTextForSpeech(text));
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Find appropriate voice
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(language)) || voices[0];
      if (voice) utterance.voice = voice;

      speechSynthesis.speak(utterance);
      return 'browser-tts'; // Special identifier for browser TTS
    }
    
    throw new Error('No TTS service available');
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      // Remove special characters that might cause issues
      .replace(/[^\w\s.,;:!?¡¿áéíóúñüÁÉÍÓÚÑÜ()-]/g, ' ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
      // Limit length for better performance
      .substring(0, 2500);
  }

  public async playText(
    text: string, 
    language: 'es' | 'en' = 'en',
    onProgress?: (progress: number) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.stop(); // Stop any current playback

      const audioUrl = await this.synthesizeSpeech(text, language, onProgress);
      
      if (audioUrl === 'browser-tts') {
        // Browser TTS is already playing
        if (onComplete) {
          // Estimate completion time for browser TTS
          const estimatedDuration = text.length * 50; // ~50ms per character
          setTimeout(onComplete, estimatedDuration);
        }
        return;
      }

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onloadeddata = () => {
        if (this.currentAudio) {
          this.isPlaying = true;
          this.currentAudio.play();
        }
      };
      
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        if (onComplete) onComplete();
        this.cleanup();
      };

      this.currentAudio.onerror = () => {
        this.isPlaying = false;
        const error = new Error('Audio playback failed');
        if (onError) onError(error);
        this.cleanup();
      };

    } catch (error) {
      this.isPlaying = false;
      if (onError) onError(error as Error);
    }
  }

  public pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
    
    // For browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play();
      this.isPlaying = true;
    }
    
    // For browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
    }
    
    // For browser TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    this.cleanup();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying || (speechSynthesis && speechSynthesis.speaking);
  }

  private cleanup(): void {
    if (this.currentAudio) {
      const audioUrl = this.currentAudio.src;
      if (audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      this.currentAudio = null;
    }
  }
}