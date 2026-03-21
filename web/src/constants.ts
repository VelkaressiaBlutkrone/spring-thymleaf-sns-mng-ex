import { MapPin, Coffee, Utensils, Camera, Heart, Star } from 'lucide-react';

export const CATEGORIES = [
  { id: 'default', icon: MapPin, label: 'General', color: 'bg-slate-500', gradient: 'from-slate-400 to-slate-600' },
  { id: 'cafe', icon: Coffee, label: 'Cafe', color: 'bg-amber-500', gradient: 'from-amber-400 to-orange-500' },
  { id: 'food', icon: Utensils, label: 'Food', color: 'bg-rose-500', gradient: 'from-rose-400 to-red-600' },
  { id: 'photo', icon: Camera, label: 'Photo', color: 'bg-violet-500', gradient: 'from-violet-400 to-purple-600' },
  { id: 'favorite', icon: Heart, label: 'Favorite', color: 'bg-pink-500', gradient: 'from-pink-400 to-rose-600' },
  { id: 'must-visit', icon: Star, label: 'Must Visit', color: 'bg-cyan-500', gradient: 'from-cyan-400 to-blue-600' },
] as const;
