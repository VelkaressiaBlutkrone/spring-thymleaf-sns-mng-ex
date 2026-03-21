import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LiveAudioService } from '../services/liveAudioService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const serviceRef = useRef<LiveAudioService | null>(null);

  const toggleAssistant = async () => {
    if (isActive) {
      serviceRef.current?.disconnect();
      setIsActive(false);
      setIsListening(false);
      setTranscript('');
    } else {
      setIsConnecting(true);
      try {
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
          console.error("Gemini API Key is missing. Please check your environment variables.");
          setIsConnecting(false);
          return;
        }

        serviceRef.current = new LiveAudioService(apiKey);
        await serviceRef.current.connect({
          onMessage: (text) => {
            setTranscript(prev => prev + ' ' + text);
          },
          onInterrupted: () => {
            setTranscript(prev => prev + ' [Interrupted]');
          },
          onClose: () => {
            setIsActive(false);
            setIsListening(false);
          },
          onError: (err) => {
            console.error(err);
            setIsActive(false);
            setIsListening(false);
          }
        });

        setIsActive(true);
        setIsListening(true);
      } catch (err) {
        console.error(err);
        console.error("Failed to connect to Voice Assistant.");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      serviceRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-72 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Assistant</span>
              </div>
              <button 
                onClick={toggleAssistant}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="h-32 overflow-y-auto custom-scrollbar text-sm text-slate-600 leading-relaxed italic">
                {transcript || "I'm listening... How can I help you today?"}
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex gap-1 items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: isListening ? [8, 16, 8] : 8,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-1 bg-brand-500 rounded-full"
                    />
                  ))}
                </div>
                <Volume2 className="w-4 h-4 text-brand-600" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleAssistant}
        disabled={isConnecting}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all border-4 border-white/20",
          isActive 
            ? "bg-red-500 text-white" 
            : "bg-slate-800 text-white hover:bg-slate-900"
        )}
      >
        {isConnecting ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isActive ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <div className="relative">
            <Mic className="w-8 h-8" />
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-brand-400 animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
};
