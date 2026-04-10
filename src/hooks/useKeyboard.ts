import { useEffect, useCallback } from 'react';

export function useKeyboard(handlers: {
  onLeft?: () => void;
  onRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlers.onLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handlers.onRight?.();
        break;
      case 'Home':
        e.preventDefault();
        handlers.onHome?.();
        break;
      case 'End':
        e.preventDefault();
        handlers.onEnd?.();
        break;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
