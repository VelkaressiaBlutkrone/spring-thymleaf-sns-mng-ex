import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Loader2, Upload, ImageIcon, Heart, Share2, Tag } from 'lucide-react';
import { Post, User } from '../../types';
import { cn } from '../../utils/cn';
import { CATEGORIES } from '../../constants';

interface PostOverlayProps {
  post: Post;
  currentUser: User | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  editImageUrl: string;
  setEditImageUrl: (url: string) => void;
  editCategory: string;
  setEditCategory: (cat: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
  onLike: (postId: number) => void;
  onClose: () => void;
  onViewUser: (userId: number) => void;
  onShare: (postId: number, lat: number, lng: number) => void;
}

export const PostOverlay = ({
  post,
  currentUser,
  isEditing,
  setIsEditing,
  editContent,
  setEditContent,
  editImageUrl,
  setEditImageUrl,
  editCategory,
  setEditCategory,
  onUpdate,
  isUpdating,
  onLike,
  onClose,
  onViewUser,
  onShare
}: PostOverlayProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 w-64 -translate-x-1/2 -translate-y-12 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <button 
          onClick={() => onViewUser(post.userId)}
          className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-xl transition-colors group"
        >
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] text-brand-700 font-bold">
            {post.userName[0]}
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">{post.userName}</span>
        </button>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image</label>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-50 border border-slate-200 group mb-2">
              {editImageUrl ? (
                <img 
                  src={editImageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[10px] font-bold">Change Image</span>
              </button>
            </div>
            
            <input 
              type="text"
              value={editImageUrl.startsWith('data:') ? '' : editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Or paste URL..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setEditCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1 p-1.5 rounded-lg border transition-all",
                    editCategory === cat.id 
                      ? "bg-brand-50 border-brand-200 text-brand-600" 
                      : "bg-white border-slate-100 text-slate-400"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                  <span className="text-[8px] font-bold uppercase truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Content</label>
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs h-20 resize-none focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="What's the story?"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onUpdate}
              disabled={isUpdating}
              className="flex-1 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden mb-3 bg-slate-100 aspect-video relative group">
            <img 
              src={post.imageUrl} 
              alt="" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {post.category && post.category !== 'default' && (
              <div className={cn(
                "absolute top-2 left-2 px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest shadow-lg",
                CATEGORIES.find(c => c.id === post.category)?.color || "bg-slate-500"
              )}>
                {CATEGORIES.find(c => c.id === post.category)?.label}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{post.content}</p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onLike(post.id)}
                className={cn(
                  "flex items-center gap-1 transition-colors group",
                  post.isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"
                )}
              >
                <Heart className={cn("w-4 h-4 transition-transform group-active:scale-125", post.isLiked && "fill-current")} />
                <span className="text-[10px] font-bold">{post.likesCount || 0}</span>
              </button>
              <button 
                onClick={() => onShare(post.id, post.lat, post.lng)}
                className="text-slate-400 hover:text-brand-600 transition-colors"
                title="Share Story"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {currentUser?.id === post.userId && (
              <button 
                onClick={() => {
                  setEditContent(post.content);
                  setEditImageUrl(post.imageUrl);
                  setEditCategory(post.category || 'default');
                  setIsEditing(true);
                }}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
              >
                Edit Story
              </button>
            )}
          </div>
        </>
      )}
      {/* Arrow */}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
    </motion.div>
  );
};
