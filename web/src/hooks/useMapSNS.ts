import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Post, Pin, User, Notification } from '../types';
import api from '../services/api';

export const useMapSNS = () => {
  const { user, token, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Map State
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [zoomLevel, setZoomLevel] = useState(3);
  const [mapTypeId, setMapTypeId] = useState<"ROADMAP" | "HYBRID">("ROADMAP");
  const [clickCoord, setClickCoord] = useState<{ lat: number, lng: number } | null>(null);
  const [clickAddress, setClickAddress] = useState<string>('');
  
  // UI State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedRoutesOpen, setIsSavedRoutesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [showPostsLayer, setShowPostsLayer] = useState(true);
  const [showPinsLayer, setShowPinsLayer] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [postCategory, setPostCategory] = useState('default');
  const [postTitle, setPostTitle] = useState('');
  const [pinTitle, setPinTitle] = useState('');
  const [pinDescription, setPinDescription] = useState('');
  const [pinCategory, setPinCategory] = useState('default');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');

  // Search State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMarkers, setSearchMarkers] = useState<{ lat: number, lng: number, name: string }[]>([]);

  // Filter State
  const [filterType, setFilterType] = useState<'all' | 'post' | 'pin'>('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'proximity'>('newest');

  // Route State
  const [routePoints, setRoutePoints] = useState<{ lat: number, lng: number }[]>([]);
  const [routePath, setRoutePath] = useState<{ lat: number, lng: number }[]>([]);
  const [transportMode, setTransportMode] = useState<'car' | 'bike' | 'walk'>('car');
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number } | null>(null);
  const [isSavingRoute, setIsSavingRoute] = useState(false);

  // Detail State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [placeRouteInfo, setPlaceRouteInfo] = useState<{ distance: number, duration: number } | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ lat: number, lng: number } | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategory, setEditCategory] = useState('default');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // /api/posts는 공개 (Page 응답), /api/pins는 로그인 필수
      const postsRes = await api.get('/posts');
      const postsData = postsRes.data;
      setPosts(Array.isArray(postsData) ? postsData : postsData.content ?? []);

      if (token) {
        try {
          const [pinsRes, followingRes, notificationsRes, likesRes] = await Promise.all([
            api.get('/pins'),
            api.get('/profile/following-ids'),
            api.get('/notifications'),
            api.get('/profile/liked-post-ids')
          ]);
          const pinsData = pinsRes.data;
          setPins(Array.isArray(pinsData) ? pinsData : pinsData.content ?? []);
          setFollowingIds(followingRes.data);
          const notiData = notificationsRes.data;
          setNotifications(Array.isArray(notiData) ? notiData : notiData.content ?? []);

          const likedPostIds = likesRes.data;
          setPosts(prev => prev.map(p => ({
            ...p,
            isLiked: likedPostIds.includes(p.id)
          })));
        } catch (authError: any) {
          if (authError.response?.status === 401) {
            // 토큰 만료 — 인증 상태 정리 (인터셉터가 이미 logout 호출)
            setPins([]);
            setFollowingIds([]);
            setNotifications([]);
          } else {
            console.error("Failed to fetch authenticated data", authError);
          }
        }
      } else {
        setPins([]);
        setFollowingIds([]);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn("Initial geolocation failed, using default center.", err);
        }
      );
    }
  }, [fetchData]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const loginRes = await api.post('/auth/login', { email, password });
        const accessToken = loginRes.data.accessToken ?? loginRes.data.token;
        // Fetch user profile after login
        const meRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = meRes.data;
        setAuth(accessToken, {
          id: userData.id,
          email: userData.email,
          name: userData.nickname ?? userData.name,
          nickname: userData.nickname,
          role: userData.role,
        });
        setIsAuthModalOpen(false);
      } else {
        await api.post('/members', { email, password, nickname: name });
        showToast("Registration successful! Please log in.");
        setAuthMode('login');
        setPassword('');
      }
    } catch (error: any) {
      const data = error.response?.data;
      const message = data?.message || data?.error || "Authentication failed";
      showToast(message, 'error');
      setPassword('');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!clickCoord) return;
    try {
      await api.post('/posts', {
        title: postTitle || 'Untitled',
        content,
        imageUrl: imageUrl || `https://picsum.photos/seed/${Math.random()}/400/300`,
        category: postCategory,
        latitude: clickCoord.lat,
        longitude: clickCoord.lng
      });
      setIsPostModalOpen(false);
      setPostTitle('');
      setContent('');
      setImageUrl('');
      setPostCategory('default');
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || error.response?.data?.error || "Post failed", 'error');
    }
  };

  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!clickCoord) return;
    try {
      await api.post('/pins', {
        title: pinTitle || "New Pin",
        description: pinDescription,
        category: pinCategory,
        latitude: clickCoord.lat,
        longitude: clickCoord.lng
      });
      setIsPinModalOpen(false);
      setPinTitle('');
      setPinDescription('');
      setPinCategory('default');
      fetchData();
    } catch (error: any) {
      const data = error.response?.data;
      showToast(data?.message || data?.error || "Failed to create pin", 'error');
    }
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    setIsUpdatingPost(true);
    try {
      await api.put(`/posts/${selectedPost.id}`, {
        content: editContent,
        imageUrl: editImageUrl,
        category: editCategory
      });
      setIsEditingPost(false);
      await fetchData();
      setSelectedPost({ ...selectedPost, content: editContent, imageUrl: editImageUrl, category: editCategory });
    } catch (e) {
      showToast("Failed to update post", 'error');
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/me', {
        nickname: profileName,
        bio: profileBio,
        profilePic: profilePic
      });
      setAuth(token!, { ...user!, name: profileName, bio: profileBio, profilePic });
      setIsProfileEditModalOpen(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("Failed to update profile", 'error');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    
    setIsSearching(true);
    const results: any[] = [];

    // 1. Search Posts (Local)
    const postResults = posts.filter(p => 
      p.content.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchKeyword.toLowerCase())
    ).map(p => ({ ...p, type: 'post' }));
    results.push(...postResults);

    // 2. Search Pins (Local)
    const pinResults = pins.filter(p => 
      p.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchKeyword.toLowerCase())
    ).map(p => ({ ...p, type: 'pin' }));
    results.push(...pinResults);

    // 3. Search Users (Remote)
    try {
      const userRes = await api.get('/users/search', { params: { q: searchKeyword } });
      const userResults = userRes.data.map((u: any) => ({ ...u, type: 'user' }));
      results.push(...userResults);
    } catch (e) {
      console.error("User search failed", e);
    }

    // 4. Search Locations (Kakao)
    if (window.kakao?.maps?.services) {
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(searchKeyword, (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const locationResults = data.map((item: any) => ({ ...item, type: 'location' }));
          results.push(...locationResults);
          
          const markers = data.map((item: any) => ({
            lat: parseFloat(item.y),
            lng: parseFloat(item.x),
            name: item.place_name
          }));
          setSearchMarkers(markers);
        }
        
        setSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setSearchResults(results);
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    if (result.type === 'location') {
      const lat = parseFloat(result.y);
      const lng = parseFloat(result.x);
      setCenter({ lat, lng });
      setSearchKeyword(result.place_name);
    } else if (result.type === 'post') {
      setCenter({ lat: result.lat, lng: result.lng });
      setSelectedPost(result);
      setOverlayPos({ lat: result.lat, lng: result.lng });
    } else if (result.type === 'pin') {
      setCenter({ lat: result.lat, lng: result.lng });
      setSelectedPin(result);
      setOverlayPos({ lat: result.lat, lng: result.lng });
    } else if (result.type === 'user') {
      handleViewUser(result.id);
    }
    
    setSearchResults([]);
  };

  const fetchSavedRoutes = async () => {
    if (!user) return;
    try {
      const res = await api.get('/saved-routes');
      setSavedRoutes(res.data);
    } catch (e) {
      console.error("Failed to fetch saved routes", e);
    }
  };

  const saveRoute = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!routeInfo || routePath.length === 0) return;
    setIsSavingRoute(true);
    try {
      await api.post('/saved-routes', {
        name: `Route ${new Date().toLocaleString()}`,
        points: routePoints,
        path: routePath,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        transportMode
      });
      showToast("Route saved successfully!");
      fetchSavedRoutes();
    } catch (e) {
      showToast("Failed to save route", 'error');
    } finally {
      setIsSavingRoute(false);
    }
  };

  const deleteSavedRoute = async (id: number) => {
    try {
      await api.delete(`/saved-routes/${id}`);
      fetchSavedRoutes();
    } catch (e) {
      showToast("Failed to delete route", 'error');
    }
  };

  const handleViewUser = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const handleFollow = async (userId: number) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await api.post(`/users/${userId}/follow`);
      setIsFollowing(true);
      const res = await api.get(`/users/${userId}`);
      setViewingUser(res.data);
    } catch (e) {
      showToast("Failed to follow user", 'error');
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}/follow`);
      setIsFollowing(false);
      const res = await api.get(`/users/${userId}`);
      setViewingUser(res.data);
    } catch (e) {
      showToast("Failed to unfollow user", 'error');
    }
  };

  const fetchRoute = async (points: { lat: number, lng: number }[]) => {
    if (points.length < 2) return;
    
    // Kakao Directions API v1 supports up to 5 waypoints (total 7 points including origin and destination)
    if (points.length > 7) {
      setRouteError("Maximum of 5 waypoints exceeded. Please remove some points.");
      return;
    }

    setIsRouteLoading(true);
    setRouteError(null);
    try {
      const origin = `${points[0].lng},${points[0].lat}`;
      const destination = `${points[points.length - 1].lng},${points[points.length - 1].lat}`;
      const waypoints = points.slice(1, -1).map(p => `${p.lng},${p.lat}`).join('|');
      
      const priorities = transportMode === 'car' ? ['RECOMMEND', 'DISTANCE'] : ['DISTANCE'];
      const results = await Promise.all(priorities.map(p => 
        api.get('/route', { params: { origin, destination, waypoints, mode: transportMode, priority: p } })
      ));

      const validRoutes = results
        .filter(r => r.data.routes?.[0])
        .map((r, idx) => ({
          ...r.data.routes[0],
          priorityLabel: priorities[idx] === 'RECOMMEND' ? 'Recommended' : 'Shortest'
        }));

      if (validRoutes.length === 0) {
        setRouteError("We couldn't find a valid route between these points. Please try moving them closer to main roads.");
      } else {
        setRouteOptions(validRoutes);
        selectRoute(validRoutes[0], 0);
      }
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const code = detail?.code;
      
      if (code === -4) {
        setRouteError("Too many waypoints. You can add up to 5 points between your start and end locations.");
      } else if (code === -5) {
        setRouteError("One of your points is too far from a road. Try dragging it to a nearby street.");
      } else if (code === -3) {
        setRouteError("No route found. The points might be in disconnected areas or on islands without bridge access.");
      } else if (code === -6) {
        setRouteError("The route is too long for the selected transport mode. Try breaking it into smaller segments.");
      } else if (code === -401) {
        setRouteError("Routing service requires a Kakao REST API Key. Please set KAKAO_REST_KEY in the AI Studio settings.");
      } else if (code === -403) {
        setRouteError("Daily route calculation limit reached. Please try again tomorrow.");
      } else if (detail?.msg) {
        setRouteError(detail.msg);
      } else if (error.code === 'ERR_NETWORK') {
        setRouteError("Network error. Please check your internet connection and try again.");
      } else {
        setRouteError("Something went wrong while calculating the route. Please try adjusting your points.");
      }
    } finally {
      setIsRouteLoading(false);
    }
  };

  const selectRoute = (route: any, index: number) => {
    setSelectedRouteIndex(index);
    const newPath: { lat: number, lng: number }[] = [];
    route.sections.forEach((section: any) => {
      section.roads.forEach((road: any) => {
        for (let i = 0; i < road.vertexes.length; i += 2) {
          newPath.push({ lng: road.vertexes[i], lat: road.vertexes[i + 1] });
        }
      });
    });
    setRoutePath(newPath);
    setRouteInfo({ distance: route.summary.distance, duration: route.summary.duration });
  };

  const recenter = useCallback(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        (err) => {
          console.error("Geolocation error", err);
          // alert("Could not get your location. Please check your browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      showToast("Geolocation is not supported by your browser.", 'error');
    }
  }, []);

  const resolvePlaceAtCoord = useCallback((coord: { lat: number, lng: number }) => {
    if (!window.kakao || !window.kakao.maps.services) return;
    
    setIsResolvingPlace(true);
    setPlaceRouteInfo(null);
    const geocoder = new window.kakao.maps.services.Geocoder();
    const ps = new window.kakao.maps.services.Places();

    geocoder.coord2Address(coord.lng, coord.lat, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0].address.address_name;
        setClickAddress(address);
        
        ps.keywordSearch(address, (data: any, psStatus: any) => {
          let targetPlace: any = null;
          if (psStatus === window.kakao.maps.services.Status.OK) {
            const closest = data.reduce((prev: any, curr: any) => {
              const prevDist = Math.pow(prev.y - coord.lat, 2) + Math.pow(prev.x - coord.lng, 2);
              const currDist = Math.pow(curr.y - coord.lat, 2) + Math.pow(curr.x - coord.lng, 2);
              return currDist < prevDist ? curr : prev;
            });
            
            const distSq = Math.pow(closest.y - coord.lat, 2) + Math.pow(closest.x - coord.lng, 2);
            const threshold = 0.00025 * 0.00025; // Approx 28m radius
            
            if (distSq < threshold) {
              targetPlace = {
                name: closest.place_name,
                address: closest.road_address_name || closest.address_name,
                phone: closest.phone,
                category: closest.category_group_name,
                url: closest.place_url,
                lat: parseFloat(closest.y),
                lng: parseFloat(closest.x)
              };
            }
          }

          if (targetPlace) {
            setSelectedPlace(targetPlace);
            setOverlayPos(coord);
            
            // Fetch route info from current location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(async (pos) => {
                const origin = `${pos.coords.longitude},${pos.coords.latitude}`;
                const destination = `${targetPlace.lng},${targetPlace.lat}`;
                try {
                  const res = await api.get('/route', { params: { 
                    origin: `${pos.coords.longitude},${pos.coords.latitude}`, 
                    destination: `${targetPlace.lng},${targetPlace.lat}`,
                    mode: 'car'
                  }});
                  if (res.data.routes && res.data.routes[0]) {
                    const route = res.data.routes[0];
                    setPlaceRouteInfo({
                      distance: route.summary.distance,
                      duration: route.summary.duration
                    });
                  }
                } catch (e: any) {
                  console.error("Failed to fetch place route info", e);
                  if (e.response?.status === 401) {
                    showToast("Routing requires a Kakao API Key. Please check settings.", "error");
                  }
                }
              }, (err) => {
                console.warn("Geolocation failed for route info calculation.", err);
              });
            }
          } else {
            // No POI close enough - fallback to original action modal behavior
            setSelectedPlace(null);
            setOverlayPos(null);
            
            setClickCoord(coord);
            setIsActionModalOpen(true);
          }
          setIsResolvingPlace(false);
        }, { location: new window.kakao.maps.LatLng(coord.lat, coord.lng), radius: 50 });
      } else {
        setIsResolvingPlace(false);
      }
    });
  }, []);

  const startRouteToTarget = (target: { lat: number, lng: number, name?: string }) => {
    setIsRouteMode(true);
    setIsSavedRoutesOpen(false);
    setIsSearchOpen(false);
    setIsFilterOpen(false);
    setIsMessagesOpen(false);
    setIsSettingsOpen(false);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const destination = { lat: target.lat, lng: target.lng };
          const points = [origin, destination];
          setRoutePoints(points);
          fetchRoute(points);
        },
        () => {
          setRoutePoints([{ lat: target.lat, lng: target.lng }]);
          setRouteError("Could not get your location. Please click on the map to set your starting point.");
        }
      );
    } else {
      setRoutePoints([{ lat: target.lat, lng: target.lng }]);
      setRouteError("Geolocation not supported. Please click on the map to set your starting point.");
    }
    
    setOverlayPos(null);
    setSelectedPin(null);
    setSelectedPlace(null);
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await api.delete(`/posts/${postId}/like`);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: false, likesCount: Math.max(0, (p.likesCount || 0) - 1) } : p));
      } else {
        await api.post(`/posts/${postId}/like`);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: true, likesCount: (p.likesCount || 0) + 1 } : p));
      }
    } catch (e) {
      console.error("Failed to like/unlike post", e);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filterType === 'pin') return false;
    
    // User Filter
    if (filterUser === 'me') {
      if (!user || post.userId !== user.id) return false;
    } else if (filterUser === 'following') {
      if (!user || !followingIds.includes(post.userId)) return false;
    } else if (filterUser !== 'all' && post.userName !== filterUser) {
      return false;
    }

    // Date Filter
    if (filterDate !== 'all' && new Date(post.createdAt).toLocaleDateString() !== filterDate) return false;
    
    // Category Filter
    if (filterCategories.length > 0 && !filterCategories.includes(post.category || 'default')) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'likes') {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    if (sortBy === 'proximity') {
      const distA = Math.pow(a.lat - center.lat, 2) + Math.pow(a.lng - center.lng, 2);
      const distB = Math.pow(b.lat - center.lat, 2) + Math.pow(b.lng - center.lng, 2);
      return distA - distB;
    }
    return 0;
  });

  const filteredPins = pins.filter(pin => {
    if (filterType === 'post') return false;

    // User Filter
    if (filterUser === 'me') {
      if (!user || pin.userId !== user.id) return false;
    } else if (filterUser === 'following') {
      if (!user || !followingIds.includes(pin.userId)) return false;
    } else if (filterUser !== 'all' && pin.userName !== filterUser) {
      return false; 
    }

    return true;
  });

  const uniqueUsers = Array.from(new Set([
    ...posts.map(p => p.userName),
    ...pins.map(p => p.userName).filter((n): n is string => !!n)
  ]));
  const uniqueDates = Array.from(new Set(posts.map(p => new Date(p.createdAt).toLocaleDateString())));

  return {
    user, token, logout,
    posts, pins, savedRoutes, notifications,
    center, setCenter, mapTypeId, setMapTypeId, clickCoord, setClickCoord,
    isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode,
    isActionModalOpen, setIsActionModalOpen, isPostModalOpen, setIsPostModalOpen,
    isPinModalOpen, setIsPinModalOpen, isProfileOpen, setIsProfileOpen,
    isProfileEditModalOpen, setIsProfileEditModalOpen, isSearchOpen, setIsSearchOpen,
    isFilterOpen, setIsFilterOpen, isRouteMode, setIsRouteMode,
    isMessagesOpen, setIsMessagesOpen, isSettingsOpen, setIsSettingsOpen,
    isSavedRoutesOpen, setIsSavedRoutesOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    isLayersOpen, setIsLayersOpen,
    isLocating, setIsLocating,
    isFeedOpen, setIsFeedOpen,
    showPostsLayer, setShowPostsLayer,
    showPinsLayer, setShowPinsLayer,
    selectedPlace, setSelectedPlace, isResolvingPlace, placeRouteInfo,
    email, setEmail, password, setPassword, name, setName,
    postTitle, setPostTitle, content, setContent, imageUrl, setImageUrl, postCategory, setPostCategory, pinTitle, setPinTitle,
    pinDescription, setPinDescription, pinCategory, setPinCategory,
    profileName, setProfileName, profileBio, setProfileBio, profilePic, setProfilePic,
    searchKeyword, setSearchKeyword, isSearching, searchResults, setSearchResults,
    filterType, setFilterType, filterUser, setFilterUser, filterDate, setFilterDate,
    filterCategories, setFilterCategories,
    sortBy, setSortBy,
    routePoints, setRoutePoints, routePath, setRoutePath, transportMode, setTransportMode,
    isRouteLoading, routeError, setRouteError, routeOptions, selectedRouteIndex,
    routeInfo, isSavingRoute,
    selectedPost, setSelectedPost, selectedPin, setSelectedPin, overlayPos, setOverlayPos, isEditingPost, setIsEditingPost,
    isUpdatingPost, editContent, setEditContent, editImageUrl, setEditImageUrl, editCategory, setEditCategory,
    viewingUser, setViewingUser, isFollowing,
    fetchData, handleAuth, handleCreatePost, handleCreatePin, handleUpdatePost, handleUpdateProfile,
    handleSearch, selectSearchResult, fetchSavedRoutes, saveRoute, deleteSavedRoute,
    handleViewUser, handleFollow, handleUnfollow, fetchRoute, selectRoute, startRouteToTarget, recenter,
    resolvePlaceAtCoord, markNotificationAsRead, markAllNotificationsAsRead, handleLikePost,
    filteredPosts, filteredPins, uniqueUsers, uniqueDates,
    searchMarkers, setSearchMarkers,
    clickAddress, setClickAddress,
    isCreationMode, setIsCreationMode,
    zoomLevel, setZoomLevel,
    toast, showToast,
    setRouteInfo, navigate
  };
};
