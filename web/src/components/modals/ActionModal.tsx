import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, MessageSquare } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPin: () => void;
  onWritePost: () => void;
  address?: string;
}

export const ActionModal = ({
  isOpen,
  onClose,
  onAddPin,
  onWritePost,
  address
}: ActionModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Select Action</h2>
            {address && (
              <p className="text-xs text-slate-400 mb-6 text-center italic">{address}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onAddPin}
                className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all group border border-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6 text-brand-600" />
                </div>
                <span className="font-bold text-sm">Add Pin</span>
              </button>
              <button 
                onClick={onWritePost}
                className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all group border border-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-brand-600" />
                </div>
                <span className="font-bold text-sm">Write Post</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
