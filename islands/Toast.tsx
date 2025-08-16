import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const toasts = signal<ToastMessage[]>([]);

export function showToast(toast: Omit<ToastMessage, 'id'>) {
  const id = crypto.randomUUID();
  const newToast = { ...toast, id };
  
  toasts.value = [...toasts.value, newToast];
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 5000);
}

export function removeToast(id: string) {
  toasts.value = toasts.value.filter(toast => toast.id !== id);
}

export default function ToastContainer() {
  const getToastStyles = (type: ToastMessage['type']) => {
    const baseClasses = "p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50/90 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50/90 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50/90 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200`;
      case 'info':
        return `${baseClasses} bg-blue-50/90 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200`;
      default:
        return `${baseClasses} bg-gray-50/90 dark:bg-gray-900/30 border-gray-500 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.value.map((toast) => (
        <div
          key={toast.id}
          class={`${getToastStyles(toast.type)} transform transition-all duration-300 ease-in-out animate-slide-in-right`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-sm opacity-90 mt-1">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}