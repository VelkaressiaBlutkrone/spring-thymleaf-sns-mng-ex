import React from 'react';
import { motion } from 'motion/react';
import { X, Navigation, Coffee, Utensils, Camera, Heart, Star, MapPin, ArrowRight } from 'lucide-react';
import { Pin, User, Post } from '../../types';
import { cn } from '../../utils/cn';

interface PinOverlayProps {
  pin: Pin;
  currentUser: User | null;
  associatedPost?: Post | null;
  onClose: () => void;
  onViewUser: (userId: number) => void;
  onGetDirections: (pin: Pin) => void;
  onViewPost?: (post: Post) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  default: MapPin,
  cafe: Coffee,
  food: Utensils,
  photo: Camera,
  favorite: Heart,
  'must-visit': Star,
};

const CATEGORY_COLORS: Record<string, string> = {
  default: 'bg-slate-500',
  cafe: 'bg-amber-500',
  food: 'bg-orange-500',
  photo: 'bg-blue-500',
  favorite: 'bg-pink-500',
  'must-visit': 'bg-yellow-500',
};

export const PinOverlay = ({
  pin,
  currentUser,
  associatedPost,
  onClose,
  onViewUser,
  onGetDirections,
  onViewPost
}: PinOverlayProps) => {
  const Icon = CATEGORY_ICONS[pin.category || 'default'] || MapPin;
  const colorClass = CATEGORY_COLORS[pin.category || 'default'] || 'bg-slate-500';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-5 w-72 -translate-x-1/2 -translate-y-12 relative z-50"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
            colorClass
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-800 truncate tracking-tight">{pin.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {pin.category || 'Location'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-300 hover:text-slate-600 p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {pin.description && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {pin.description}
          </p>
        </div>
      )}

      {associatedPost && (
        <div className="mb-4">
          <button 
            onClick={() => onViewPost?.(associatedPost)}
            className="w-full text-left bg-brand-50/50 border border-brand-100 rounded-2xl p-3 hover:bg-brand-50 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Linked Story</span>
            </div>
            {associatedPost.imageUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden mb-2 border border-brand-100/50">
                <img 
                  src={associatedPost.imageUrl} 
                  alt="Post preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {associatedPost.content}
            </p>
            <div className="mt-2 flex items-center justify-end text-[10px] font-bold text-brand-600 gap-1">
              <span>View Full Story</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        </div>
      )}

      <div className="mb-4">
        <button 
          onClick={() => onGetDirections(pin)}
          className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20 hover:bg-brand-700 transition-all text-sm group"
        >
          <Navigation className="w-4 h-4 fill-current" />
          <span>Get Directions</span>
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button 
          onClick={() => onViewUser(pin.userId)}
          className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[10px] text-brand-700 font-bold border-2 border-white shadow-sm">
            {pin.userName ? pin.userName[0] : '?'}
          </div>
          <span className="text-xs font-bold text-slate-600 group-hover:text-brand-600 transition-colors">
            {pin.userName || 'Unknown User'}
          </span>
        </button>
        <span className="text-[10px] font-bold text-slate-300 font-mono">
          {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
        </span>
      </div>
      {/* Arrow */}
      <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
    </motion.div>
  );
};
