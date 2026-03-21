import React, { useEffect } from 'react';
import { Map, MapMarker, CustomOverlayMap, Polyline, MarkerClusterer } from 'react-kakao-maps-sdk';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  PlusCircle, 
  LogOut, 
  MessageSquare, 
  Settings, 
  Route as RouteIcon,
  Navigation,
  Flag,
  MapPin,
  Search,
  Filter,
  User as UserIcon,
  Coffee,
  Utensils,
  Camera,
  Heart,
  Star,
  Crosshair,
  Plus,
  Minus,
  Bell,
  LayoutList,
  Layers
} from 'lucide-react';

import { useMapSNS } from './hooks/useMapSNS';
import { NavItem } from './components/layout/NavItem';
import { AuthModal } from './components/modals/AuthModal';
import { ActionModal } from './components/modals/ActionModal';
import { PostModal } from './components/modals/PostModal';
import { PinModal } from './components/modals/PinModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { ProfileEditModal } from './components/modals/ProfileEditModal';
import { NotificationModal } from './components/modals/NotificationModal';
import { SearchOverlay } from './components/map/SearchOverlay';
import { RouteOverlay } from './components/map/RouteOverlay';
import { FilterOverlay } from './components/map/FilterOverlay';
import { MessagesOverlay } from './components/map/MessagesOverlay';
import { SettingsOverlay } from './components/map/SettingsOverlay';
import { PostOverlay } from './components/map/PostOverlay';
import { PinOverlay } from './components/map/PinOverlay';
import { PlaceOverlay } from './components/map/PlaceOverlay';
import { PostFeed } from './components/feed/PostFeed';
import { ProfilePage } from './pages/ProfilePage';
import { cn } from './utils/cn';

declare global {
  interface Window {
    kakao: any;
  }
}

