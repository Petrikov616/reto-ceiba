'use client';
import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

const toastConfig: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    icon: '✕',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    icon: 'ℹ',
  },
};

// Hook global para usar toasts desde cualquier componente
let globalAddToast: ((type: ToastType, message: string) => void) | null = null;

export function useToast() {
  const addToast = useCallback((type: ToastType, message: string) => {
    if (globalAddToast) {
      globalAddToast(type, message);
    }
  }, []);

  return { addToast };
}

// Función estática para usar fuera de hooks (ej: en event handlers directos)
export function showToast(type: ToastType, message: string) {
  if (globalAddToast) {
    globalAddToast(type, message);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, type, message }]);

    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // Register global handler
  useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const config = toastConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              ${config.bg} ${config.border} ${config.text}
              border rounded-xl px-4 py-3 shadow-lg
              flex items-start gap-3
              pointer-events-auto
              ${toast.exiting ? 'toast-exit' : 'toast-enter'}
            `}
          >
            <span className="text-lg leading-none mt-0.5 font-bold flex-shrink-0">
              {config.icon}
            </span>
            <p className="text-sm flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity text-sm font-bold flex-shrink-0 ml-2"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
