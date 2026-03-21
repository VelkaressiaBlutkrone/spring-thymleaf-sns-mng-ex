import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  Navigation, 
  UserPlus, 
  UserMinus, 
  ImageIcon,
  ArrowLeft,
  Map as MapIcon
} from 'lucide-react';
import axios from 'axios';
import { User, Post, Pin } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../utils/cn';
import { FollowListModal } from '../components/modals/FollowListModal';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  try {
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const { state } = JSON.parse(storage);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch (e) {
    console.error("Auth storage parse error", e);
  }
  return config;
});

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [userRes, postsRes, pinsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/posts'),
          api.get('/pins')
        ]);
        
        setUser(userRes.data);
        setPosts(postsRes.data.filter((p: Post) => p.userId === parseInt(id)));
        setPins(pinsRes.data.filter((p: Pin) => p.userId === parseInt(id)));
        
        if (currentUser && currentUser.id !== parseInt(id)) {
          const followRes = await api.get(`/users/${id}/follow-status`);
          setIsFollowing(followRes.data.isFollowing);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !user) return;
    try {
      await api.post(`/users/${user.id}/follow`);
      setIsFollowing(true);
      setUser(prev => prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : null);
    } catch (e) {
      console.error("Failed to follow user");
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !user) return;
    try {
      await api.delete(`/users/${user.id}/follow`);
      setIsFollowing(false);
      setUser(prev => prev ? { ...prev, followersCount: Math.max(0, (prev.followersCount || 0) - 1) } : null);
    } catch (e) {
      console.error("Failed to unfollow user");
    }
  };

  const openFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setIsFollowModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">User not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-brand-600 font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Back to Map</span>
        </button>
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-brand-600" />
          <span className="font-bold text-slate-800">MapSNS</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="h-48 bg-slate-200 relative">
            {user.profilePic && (
              <img src={user.profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <div className="px-10 pb-10 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl relative z-10">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="" className="w-full h-full object-cover rounded-[2rem]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-brand-100 rounded-[2rem] flex items-center justify-center text-4xl text-brand-700 font-bold">
                    {user.name[0]}
                  </div>
                )}
              </div>
              
              <div className="flex-1 mb-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h1>
                  {currentUser && currentUser.id !== user.id && (
                    <div className="flex items-center">
                      {isFollowing ? (
                        <button 
                          onClick={handleUnfollow}
                          className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                        >
                          <UserMinus className="w-3 h-3" />
                          Unfollow
                        </button>
                      ) : (
                        <button 
                          onClick={handleFollow}
                          className="flex items-center gap-2 px-4 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow-lg shadow-brand-900/20 transition-all"
                        >
                          <UserPlus className="w-3 h-3" />
                          Follow
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-6 mt-2">
                  <button 
                    onClick={() => openFollowModal('followers')}
                    className="flex flex-col hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors text-left"
                  >
                    <span className="text-lg font-bold text-slate-800">{user.followersCount || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Followers</span>
                  </button>
                  <button 
                    onClick={() => openFollowModal('following')}
                    className="flex flex-col hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors text-left"
                  >
                    <span className="text-lg font-bold text-slate-800">{user.followingCount || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Following</span>
                  </button>
                  <div className="flex flex-col p-2 -m-2">
                    <span className="text-lg font-bold text-slate-800">{posts.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stories</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">About</label>
              <p className="text-slate-600 text-base leading-relaxed">
                {user.bio || "No bio shared yet."}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stories */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-brand-600" />
                Stories
              </h2>
            </div>
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map(post => (
                  <motion.div 
                    key={post.id} 
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/?lat=${post.lat}&lng=${post.lng}&post=${post.id}`)}
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <div className="p-6">
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{post.content}</p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          View on Map →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-400 font-medium">No stories shared yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Pins */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Navigation className="w-6 h-6 text-brand-600" />
                Pinned Locations
              </h2>
            </div>
            <div className="space-y-3">
              {pins.length > 0 ? (
                pins.map(pin => (
                  <motion.div 
                    key={pin.id} 
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/?lat=${pin.lat}&lng=${pin.lng}&pin=${pin.id}`)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Navigation className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{pin.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</p>
                    </div>
                    <span className="text-[10px] font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      GO →
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <Navigation className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                  <p className="text-slate-400 font-medium">No pins saved yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <FollowListModal 
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        userId={user.id}
        type={followModalType}
        userName={user.name}
      />
    </div>
  );
};
