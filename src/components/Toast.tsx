import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

type ToastDetail = {
  message: string;
  description?: string;
};

type ToastItem = ToastDetail & { id: number };

let toastId = 0;

export function showToast(message: string, description?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastDetail>('app-toast', { detail: { message, description } }));
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, ...detail }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 6000);
    };

    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  return (
    <div className="fixed top-20 right-4 z-[100] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3.5 shadow-xl"
          >
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-900">{toast.message}</p>
              {toast.description ? <p className="mt-0.5 text-xs text-zinc-500">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-zinc-400 hover:text-zinc-700"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
