import React from 'react';

interface HackathonBadgeProps {
  className?: string;
}

export default function HackathonBadge({ className = '' }: HackathonBadgeProps) {
  return (
    <div className={`hackathon-badge ${className}`}>
      <a
        href="https://worldslargesthackathon.devpost.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-transform duration-200 hover:scale-105"
        aria-label="World's Largest Hackathon Participant"
      >
        <img
          src="https://github.com/kickiniteasy/bolt-hackathon-badge/blob/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.png"
          alt="World's Largest Hackathon Participant"
          className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg"
          loading="lazy"
        />
      </a>
    </div>
  );
}