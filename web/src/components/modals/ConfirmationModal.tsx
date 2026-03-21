import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger'
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
          >
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg",
              variant === 'danger' ? "bg-red-50 text-red-500 shadow-red-100" : 
              variant === 'warning' ? "bg-amber-50 text-amber-500 shadow-amber-100" :
              "bg-blue-50 text-blue-500 shadow-blue-100"
            )}>
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95",
                  variant === 'danger' ? "bg-red-500 text-white shadow-red-200 hover:bg-red-600" :
                  variant === 'warning' ? "bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600" :
                  "bg-brand-600 text-white shadow-brand-200 hover:bg-brand-700"
                )}
              >
                {confirmLabel}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
