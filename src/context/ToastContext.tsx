import React, { createContext, useCallback, useContext, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  icon?: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', icon?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', icon?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const defaultIcon =
        type === 'success'
          ? 'check_circle'
          : type === 'warning'
          ? 'warning'
          : type === 'error'
          ? 'error'
          : 'info';

      const newToast: ToastMessage = {
        id,
        message,
        type,
        icon: icon || defaultIcon,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 3200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast container floating at bottom */}
      <div className="fixed bottom-20 md:bottom-8 right-0 left-0 md:left-auto md:right-8 z-50 pointer-events-none flex flex-col items-center md:items-end gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#2d3138] text-[#eef0fa] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-medium transition-all transform animate-fade-in max-w-md border border-[#dec0b7]/20"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ffdbcf] shrink-0">
              {toast.icon}
            </span>
            <span className="leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-[#dec0b7] hover:text-white p-0.5"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
