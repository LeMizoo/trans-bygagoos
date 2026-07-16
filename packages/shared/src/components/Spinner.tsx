import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = '#6c63ff' }) => {
  const sizes = { sm: 24, md: 40, lg: 64 };
  const s = sizes[size];

  return (
    <div className="flex items-center justify-center">
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="animate-spin">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="31.4 31.4" opacity="0.2" />
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="31.4 31.4" strokeDashoffset="8" />
      </svg>
    </div>
  );
};
