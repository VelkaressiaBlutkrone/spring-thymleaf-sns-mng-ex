import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Route as RouteIcon, 
  History, 
  Trash2, 
  X, 
  Car, 
  Bike, 
  Footprints, 
  Loader2, 
  AlertCircle, 
  Navigation, 
  Clock, 
  Save, 
  Share2 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ConfirmationModal } from '../modals/ConfirmationModal';

interface RouteOverlayProps {
  isOpen: boolean;
  isSavedRoutesOpen: boolean;
  setIsSavedRoutesOpen: (open: boolean) => void;
  savedRoutes: any[];
  onFetchSavedRoutes: () => void;
  onDeleteSavedRoute: (id: number) => void;
  onLoadSavedRoute: (route: any) => void;
  transportMode: 'car' | 'bike' | 'walk';
  setTransportMode: (mode: 'car' | 'bike' | 'walk') => void;
  routePoints: { lat: number, lng: number }[];
  setRoutePoints: (points: { lat: number, lng: number }[]) => void;
  isRouteLoading: boolean;
  routeError: string | null;
  routeOptions: any[];
  selectedRouteIndex: number;
  onSelectRoute: (opt: any, idx: number) => void;
  routeInfo: { distance: number, duration: number } | null;
  onSaveRoute: () => void;
  onShareRoute: () => void;
  isSavingRoute: boolean;
  onClearRoute: () => void;
  onPointClick: (point: { lat: number, lng: number }) => void;
  onRemovePoint: (index: number) => void;
}

export const RouteOverlay = ({
  isOpen,
  isSavedRoutesOpen,
  setIsSavedRoutesOpen,
  savedRoutes,
  onFetchSavedRoutes,
  onDeleteSavedRoute,
  onLoadSavedRoute,
  transportMode,
  setTransportMode,
  routePoints,
  isRouteLoading,
  routeError,
  routeOptions,
  selectedRouteIndex,
  onSelectRoute,
  routeInfo,
  onSaveRoute,
  onShareRoute,
  isSavingRoute,
  onClearRoute,
  onPointClick,
  onRemovePoint
}: RouteOverlayProps) => {
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-24 left-8 z-20 w-80 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-brand-600" />
              Route Planner
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSavedRoutesOpen(!isSavedRoutesOpen);
                  if (!isSavedRoutesOpen) onFetchSavedRoutes();
                }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isSavedRoutesOpen ? "bg-brand-100 text-brand-600" : "hover:bg-slate-100 text-slate-400"
                )}
              >
                <History className="w-4 h-4" />
              </button>
              <button 
                onClick={onClearRoute}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isSavedRoutesOpen ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Routes</h4>
                <button onClick={() => setIsSavedRoutesOpen(false)} className="text-[10px] text-brand-600 font-bold">Back</button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {savedRoutes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">No saved routes yet</div>
                ) : (
                  savedRoutes.map((r) => (
                    <div key={r.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-700 truncate">{r.name}</div>
                          <div className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                        <button 
                          onClick={() => setConfirmDeleteId(r.id)}
                          className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <RouteIcon className="w-3 h-3" />
                          {(r.distance / 1000).toFixed(1)}km
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {Math.round(r.duration / 60)}m
                        </div>
                      </div>
                      <button 
                        onClick={() => onLoadSavedRoute(r)}
                        className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Load Route
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {(['car', 'bike', 'walk'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={cn(
                      "flex-1 flex items-center justify-center py-2 rounded-xl transition-all",
                      transportMode === mode 
                        ? "bg-white text-brand-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {mode === 'car' && <Car className="w-4 h-4" />}
                    {mode === 'bike' && <Bike className="w-4 h-4" />}
                    {mode === 'walk' && <Footprints className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div className="text-sm text-slate-500 flex items-center justify-between">
                <span>
                  {routePoints.length === 0 ? (
                    "Click on the map to set starting point"
                  ) : routePoints.length === 1 ? (
                    "Click to set destination"
                  ) : (
                    `${routePoints.length} points selected`
                  )}
                </span>
                {routePoints.length >= 2 && routePoints.length < 7 && (
                  <span className="text-[10px] text-slate-400 font-bold">
                    {7 - routePoints.length} more waypoints allowed
                  </span>
                )}
                {routePoints.length >= 7 && (
                  <span className="text-[10px] text-red-500 font-bold">
                    Waypoint limit reached
                  </span>
                )}
              </div>

              {isRouteLoading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculating Route...</p>
                </div>
              )}

              {routeError && !isRouteLoading && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-red-600">Route Error</p>
                    <p className="text-[10px] text-red-500 leading-relaxed">{routeError}</p>
                  </div>
                </div>
              )}

              {!isRouteLoading && !routeError && routePoints.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {routePoints.map((p, i) => (
                    <div 
                      key={`point-list-${i}`}
                      className="flex items-center justify-between bg-slate-50 p-2 rounded-xl group"
                    >
                      <button 
                        onClick={() => onPointClick(p)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold",
                          i === 0 ? "bg-red-500" : "bg-brand-600"
                        )}>
                          {i === 0 ? <Navigation className="w-3 h-3 fill-current" /> : i}
                        </div>
                        <span className="text-xs text-slate-600 font-medium truncate">
                          Point {i + 1} ({p.lat.toFixed(4)}, {p.lng.toFixed(4)})
                        </span>
                      </button>
                      <button 
                        onClick={() => onRemovePoint(i)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!isRouteLoading && routeOptions.length > 1 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Route Options</h4>
                  <div className="flex gap-2">
                    {routeOptions.map((opt, idx) => (
                      <button
                        key={`opt-${idx}`}
                        onClick={() => onSelectRoute(opt, idx)}
                        className={cn(
                          "flex-1 p-2 rounded-xl border text-left transition-all",
                          selectedRouteIndex === idx 
                            ? "bg-brand-50 border-brand-200 ring-1 ring-brand-200" 
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={cn("text-[10px] font-bold mb-1", selectedRouteIndex === idx ? "text-brand-600" : "text-slate-400")}>
                          {opt.priorityLabel}
                        </div>
                        <div className="text-xs font-bold text-slate-700">{Math.round(opt.summary.duration / 60)}m</div>
                        <div className="text-[10px] text-slate-400">{(opt.summary.distance / 1000).toFixed(1)}km</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isRouteLoading && routeInfo && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Selected Route</span>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-brand-600">
                        {(routeInfo.distance / 1000).toFixed(2)} km
                      </span>
                      <span className="text-[10px] text-brand-500 font-medium">
                        {transportMode === 'car' 
                          ? (routeOptions[selectedRouteIndex]?.priorityLabel || "Recommended")
                          : "Shortest Road Path (No Highways)"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={onSaveRoute}
                      disabled={isSavingRoute}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingRoute ? "Saving..." : "Save Route"}
                    </button>
                    <button 
                      onClick={onShareRoute}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Route
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      <ConfirmationModal 
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            onDeleteSavedRoute(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="Delete Route?"
        message="Are you sure you want to remove this saved route? This action cannot be undone."
      />
    </AnimatePresence>
  );
};