function MapView() {
  const m = useMapSNS();
  const location = useLocation();
  const [map, setMap] = React.useState<kakao.maps.Map>();

  const smoothMove = (lat: number, lng: number) => {
    if (map) {
      map.panTo(new kakao.maps.LatLng(lat, lng));
      m.setCenter({ lat, lng });
    }
  };

  const markerScale = Math.pow(1.15, 3 - m.zoomLevel);

  const getPinMarkerImage = (category: string) => {
    const color =
      category === 'cafe' ? '#f59e0b' : // amber-500
      category === 'food' ? '#f43f5e' : // rose-500
      category === 'photo' ? '#8b5cf6' : // violet-500
      category === 'favorite' ? '#ec4899' : // pink-500
      category === 'must-visit' ? '#06b6d4' : // cyan-500
      '#64748b'; // slate-500
    
    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 38C20 38 34 24 34 14C34 6.26801 27.732 0 20 0C12.268 0 6 6.26801 6 14C6 24 20 38 20 38Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="14" r="6" fill="white"/>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const handleRecenter = () => {
    if (navigator.geolocation && map) {
      m.setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.panTo(new kakao.maps.LatLng(lat, lng));
          m.setCenter({ lat, lng });
          m.setIsLocating(false);
        },
        (err) => {
          console.error("Geolocation error", err);
          // alert("Could not get your location. Please check your browser permissions.");
          m.setIsLocating(false);
        }
      );
    }
  };

  // Handle query params for deep linking from profile page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const postId = params.get('post');
    const pinId = params.get('pin');

    if (lat && lng) {
      smoothMove(parseFloat(lat), parseFloat(lng));
    }

    if (postId) {
      const post = m.posts.find(p => p.id === parseInt(postId));
      if (post) {
        m.setSelectedPost(post);
        m.setOverlayPos({ lat: post.lat, lng: post.lng });
      }
    } else if (pinId) {
      const pin = m.pins.find(p => p.id === parseInt(pinId));
      if (pin) {
        if (pin.postId) {
          const post = m.posts.find(p => p.id === pin.postId);
          if (post) {
            m.setSelectedPost(post);
            m.setOverlayPos({ lat: pin.lat, lng: pin.lng });
          }
        } else {
          smoothMove(pin.lat, pin.lng);
        }
      }
    }
  }, [location.search, m.posts, m.pins]);

  return (
    <div className="flex flex-col w-full h-screen bg-slate-100 font-sans overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        {/* Header */}
        <header className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20 pointer-events-auto">
          <MapIcon className="w-6 h-6 text-brand-600" />
          <span className="font-bold text-slate-800 tracking-tight mr-2">MapSNS</span>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button 
            onClick={() => {
              const nextState = !m.isSearchOpen;
              m.setIsSearchOpen(nextState);
              if (!nextState) {
                m.setSearchResults([]);
                m.setSearchMarkers([]);
              }
            }}
            className={cn(
              "p-1.5 rounded-xl transition-colors",
              m.isSearchOpen ? "bg-brand-100 text-brand-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            )}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Overlay */}
        <SearchOverlay 
          isOpen={m.isSearchOpen}
          searchKeyword={m.searchKeyword}
          setSearchKeyword={m.setSearchKeyword}
          isSearching={m.isSearching}
          searchResults={m.searchResults}
          onSearch={m.handleSearch}
          onSelectResult={m.selectSearchResult}
          onClear={() => {
            m.setSearchKeyword('');
            m.setSearchResults([]);
            m.setSearchMarkers([]);
          }}
        />

        <div className="flex items-center gap-2 pointer-events-auto">
          <FilterOverlay 
            isOpen={m.isFilterOpen}
            filterType={m.filterType}
            setFilterType={m.setFilterType}
            filterUser={m.filterUser}
            setFilterUser={m.setFilterUser}
            filterDate={m.filterDate}
            setFilterDate={m.setFilterDate}
            onToggle={() => m.setIsFilterOpen(!m.isFilterOpen)}
          />

          {m.user ? (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-white/20">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <button 
                  onClick={() => m.setIsNotificationsOpen(true)}
                  className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                >
                  <Bell className="w-5 h-5" />
                  {m.notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </button>
                <button 
                  onClick={() => m.setIsProfileOpen(true)}
                  className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-xl transition-colors"
                >
                  {m.user.profilePic ? (
                    <img 
                      src={m.user.profilePic} 
                      alt={m.user.name} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                      {m.user.name[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700">{m.user.name}</span>
                </button>
              </div>
              <button 
                onClick={m.logout}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => m.setIsAuthModalOpen(true)}
              className="bg-brand-600 text-white px-5 py-2.5 rounded-2xl shadow-lg hover:bg-brand-700 transition-all font-medium flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </header>

      {/* Map Component */}
      <Map
        center={m.center}
        className="w-full h-full"
        level={m.zoomLevel}
        onZoomChanged={(map) => m.setZoomLevel(map.getLevel())}
        mapTypeId={m.mapTypeId}
        onCreate={setMap}
        draggable={true}
        zoomable={true}
        onCenterChanged={(map) => {
          m.setCenter({
            lat: map.getCenter().getLat(),
            lng: map.getCenter().getLng()
          });
        }}
        onRightClick={(_t, mouseEvent) => {
          const coord = {
            lat: mouseEvent.latLng.getLat(),
            lng: mouseEvent.latLng.getLng()
          };
          if (!m.user) m.setIsAuthModalOpen(true);
          else {
            m.setClickCoord(coord);
            m.setIsActionModalOpen(true);
            m.setSelectedPost(null);
            m.setSelectedPin(null);
            m.setSelectedPlace(null);
          }
        }}
        onClick={(_t, mouseEvent) => {
          if (m.isRouteMode) {
            if (m.routePoints.length >= 7) {
              m.setRouteError("Maximum waypoint limit reached (5 waypoints + start/end). Please remove a point to add a new one.");
              return;
            }
            const newPoint = {
              lat: mouseEvent.latLng.getLat(),
              lng: mouseEvent.latLng.getLng()
            };
            const newPoints = [...m.routePoints, newPoint];
            m.setRoutePoints(newPoints);
            m.setRouteError(null);
            if (newPoints.length >= 2) {
              m.fetchRoute(newPoints);
            }
            return;
          }
          
          const coord = {
            lat: mouseEvent.latLng.getLat(),
            lng: mouseEvent.latLng.getLng()
          };
          
          m.resolvePlaceAtCoord(coord);
          m.setSelectedPost(null);
          m.setSelectedPin(null);
        }}
      >
        {/* Route Path */}
        {m.routePath.length > 0 && (
          <Polyline
            path={m.routePath}
            strokeWeight={5}
            strokeColor="#338dff"
            strokeOpacity={0.8}
            strokeStyle="solid"
          />
        )}

        {/* Route Points */}
        {m.routePoints.map((point, idx) => {
          const isStart = idx === 0;
          const isEnd = idx === m.routePoints.length - 1 && m.routePoints.length > 1;
          const isWaypoint = !isStart && !isEnd;

          return (
            <CustomOverlayMap
              key={`route-point-${idx}`}
              position={point}
            >
              <div 
                onClick={() => smoothMove(point.lat, point.lng)}
                className={cn(
                  "flex flex-col items-center -translate-y-10 cursor-pointer group",
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-110",
                  isStart ? "bg-red-500 shadow-red-200" : 
                  isEnd ? "bg-slate-800 shadow-slate-200" : 
                  "bg-brand-600 shadow-brand-200"
                )}>
                  {isStart ? (
                    <Navigation className="w-4 h-4 text-white fill-current" />
                  ) : isEnd ? (
                    <Flag className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-[10px] font-bold">{idx}</span>
                  )}
                </div>
                <div className={cn(
                  "mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter text-white shadow-sm whitespace-nowrap",
                  isStart ? "bg-red-500" : 
                  isEnd ? "bg-slate-800" : 
                  "bg-brand-600"
                )}>
                  {isStart ? "Start" : isEnd ? "Goal" : `Way ${idx}`}
                </div>
              </div>
            </CustomOverlayMap>
          );
        })}

        {/* Search Markers */}
        {m.searchMarkers.map((marker, idx) => (
          <MapMarker
            key={`search-marker-${idx}`}
            position={marker}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
              size: { width: 32 * markerScale, height: 32 * markerScale }
            }}
            onClick={() => {
              smoothMove(marker.lat, marker.lng);
              m.setSearchKeyword(marker.name);
            }}
          />
        ))}

        {/* Draft Marker for new post */}
        {m.clickCoord && !m.isPostModalOpen && !m.isPinModalOpen && (
          <>
            <MapMarker
              position={m.clickCoord}
              draggable={true}
              clickable={true}
              zIndex={40}
              onCreate={(marker) => {
                if (marker && typeof (marker as any).setDraggable === 'function') (marker as any).setDraggable(true);
                if (marker && typeof (marker as any).setCursor === 'function') (marker as any).setCursor('pointer');
              }}
              onDragEnd={(marker) => {
                m.setClickCoord({
                  lat: marker.getPosition().getLat(),
                  lng: marker.getPosition().getLng()
                });
              }}
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                size: { width: 32 * markerScale, height: 32 * markerScale }
              }}
              onClick={() => m.setIsActionModalOpen(true)}
            />
            <CustomOverlayMap position={m.clickCoord} yAnchor={1} zIndex={30}>
              <div className="relative -translate-y-10 pointer-events-none flex flex-col items-center">
                <div className="px-3 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl whitespace-nowrap border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Drag to adjust • Click to create</p>
                </div>
                <div className="w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 -translate-y-1 shadow-sm" />
              </div>
            </CustomOverlayMap>
          </>
        )}

        <MarkerClusterer
          averageCenter={true}
          minLevel={5}
          gridSize={60}
          minClusterSize={2}
          styles={[
            {
              width: '44px',
              height: '44px',
              background: 'rgba(16, 185, 129, 0.95)',
              borderRadius: '22px',
              color: '#fff',
              textAlign: 'center',
              fontWeight: '800',
              lineHeight: '44px',
              border: '3px solid #fff',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              fontSize: '14px',
              cursor: 'pointer'
            },
            {
              width: '54px',
              height: '54px',
              background: 'rgba(5, 150, 105, 0.95)',
              borderRadius: '27px',
              color: '#fff',
              textAlign: 'center',
              fontWeight: '800',
              lineHeight: '54px',
              border: '3px solid #fff',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              fontSize: '16px',
              cursor: 'pointer'
            },
            {
              width: '64px',
              height: '64px',
              background: 'rgba(4, 120, 87, 0.95)',
              borderRadius: '32px',
              color: '#fff',
              textAlign: 'center',
              fontWeight: '800',
              lineHeight: '64px',
              border: '3px solid #fff',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              fontSize: '18px',
              cursor: 'pointer'
            }
          ]}
        >
          {m.showPostsLayer && m.filteredPosts.map((post) => (
            <MapMarker
              key={`post-${post.id}`}
              position={{ lat: post.lat, lng: post.lng }}
              clickable={true}
              onCreate={(marker) => {
                if (marker && typeof (marker as any).setCursor === 'function') (marker as any).setCursor('pointer');
              }}
              onClick={() => {
                m.setSelectedPost(post);
                m.setSelectedPin(null);
                m.setSelectedPlace(null);
                m.setOverlayPos({ lat: post.lat, lng: post.lng });
                m.setIsEditingPost(false);
              }}
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                size: { width: 24 * markerScale, height: 35 * markerScale }
              }}
            />
          ))}

          {m.showPinsLayer && m.filteredPins.map((pin) => (
            <MapMarker
              key={`pin-${pin.id}`}
              position={{ lat: pin.lat, lng: pin.lng }}
              clickable={true}
              onCreate={(marker) => {
                if (marker && typeof (marker as any).setCursor === 'function') (marker as any).setCursor('pointer');
              }}
              onClick={() => {
                m.setSelectedPlace(null);
                if (pin.postId) {
                  const associatedPost = m.posts.find(p => p.id === pin.postId);
                  if (associatedPost) {
                    m.setSelectedPost(associatedPost);
                    m.setSelectedPin(null);
                    m.setOverlayPos({ lat: pin.lat, lng: pin.lng });
                    m.setIsEditingPost(false);
                  }
                } else {
                  m.setSelectedPin(pin);
                  m.setSelectedPost(null);
                  m.setOverlayPos({ lat: pin.lat, lng: pin.lng });
                }
              }}
              image={{
                src: getPinMarkerImage(pin.category || 'default'),
                size: { width: 40 * markerScale, height: 40 * markerScale },
                options: {
                  offset: { x: 20 * markerScale, y: 40 * markerScale }
                }
              }}
            />
          ))}
        </MarkerClusterer>

        {m.selectedPost && m.overlayPos && (
          <CustomOverlayMap position={m.overlayPos} yAnchor={1}>
            <PostOverlay 
              post={m.selectedPost}
              currentUser={m.user}
              isEditing={m.isEditingPost}
              setIsEditing={m.setIsEditingPost}
              editContent={m.editContent}
              setEditContent={m.setEditContent}
              editImageUrl={m.editImageUrl}
              setEditImageUrl={m.setEditImageUrl}
              editCategory={m.editCategory}
              setEditCategory={m.setEditCategory}
              onUpdate={m.handleUpdatePost}
              isUpdating={m.isUpdatingPost}
              onLike={m.handleLikePost}
              onClose={() => {
                m.setSelectedPost(null);
                m.setOverlayPos(null);
                m.setIsEditingPost(false);
              }}
              onViewUser={m.handleViewUser}
              onShare={(postId, lat, lng) => {
                const url = `${window.location.origin}/?post=${postId}&lat=${lat}&lng=${lng}`;
                navigator.clipboard.writeText(url);
                m.showToast("Link copied to clipboard!");
              }}
            />
          </CustomOverlayMap>
        )}

        {m.selectedPin && m.overlayPos && (
          <CustomOverlayMap position={m.overlayPos} yAnchor={1}>
            <PinOverlay 
              pin={m.selectedPin}
              currentUser={m.user}
              associatedPost={m.posts.find(p => p.id === m.selectedPin?.postId)}
              onClose={() => {
                m.setSelectedPin(null);
                m.setOverlayPos(null);
              }}
              onViewUser={m.handleViewUser}
              onGetDirections={m.startRouteToTarget}
              onViewPost={(post) => {
                m.setSelectedPost(post);
                m.setSelectedPin(null);
              }}
            />
          </CustomOverlayMap>
        )}

        {m.selectedPlace && m.overlayPos && (
          <CustomOverlayMap position={m.overlayPos} yAnchor={1}>
            <PlaceOverlay 
              place={m.selectedPlace}
              routeInfo={m.placeRouteInfo}
              onClose={() => {
                m.setSelectedPlace(null);
                m.setOverlayPos(null);
              }}
              onGetDirections={m.startRouteToTarget}
              onShare={(coord) => {
                m.setClickCoord(coord);
                m.setIsActionModalOpen(true);
                m.setSelectedPlace(null);
              }}
            />
          </CustomOverlayMap>
        )}
      </Map>

      {/* Map Controls */}
      <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-3">
        {/* Layer Toggle */}
        <div className="relative group/layers">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => m.setIsLayersOpen(!m.isLayersOpen)}
            className={cn(
              "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all border border-slate-100",
              m.isLayersOpen ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:text-brand-600"
            )}
          >
            <Layers className="w-6 h-6" />
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover/layers:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Map Layers
            </span>
          </motion.button>

          <AnimatePresence>
            {m.isLayersOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                className="absolute bottom-0 right-full mr-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 w-48"
              >
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Visible Layers</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => m.setShowPostsLayer(!m.showPostsLayer)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl transition-all",
                      m.showPostsLayer ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-bold">Stories</span>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
                      m.showPostsLayer ? "border-brand-600 bg-brand-600" : "border-slate-300"
                    )}>
                      {m.showPostsLayer && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>

                  <button 
                    onClick={() => m.setShowPinsLayer(!m.showPinsLayer)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl transition-all",
                      m.showPinsLayer ? "bg-brand-50 text-brand-700" : "hover:bg-slate-50 text-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-bold">Pins</span>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
                      m.showPinsLayer ? "border-brand-600 bg-brand-600" : "border-slate-300"
                    )}>
                      {m.showPinsLayer && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <button 
            onClick={() => map?.setLevel(map.getLevel() - 1, { animate: true })}
            className="w-14 h-14 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={() => map?.setLevel(map.getLevel() + 1, { animate: true })}
            className="w-14 h-14 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Minus className="w-6 h-6" />
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!m.user) {
              m.setIsAuthModalOpen(true);
              return;
            }
            m.setIsCreationMode(!m.isCreationMode);
          }}
          className={cn(
            "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all border border-slate-100 group relative",
            m.isCreationMode ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:text-brand-600"
          )}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {m.isCreationMode ? "Exit Creation Mode" : "Enter Creation Mode"}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRecenter}
          disabled={m.isLocating}
          className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-brand-600 transition-colors border border-slate-100 group relative"
        >
          {m.isLocating ? (
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Crosshair className="w-6 h-6" />
          )}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Recenter
          </span>
        </motion.button>
      </div>

      {/* Creation Mode Overlay */}
      {m.isCreationMode && (
        <>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-brand-600 rounded-full opacity-50 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-brand-600 rounded-full" />
                <div className="absolute w-6 h-px bg-brand-600" />
                <div className="absolute h-6 w-px bg-brand-600" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => {
                if (!m.user) m.setIsAuthModalOpen(true);
                else {
                  m.setClickCoord(m.center);
                  m.resolvePlaceAtCoord(m.center);
                  m.setIsCreationMode(false);
                }
              }}
              className="px-8 py-4 bg-brand-600 text-white rounded-full font-bold shadow-2xl shadow-brand-900/40 flex items-center gap-3 hover:bg-brand-700 transition-all"
            >
              <MapPin className="w-5 h-5" />
              Drop Pin at Center
            </motion.button>
          </div>
        </>
      )}

      {/* Navigation Rail */}
      <nav className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-[2.5rem] shadow-2xl border border-white/20">
        <NavItem 
          icon={Search} 
          label="Search" 
          active={m.isSearchOpen} 
          onClick={() => {
            m.setIsSearchOpen(!m.isSearchOpen);
            m.setSearchResults([]);
            m.setSearchMarkers([]);
          }} 
        />
        <NavItem 
          icon={RouteIcon} 
          label="Route" 
          active={m.isRouteMode} 
          onClick={() => {
            m.setIsRouteMode(!m.isRouteMode);
            m.setIsSearchOpen(false);
            m.setSearchResults([]);
            m.setSearchMarkers([]);
          }} 
        />
        <div className="w-px h-8 bg-slate-200 mx-1" />
        <NavItem 
          icon={PlusCircle} 
          label="Share" 
          className="bg-brand-600 text-white hover:bg-brand-700" 
          onClick={() => {
            if (!m.user) m.setIsAuthModalOpen(true);
            else {
              m.setClickCoord(m.center);
              m.setIsActionModalOpen(true);
            }
          }} 
        />
        <div className="w-px h-8 bg-slate-200 mx-1" />
        <NavItem 
          icon={MessageSquare} 
          label="Activity" 
          active={m.isMessagesOpen} 
          onClick={() => {
            m.setIsMessagesOpen(!m.isMessagesOpen);
            m.setSearchResults([]);
            m.setSearchMarkers([]);
          }} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={m.isSettingsOpen} 
          onClick={() => {
            m.setIsSettingsOpen(!m.isSettingsOpen);
            m.setSearchResults([]);
          }} 
        />
        <div className="w-px h-8 bg-slate-200 mx-1" />
        <NavItem 
          icon={LayoutList} 
          label="Feed" 
          active={m.isFeedOpen} 
          onClick={() => m.setIsFeedOpen(!m.isFeedOpen)} 
        />
      </nav>

      {/* Overlays */}
      <RouteOverlay 
        isOpen={m.isRouteMode}
        isSavedRoutesOpen={m.isSavedRoutesOpen}
        setIsSavedRoutesOpen={m.setIsSavedRoutesOpen}
        savedRoutes={m.savedRoutes}
        onFetchSavedRoutes={m.fetchSavedRoutes}
        onDeleteSavedRoute={m.deleteSavedRoute}
        onLoadSavedRoute={(r) => {
          m.setRoutePoints(r.points);
          m.setRoutePath(r.path);
          m.setRouteInfo({ distance: r.distance, duration: r.duration });
          m.setTransportMode(r.transportMode);
          m.setIsSavedRoutesOpen(false);
        }}
        transportMode={m.transportMode}
        setTransportMode={m.setTransportMode}
        routePoints={m.routePoints}
        setRoutePoints={m.setRoutePoints}
        isRouteLoading={m.isRouteLoading}
        routeError={m.routeError}
        routeOptions={m.routeOptions}
        selectedRouteIndex={m.selectedRouteIndex}
        onSelectRoute={m.selectRoute}
        routeInfo={m.routeInfo}
        onSaveRoute={m.saveRoute}
        onShareRoute={() => {}}
        isSavingRoute={m.isSavingRoute}
        onClearRoute={() => {
          m.setRoutePoints([]);
          m.setRoutePath([]);
          m.setRouteInfo(null);
          m.setRouteError(null);
        }}
        onPointClick={(p) => smoothMove(p.lat, p.lng)}
        onRemovePoint={(idx) => {
          const newPoints = m.routePoints.filter((_, i) => i !== idx);
          m.setRoutePoints(newPoints);
          if (newPoints.length >= 2) m.fetchRoute(newPoints);
          else {
            m.setRoutePath([]);
            m.setRouteInfo(null);
          }
        }}
      />

      <MessagesOverlay 
        isOpen={m.isMessagesOpen}
        onClose={() => m.setIsMessagesOpen(false)}
        posts={m.posts}
        onPostClick={(p) => {
          smoothMove(p.lat, p.lng);
          m.setSelectedPost(p);
          m.setOverlayPos({ lat: p.lat, lng: p.lng });
          m.setIsMessagesOpen(false);
        }}
        onViewUser={m.handleViewUser}
      />

      <SettingsOverlay 
        isOpen={m.isSettingsOpen}
        onClose={() => m.setIsSettingsOpen(false)}
        mapTypeId={m.mapTypeId}
        setMapTypeId={m.setMapTypeId}
      />

      {/* Modals */}
      <AuthModal 
        isOpen={m.isAuthModalOpen}
        onClose={() => m.setIsAuthModalOpen(false)}
        authMode={m.authMode}
        setAuthMode={m.setAuthMode}
        email={m.email}
        setEmail={m.setEmail}
        password={m.password}
        setPassword={m.setPassword}
        name={m.name}
        setName={m.setName}
        onSubmit={m.handleAuth}
      />

      <ActionModal 
        isOpen={m.isActionModalOpen}
        onClose={() => m.setIsActionModalOpen(false)}
        address={m.clickAddress}
        onAddPin={() => {
          m.setIsActionModalOpen(false);
          m.setIsPinModalOpen(true);
        }}
        onWritePost={() => {
          m.setIsActionModalOpen(false);
          m.setIsPostModalOpen(true);
        }}
      />

      <PostModal 
        isOpen={m.isPostModalOpen}
        onClose={() => m.setIsPostModalOpen(false)}
        clickCoord={m.clickCoord}
        setClickCoord={m.setClickCoord}
        address={m.clickAddress}
        content={m.content}
        setContent={m.setContent}
        imageUrl={m.imageUrl}
        setImageUrl={m.setImageUrl}
        category={m.postCategory}
        setCategory={m.setPostCategory}
        onSubmit={m.handleCreatePost}
      />

      <PinModal 
        isOpen={m.isPinModalOpen}
        onClose={() => m.setIsPinModalOpen(false)}
        address={m.clickAddress}
        pinTitle={m.pinTitle}
        setPinTitle={m.setPinTitle}
        pinDescription={m.pinDescription}
        setPinDescription={m.setPinDescription}
        pinCategory={m.pinCategory}
        setPinCategory={m.setPinCategory}
        onSubmit={m.handleCreatePin}
      />

      <ProfileModal 
        isOpen={m.isProfileOpen}
        onClose={() => m.setIsProfileOpen(false)}
        user={m.user}
        posts={m.posts}
        pins={m.pins}
        onEdit={() => m.setIsProfileEditModalOpen(true)}
        onPostClick={(p) => {
          smoothMove(p.lat, p.lng);
          m.setSelectedPost(p);
          m.setOverlayPos({ lat: p.lat, lng: p.lng });
          m.setIsProfileOpen(false);
        }}
        onPinClick={(p) => {
          smoothMove(p.lat, p.lng);
          m.setIsProfileOpen(false);
        }}
        fetchData={m.fetchData}
      />

      <ProfileEditModal 
        isOpen={m.isProfileEditModalOpen}
        onClose={() => m.setIsProfileEditModalOpen(false)}
        profileName={m.profileName}
        setProfileName={m.setProfileName}
        profileBio={m.profileBio}
        setProfileBio={m.setProfileBio}
        profilePic={m.profilePic}
        setProfilePic={m.setProfilePic}
        onSubmit={m.handleUpdateProfile}
      />

      <NotificationModal 
        isOpen={m.isNotificationsOpen}
        onClose={() => m.setIsNotificationsOpen(false)}
        notifications={m.notifications}
        onMarkAsRead={m.markNotificationAsRead}
        onMarkAllAsRead={m.markAllNotificationsAsRead}
        onViewPost={(postId) => {
          const post = m.posts.find(p => p.id === postId);
          if (post) {
            smoothMove(post.lat, post.lng);
            m.setSelectedPost(post);
            m.setOverlayPos({ lat: post.lat, lng: post.lng });
            m.setIsNotificationsOpen(false);
          }
        }}
        onViewUser={(userId) => {
          m.setIsNotificationsOpen(false);
          m.navigate(`/profile/${userId}`);
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {m.toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-24 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
              m.toast.type === 'success' 
                ? "bg-brand-600/90 border-brand-500 text-white" 
                : "bg-red-600/90 border-red-500 text-white"
            )}
          >
            <span className="text-sm font-bold">{m.toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Post Feed */}
      <AnimatePresence>
        {m.isFeedOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <PostFeed 
              posts={m.filteredPosts} 
              sortBy={m.sortBy}
              onSortChange={m.setSortBy}
              filterCategories={m.filterCategories}
              onFilterCategoriesChange={m.setFilterCategories}
              onPostClick={(p) => {
                smoothMove(p.lat, p.lng);
                m.setSelectedPost(p);
                m.setOverlayPos({ lat: p.lat, lng: p.lng });
                m.setIsEditingPost(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MapView />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
    </Routes>
  );
}
