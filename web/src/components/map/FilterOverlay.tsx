import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FilterOverlayProps {
  isOpen: boolean;
  filterType: 'all' | 'post' | 'pin';
  setFilterType: (type: 'all' | 'post' | 'pin') => void;
  filterUser: string;
  setFilterUser: (user: string) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  onToggle: () => void;
}

export const FilterOverlay = ({
  isOpen,
  filterType,
  setFilterType,
  filterUser,
  setFilterUser,
  filterDate,
  setFilterDate,
  onToggle
}: FilterOverlayProps) => {
  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className={cn(
          "p-3 rounded-2xl transition-all flex items-center gap-2 shadow-lg border border-white/20 backdrop-blur-md",
          isOpen ? "bg-brand-600 text-white" : "bg-white/90 text-slate-500 hover:bg-slate-100"
        )}
      >
        <Filter className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">Filter</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 right-0 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-4 z-50"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['all', 'post', 'pin'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={cn(
                        "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize",
                        filterType === t ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">User</label>
                <select 
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Everyone</option>
                  <option value="me">Only Me</option>
                  <option value="following">Following</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Time</label>
                <select 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Anytime</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
