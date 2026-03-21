import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, UserPlus, Heart, AtSign, CheckCircle2 } from 'lucide-react';
import { Notification } from '../../types';
import { cn } from '../../utils/cn';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onViewPost: (postId: number) => void;
  onViewUser: (userId: number) => void;
}

export const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewPost,
  onViewUser
}: NotificationModalProps) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-8 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/5 pointer-events-auto"
          />
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[80vh] pointer-events-auto overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-brand-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Notifications</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stay updated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={onMarkAllAsRead}
                    className="p-2 hover:bg-brand-50 text-brand-600 rounded-xl transition-colors group"
                    title="Mark all as read"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 text-slate-400 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-20 text-center px-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-medium">No notifications yet.</p>
                  <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold tracking-widest">We'll let you know when something happens</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {[...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n) => (
                    <div 
                      key={n.id}
                      className={cn(
                        "p-4 flex gap-4 transition-colors group relative",
                        !n.isRead ? "bg-brand-50/30" : "hover:bg-slate-50"
                      )}
                    >
                      <button 
                        onClick={() => onViewUser(n.fromUserId)}
                        className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200"
                      >
                        {n.fromUserProfilePic ? (
                          <img src={n.fromUserProfilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                            {n.fromUserName[0]}
                          </div>
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-600 leading-snug">
                            <span 
                              className="font-bold text-slate-800 cursor-pointer hover:text-brand-600"
                              onClick={() => onViewUser(n.fromUserId)}
                            >
                              {n.fromUserName}
                            </span>
                            {' '}
                            {n.type === 'follow' && "started following you"}
                            {n.type === 'like' && "liked your story"}
                            {n.type === 'mention' && "mentioned you in a story"}
                          </p>
                          <div className="shrink-0 mt-1">
                            {n.type === 'follow' && <UserPlus className="w-3 h-3 text-blue-500" />}
                            {n.type === 'like' && <Heart className="w-3 h-3 text-red-500 fill-current" />}
                            {n.type === 'mention' && <AtSign className="w-3 h-3 text-purple-500" />}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          {n.postId && (
                            <button 
                              onClick={() => onViewPost(n.postId!)}
                              className="text-[10px] font-bold text-brand-600 uppercase tracking-wider hover:underline"
                            >
                              View Story
                            </button>
                          )}
                        </div>
                      </div>

                      {!n.isRead && (
                        <button 
                          onClick={() => onMarkAsRead(n.id)}
                          className="absolute top-4 right-4 w-2 h-2 bg-brand-500 rounded-full"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of notifications</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
