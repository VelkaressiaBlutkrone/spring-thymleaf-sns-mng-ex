import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit, MessageSquare, Navigation, Trash2, ImageIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, Post, Pin } from '../../types';
import api from '../../services/api';
import { FollowListModal } from './FollowListModal';
import { ConfirmationModal } from './ConfirmationModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  posts: Post[];
  pins: Pin[];
  onEdit: () => void;
  onPostClick: (post: Post) => void;
  onPinClick: (pin: Pin) => void;
  fetchData: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const ProfileModal = ({
  isOpen,
  onClose,
  user,
  posts,
  pins,
  onEdit,
  onPostClick,
  onPinClick,
  fetchData,
  showToast
}: ProfileModalProps) => {
  const navigate = useNavigate();
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
  
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  if (!user) return null;

  const userPosts = posts.filter(p => p.userId === user.id);
  const userPins = pins.filter(p => p.userId === user.id);

  const openFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setIsFollowModalOpen(true);
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
            className="relative bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Profile Header */}
            <div className="p-8 bg-brand-600 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold border-4 border-white/30 overflow-hidden">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      user.name[0]
                    )}
                  </div>
                  <button 
                    onClick={onEdit}
                    className="absolute bottom-0 right-0 p-2 bg-white shadow-lg rounded-xl text-slate-600 hover:text-brand-600 transition-all hover:scale-110"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">{user.name}</h2>
                    <button 
                      onClick={() => {
                        onClose();
                        navigate(`/profile/${user.id}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Full Profile
                    </button>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <button 
                      onClick={() => openFollowModal('followers')}
                      className="text-sm text-brand-100 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <b>{user.followersCount || 0}</b> Followers
                    </button>
                    <button 
                      onClick={() => openFollowModal('following')}
                      className="text-sm text-brand-100 opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <b>{user.followingCount || 0}</b> Following
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <div className="space-y-8">
                {/* Bio Section */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                  <p className="text-slate-600 text-sm leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
                    {user.bio || "No bio yet. Tell us about yourself!"}
                  </p>
                </div>

                {/* Posts Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-brand-600" />
                      My Posts
                    </h3>
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                      {userPosts.length} Posts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPosts.length > 0 ? (
                      userPosts.map(post => (
                        <div 
                          key={post.id} 
                          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onPostClick(post)}
                        >
                          <img 
                            src={post.imageUrl} 
                            alt="Post" 
                            className="w-full h-32 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="p-4">
                            <p className="text-sm text-slate-600 line-clamp-2 mb-2">{post.content}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <div className="flex flex-col gap-1">
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  <span>{post.lat.toFixed(4)}, {post.lng.toFixed(4)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmConfig({
                                      isOpen: true,
                                      title: 'Delete Story?',
                                      message: 'This action cannot be undone. Are you sure you want to remove this story from your profile?',
                                      onConfirm: async () => {
                                        try {
                                          await api.delete(`/posts/${post.id}`);
                                          fetchData();
                                        } catch (e) {
                                          showToast("Failed to delete post", 'error');
                                        }
                                      }
                                    });
                                  }}
                                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No stories shared yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pins Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-brand-600" />
                      My Pins
                    </h3>
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                      {userPins.length} Pins
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPins.length > 0 ? (
                      userPins.map(pin => (
                        <div 
                          key={pin.id} 
                          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 group hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
                          onClick={() => onPinClick(pin)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                              <Navigation className="w-4 h-4 text-brand-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{pin.title}</h4>
                              <p className="text-[10px] text-slate-400">{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmConfig({
                                isOpen: true,
                                title: 'Delete Pin?',
                                message: 'Are you sure you want to remove this saved location from your profile?',
                                onConfirm: async () => {
                                  try {
                                    await api.delete(`/pins/${pin.id}`);
                                    fetchData();
                                  } catch (e) {
                                    showToast("Failed to delete pin", 'error');
                                  }
                                }
                              });
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Navigation className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No pins saved yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <FollowListModal 
            isOpen={isFollowModalOpen}
            onClose={() => setIsFollowModalOpen(false)}
            userId={user.id}
            type={followModalType}
            userName={user.name}
          />

          <ConfirmationModal 
            isOpen={confirmConfig.isOpen}
            onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmConfig.onConfirm}
            title={confirmConfig.title}
            message={confirmConfig.message}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
