import React from 'react';
import { Post } from '../../types';
import { motion } from 'motion/react';
import { Heart, MessageCircle, MapPin, ArrowUpDown, Clock, ThumbsUp, Navigation2, Filter } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { cn } from '../../utils/cn';

interface PostFeedProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  sortBy: 'newest' | 'oldest' | 'likes' | 'proximity';
  onSortChange: (sort: 'newest' | 'oldest' | 'likes' | 'proximity') => void;
  filterCategories: string[];
  onFilterCategoriesChange: (categories: string[]) => void;
}

export const PostFeed = ({ 
  posts, 
  onPostClick, 
  sortBy, 
  onSortChange,
  filterCategories,
  onFilterCategoriesChange
}: PostFeedProps) => {
  const sortOptions = [
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'oldest', label: 'Oldest', icon: Clock },
    { id: 'likes', label: 'Most Liked', icon: ThumbsUp },
    { id: 'proximity', label: 'Nearby', icon: Navigation2 },
  ] as const;

  const toggleCategory = (catId: string) => {
    if (filterCategories.includes(catId)) {
      onFilterCategoriesChange(filterCategories.filter(id => id !== catId));
    } else {
      onFilterCategoriesChange([...filterCategories, catId]);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 h-64 flex flex-col">
      <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-600" />
            Recent Stories
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSortChange(option.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    sortBy === option.id 
                      ? "bg-white text-brand-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <option.icon className={`w-3 h-3 ${sortBy === option.id ? "text-brand-600" : "text-slate-400"}`} />
                  {option.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-200" />

            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400 mr-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border",
                    filterCategories.includes(cat.id)
                      ? "bg-brand-50 border-brand-200 text-brand-600"
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {posts.length} Posts
        </span>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-4 p-4 h-full min-w-max">
          {posts.map((post) => (
            <motion.button
              key={post.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPostClick(post)}
              className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden w-64 text-left group"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img 
                  src={post.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                    {post.likesCount || 0}
                  </div>
                  {post.category && post.category !== 'default' && (
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest",
                      CATEGORIES.find(c => c.id === post.category)?.color || "bg-slate-500"
                    )}>
                      {CATEGORIES.find(c => c.id === post.category)?.label}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[8px] text-brand-700 font-bold">
                    {post.userName[0]}
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 truncate">{post.userName}</span>
                </div>
                
                <p className="text-xs text-slate-600 line-clamp-2 mb-2 flex-1">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-medium truncate">
                    {post.lat?.toFixed(4) ?? '-'}, {post.lng?.toFixed(4) ?? '-'}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
          
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center w-64 text-slate-400 gap-2">
              <MessageCircle className="w-8 h-8 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">No stories yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
