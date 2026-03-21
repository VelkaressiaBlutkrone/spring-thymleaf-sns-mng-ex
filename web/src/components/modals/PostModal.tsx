import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { cn } from '../../utils/cn';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  clickCoord: { lat: number, lng: number } | null;
  setClickCoord: React.Dispatch<React.SetStateAction<{ lat: number, lng: number } | null>>;
  address?: string;
  content: string;
  setContent: (content: string) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  category: string;
  setCategory: (cat: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PostModal = ({
  isOpen,
  onClose,
  clickCoord,
  setClickCoord,
  address,
  content,
  setContent,
  imageUrl,
  setImageUrl,
  category,
  setCategory,
  onSubmit
}: PostModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Create New Post</h2>
            {address ? (
              <p className="text-xs text-brand-600 font-medium mb-6">{address}</p>
            ) : (
              <p className="text-sm text-slate-400 mb-6">Confirm location and share your story</p>
            )}
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={clickCoord?.lat || ''}
                    onChange={(e) => setClickCoord(prev => prev ? { ...prev, lat: parseFloat(e.target.value) } : null)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={clickCoord?.lng || ''}
                    onChange={(e) => setClickCoord(prev => prev ? { ...prev, lng: parseFloat(e.target.value) } : null)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border transition-all",
                        category === cat.id 
                          ? "bg-brand-50 border-brand-200 text-brand-600" 
                          : "bg-white border-slate-100 hover:border-slate-200 text-slate-400"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-white",
                        cat.color
                      )}>
                        <cat.icon className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[120px]"
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Image</label>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 group">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:bg-slate-100 hover:border-brand-500 hover:text-brand-500 transition-all group"
                  >
                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                  </button>
                )}
                
                <div className="mt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Or use Image URL</label>
                  <input 
                    type="text" 
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg hover:bg-brand-700 transition-all"
                >
                  Post
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
