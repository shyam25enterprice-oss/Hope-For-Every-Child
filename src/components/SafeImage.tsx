import {HeartHandshake} from 'lucide-react';
import {useState} from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({src, alt, className = '', fallbackTitle}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-orange-50 text-slate-600 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <HeartHandshake className="w-8 h-8 text-sky-600 mb-2" />
        <span className="text-xs font-medium text-slate-600 max-w-xs">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
