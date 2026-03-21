import React from 'react';
import { X, Navigation, Phone, Globe, MapPin, Clock, ExternalLink, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface PlaceOverlayProps {
  place: {
    name: string;
    address: string;
    phone?: string;
    category?: string;
    url?: string;
    lat: number;
    lng: number;
  };
  onClose: () => void;
  onGetDirections: (target: { lat: number, lng: number, name: string }) => void;
  onShare: (coord: { lat: number, lng: number }) => void;
  routeInfo?: { distance: number, duration: number } | null;
}

export const PlaceOverlay = ({ place, onClose, onGetDirections, onShare, routeInfo }: PlaceOverlayProps) => {
  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.ceil(seconds / 60);
    if (mins < 60) return `${mins}분`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}시간 ${remainingMins}분`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden -translate-x-1/2 -translate-y-2.5"
    >
      {/* Header */}
      <div className="relative p-4 pb-2">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-2 pr-6">
          <div className="mt-1">
            <MapPin className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight text-lg">{place.name}</h3>
            {place.category && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 block">
                {place.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {routeInfo && (
          <div className="flex items-center gap-4 bg-brand-50/50 p-2.5 rounded-xl border border-brand-100/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600/60">예상 시간</span>
              <span className="text-sm font-bold text-brand-700">{formatDuration(routeInfo.duration)}</span>
            </div>
            <div className="w-px h-6 bg-brand-200/50" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600/60">거리</span>
              <span className="text-sm font-bold text-brand-700">{formatDistance(routeInfo.distance)}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 text-sm">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <span className="text-slate-600 leading-snug">{place.address}</span>
        </div>

        {place.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <a href={`tel:${place.phone}`} className="text-brand-600 hover:underline">
              {place.phone}
            </a>
          </div>
        )}

        {place.url && (
          <div className="flex items-center gap-3 text-sm">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <a 
              href={place.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-600 hover:underline flex items-center gap-1"
            >
              홈페이지 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
        <button 
          onClick={() => onGetDirections({ lat: place.lat, lng: place.lng, name: place.name })}
          className="flex-1 bg-brand-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-700 transition-all shadow-md shadow-brand-600/20 group"
        >
          <Navigation className="w-4 h-4 fill-current group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          길찾기
        </button>
        
        <button 
          onClick={() => onShare({ lat: place.lat, lng: place.lng })}
          className="w-12 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors"
          title="이 장소 공유하기"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Arrow */}
      <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 bg-slate-50 border-r border-b border-slate-100 rotate-45" />
    </motion.div>
  );
};
