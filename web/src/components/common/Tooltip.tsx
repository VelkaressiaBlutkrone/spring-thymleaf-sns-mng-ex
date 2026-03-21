import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Tooltip = ({ children, label }: { children: React.ReactNode, label: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative flex flex-col items-center" 
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute -top-12 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50"
          >
            {label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
