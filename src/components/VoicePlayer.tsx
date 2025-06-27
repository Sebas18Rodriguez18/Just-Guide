import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Language } from '../utils/i18n';

interface VoicePlayerProps {
  text: string;
  language: Language;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VoicePlayer({ text, language, className = '', size = 'md' }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      // Stop speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setProgress(0);
      
      try {
        // Use browser's built-in speech synthesis
        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          
          // Find appropriate voice
          const voices = window.speechSynthesis.getVoices();
          const voice = voices.find(v => v.lang.startsWith(language)) || voices[0];
          if (voice) utterance.voice = voice;
          
          // Set up events
          utterance.onstart = () => {
            setIsPlaying(true);
            setIsLoading(false);
            setProgress(10);
          };
          
          utterance.onboundary = () => {
            setProgress(prev => Math.min(prev + 10, 90));
          };
          
          utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            setTimeout(() => setProgress(0), 500);
          };
          
          utterance.onerror = () => {
            setIsPlaying(false);
            setIsLoading(false);
            setProgress(0);
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis not supported');
        }
      } catch (error) {
        console.error('Voice synthesis error:', error);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]}
          bg-just-moss hover:bg-just-brown text-just-white rounded-full
          transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center shadow-md hover:shadow-lg
        `}
        title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
      >
        {isLoading ? (
          <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-just-white border-t-transparent`} />
        ) : isPlaying ? (
          <Pause className={iconSizes[size]} />
        ) : (
          <Play className={iconSizes[size]} />
        )}
      </button>
      
      {/* Progress indicator */}
      {(isLoading || isPlaying) && progress > 0 && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-just-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-just-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}