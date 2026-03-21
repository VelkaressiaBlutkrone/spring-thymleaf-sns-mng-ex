import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, User as UserIcon, Clock } from 'lucide-react';
import { Post } from '../../types';

interface MessagesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onPostClick: (post: Post) => void;
  onViewUser: (userId: number) => void;
}

export const MessagesOverlay = ({
  isOpen,
  onClose,
  posts,
  onPostClick,
  onViewUser
}: MessagesOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-24 right-8 z-20 w-80 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Recent Activity
            </h3>
            <button onClick={onClose}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">No recent activity</p>
              </div>
            ) : (
              posts.slice(0, 5).map((post) => (
                <button 
                  key={`msg-post-${post.id}`}
                  onClick={() => onPostClick(post)}
                  className="w-full flex items-start gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {post.user?.profilePic ? (
                      <img src={post.user.profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-brand-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewUser(post.userId);
                        }}
                        className="text-xs font-bold text-slate-800 truncate hover:text-brand-600 transition-colors"
                      >
                        {post.userName || 'Anonymous'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{post.content}</p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
