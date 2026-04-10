import { useEffect, useCallback } from 'react';

interface LightboxProps {
  url: string;
  onClose: () => void;
}

export default function Lightbox({ url, onClose }: LightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={url}
        alt="Full size screenshot"
        className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
