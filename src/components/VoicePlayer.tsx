import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VoiceService } from '../utils/voiceService';
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
  const voiceService = VoiceService.getInstance();

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
      voiceService.pause();
      setIsPlaying(false);
    } else {
      if (voiceService.getIsPlaying()) {
        voiceService.stop();
      }
      
      setIsLoading(true);
      setProgress(0);
      
      try {
        await voiceService.playText(
          text,
          language,
          (progressValue) => setProgress(progressValue * 100),
          () => {
            setIsPlaying(false);
            setIsLoading(false);
            setProgress(0);
          },
          (error) => {
            console.error('Voice playback error:', error);
            setIsPlaying(false);
            setIsLoading(false);
            setProgress(0);
          }
        );
        setIsPlaying(true);
      } catch (error) {
        console.error('Voice synthesis error:', error);
      } finally {
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