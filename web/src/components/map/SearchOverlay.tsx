import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Map as MapIcon, Loader2, MessageSquare, Navigation, User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchOverlayProps {
  isOpen: boolean;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
  isSearching: boolean;
  searchResults: any[];
  onSearch: (e: React.FormEvent) => void;
  onSelectResult: (result: any) => void;
  onClear: () => void;
}

const RESULT_ICONS: Record<string, any> = {
  location: MapIcon,
  post: MessageSquare,
  pin: Navigation,
  user: User
};

const RESULT_COLORS: Record<string, string> = {
  location: 'bg-brand-50 text-brand-600',
  post: 'bg-blue-50 text-blue-600',
  pin: 'bg-amber-50 text-amber-600',
  user: 'bg-purple-50 text-purple-600'
};

export const SearchOverlay = ({
  isOpen,
  searchKeyword,
  setSearchKeyword,
  isSearching,
  searchResults,
  onSearch,
  onSelectResult,
  onClear
}: SearchOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="flex-1 max-w-md mx-4 pointer-events-auto"
        >
          <form onSubmit={onSearch} className="relative group">
            <input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search locations, stories, pins, or users..."
              className="w-full bg-white/90 backdrop-blur-md px-12 py-3 rounded-2xl shadow-lg border border-white/20 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-700 placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
            
            {searchKeyword && (
              <button 
                type="button"
                onClick={onClear}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-600 text-white p-1.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[60] max-h-80 overflow-y-auto custom-scrollbar"
                >
                  {searchResults.map((result, idx) => {
                    const Icon = RESULT_ICONS[result.type] || MapIcon;
                    const colorClass = RESULT_COLORS[result.type] || 'bg-slate-50 text-slate-600';
                    
                    let title = '';
                    let subtitle = '';
                    
                    if (result.type === 'location') {
                      title = result.place_name;
                      subtitle = result.road_address_name || result.address_name;
                    } else if (result.type === 'post') {
                      title = result.content;
                      subtitle = `Story by ${result.userName}`;
                    } else if (result.type === 'pin') {
                      title = result.title;
                      subtitle = result.description || 'Saved Location';
                    } else if (result.type === 'user') {
                      title = result.name;
                      subtitle = result.bio || 'User Profile';
                    }

                    return (
                      <button
                        key={`search-res-${idx}`}
                        onClick={() => onSelectResult(result)}
                        className="w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-3 group"
                      >
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors", colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{subtitle}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-bold rounded-md uppercase tracking-wider">
                            {result.type}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
