import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mapTypeId: "ROADMAP" | "HYBRID";
  setMapTypeId: (type: "ROADMAP" | "HYBRID") => void;
}

export const SettingsOverlay = ({
  isOpen,
  onClose,
  mapTypeId,
  setMapTypeId
}: SettingsOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-24 right-8 z-20 w-80 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-brand-600" />
              Map Settings
            </h3>
            <button onClick={onClose}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Map View</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setMapTypeId("ROADMAP")}
                  className={cn(
                    "py-3 rounded-2xl text-xs font-bold transition-all border",
                    mapTypeId === "ROADMAP" 
                      ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-200" 
                      : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                  )}
                >
                  Roadmap
                </button>
                <button 
                  onClick={() => setMapTypeId("HYBRID")}
                  className={cn(
                    "py-3 rounded-2xl text-xs font-bold transition-all border",
                    mapTypeId === "HYBRID" 
                      ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-200" 
                      : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                  )}
                >
                  Satellite
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Options</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-medium text-slate-600">Show Markers</span>
                  <div className="w-10 h-5 bg-brand-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-medium text-slate-600">Dark Mode</span>
                  <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
