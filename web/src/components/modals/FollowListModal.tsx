import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api'
});

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: 'followers' | 'following';
  userName: string;
}

export const FollowListModal = ({
  isOpen,
  onClose,
  userId,
  type,
  userName
}: FollowListModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/${userId}/${type}`);
        setUsers(res.data);
      } catch (e) {
        console.error(`Failed to fetch ${type}`, e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
            className="relative bg-white w-full max-w-md h-[60vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800 capitalize">{type}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userName}'s network</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <UserIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No {type} found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onClose();
                        navigate(`/profile/${user.id}`);
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-lg font-bold text-brand-600">{user.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate group-hover:text-brand-600 transition-colors">{user.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{user.bio || 'No bio shared'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
