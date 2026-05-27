'use client';

import React from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Simple helper function to trigger toasts easily anywhere in the application
export const toast = {
  success: (msg: string) => useToastStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useToastStore.getState().addToast(msg, 'error'),
  info: (msg: string) => useToastStore.getState().addToast(msg, 'info'),
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
            error: <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />,
            info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
          };

          const backgrounds = {
            success: 'bg-white border-l-4 border-l-emerald-500 border border-slate-100',
            error: 'bg-white border-l-4 border-l-rose-500 border border-slate-100',
            info: 'bg-white border-l-4 border-l-blue-500 border border-slate-100',
          };

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg ${backgrounds[t.type]}`}
            >
              <div className="flex items-center gap-3">
                {icons[t.type]}
                <span className="text-sm font-semibold text-text-primary">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-text-secondary hover:text-text-primary p-0.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
