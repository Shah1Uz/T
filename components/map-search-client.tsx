"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  Filter, 
  X,
  Building2,
  BedDouble,
  Maximize2,
  Check,
  Undo2,
  RotateCcw,
  Save,
  Bell
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MapSearchClient() {
  const { t, locale } = useLocale();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list'); // 'list' or 'map' for mobile
  
  const [filters, setFilters] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
    rooms: "",
  });
  const [drawingActive, setDrawingActive] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<any[] | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  // Calculate distance between two points
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    fetch("/api/listings/map")
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setFilteredListings(data);
        setLoading(false);
      });

    // Fetch saved searches
    fetch("/api/user/saved-searches")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedSearches(data);
        }
      })
      .catch(err => console.error("Failed to fetch saved searches:", err));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || loading) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("geoman-css")) {
      const link = document.createElement("link");
      link.id = "geoman-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || mapRef.current) return;

      const map = L.map(mapContainer.current, {
        zoomControl: false
      }).setView([41.2995, 69.2401], 12); // Toshkent center
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      updateMarkers();
      renderSavedPolygons();
    };

    if ((window as any).L && (window as any).L.PM) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        const pmScript = document.createElement("script");
        pmScript.src = "https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.min.js";
        pmScript.onload = initMap;
        document.body.appendChild(pmScript);
      };
      document.body.appendChild(script);
    }
  }, [loading]);

  const updateMarkers = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredListings.forEach(listing => {
      const icon = L.divIcon({
        className: "",
        html: `
          <div class="marker-pin-modern-map" style="
            background: white;
            padding: 5px 12px;
            border-radius: 20px;
            color: #0f172a;
            font-weight: 900;
            font-size: 13px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
            white-space: nowrap;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            transform-origin: bottom center;
          ">
            $${(listing.price / 1000).toFixed(0)}k
            <div style="
              position: absolute;
              bottom: -4px;
              left: 50%;
              transform: translateX(-50%);
              width: 0; height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid white;
            "></div>
          </div>
        `,
        iconSize: [50, 30],
        iconAnchor: [25, 30],
      });

      // Filter by polygon if active
      if (polygonPoints && !isPointInPolygon([listing.latitude, listing.longitude], polygonPoints)) {
        return;
      }

      const marker = L.marker([listing.latitude, listing.longitude], { icon })
        .addTo(mapRef.current)
        .on('click', () => setSelectedListing(listing));
      
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    updateMarkers();
  }, [filteredListings, polygonPoints]);

  useEffect(() => {
    if (viewMode === 'map' && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [viewMode]);

  const renderSavedPolygons = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !savedSearches.length) return;

    savedSearches.forEach(search => {
      if (search.polygon && Array.isArray(search.polygon)) {
        L.polygon(search.polygon, {
          color: '#3D5AFE',
          fillColor: '#3D5AFE',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5'
        }).addTo(mapRef.current);
      }
    });
  };

  useEffect(() => {
    renderSavedPolygons();
  }, [savedSearches]);

  const isPointInPolygon = (point: number[], polygon: any[]) => {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const toggleDrawing = () => {
    if (!mapRef.current) return;
    if (drawingActive) {
      mapRef.current.pm.disableDraw();
      setDrawingActive(false);
    } else {
      mapRef.current.pm.enableDraw('Polygon', {
        snappable: true,
        snapDistance: 20,
      });
      setDrawingActive(true);
      
      mapRef.current.on('pm:create', (e: any) => {
        const layer = e.layer;
        const coords = layer.getLatLngs()[0];
        setPolygonPoints(coords);
        setDrawingActive(false);
        mapRef.current.pm.disableDraw();
        
        // Remove the drawn layer from map as we use our own state to filter
        layer.remove();
      });
    }
  };

  const clearPolygon = () => {
    setPolygonPoints(null);
  };

  const handleSaveSearch = async () => {
    try {
      const res = await fetch("/api/user/saved-searches", {
        method: "POST",
        body: JSON.stringify({
          name: `Search ${new Date().toLocaleDateString()}`,
          filters,
          polygon: polygonPoints
        })
      });
      if (res.ok) {
        setShowSuccessModal(true);
        // Add to local list to display immediately
        const newSearch = await res.json();
        setSavedSearches(prev => [newSearch, ...prev]);
        setPolygonPoints(null); // Clear temporary drawing
      }
    } catch (e) {
      console.error("Save search failed:", e);
    }
  };

  const applyFilters = () => {
    let result = [...listings];
    if (filters.type) result = result.filter(l => l.type === filters.type);
    if (filters.minPrice) result = result.filter(l => l.price >= parseInt(filters.minPrice));
    if (filters.maxPrice) result = result.filter(l => l.price <= parseInt(filters.maxPrice));
    if (filters.rooms) result = result.filter(l => l.rooms === parseInt(filters.rooms));
    setFilteredListings(result);
  };

  const centerOnUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      mapRef.current?.setView([latitude, longitude], 14);
    });
  };

  return (
    <div className="fixed inset-0 pt-[68px] 3xl:pt-[100px] flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Sidebar Filter/List */}
      <div className={cn(
        "w-full md:w-[400px] h-full flex flex-col border-r bg-card z-20 shadow-xl overflow-hidden transition-all duration-300",
        viewMode === 'map' ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t("hero.search_placeholder")} 
                className="pl-9 h-10 rounded-xl bg-muted/50 border-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
            <Button 
              size="sm" 
              variant={filters.type === "sale" ? "default" : "outline"} 
              onClick={() => {
                const newType = filters.type === "sale" ? "" : "sale";
                setFilters({...filters, type: newType});
              }}
              className="rounded-full h-8 px-4 text-xs font-bold"
            >
              {t("listing.sale")}
            </Button>
            <Button 
              size="sm" 
              variant={filters.type === "rent" ? "default" : "outline"}
              onClick={() => {
                const newType = filters.type === "rent" ? "" : "rent";
                setFilters({...filters, type: newType});
              }}
              className="rounded-full h-8 px-4 text-xs font-bold"
            >
              {t("listing.rent")}
            </Button>
            <Button size="sm" variant="outline" className="rounded-full h-8 px-4 text-xs font-bold flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> {locale === "uz" ? "Filtrlar" : "Фильтры"}
            </Button>
          </div>
        </div>

        {/* Listings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {filteredListings.length} {locale === "uz" ? "ta e'lon topildi" : "объявлений найдено"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredListings.map(listing => (
              <div 
                key={listing.id}
                onMouseEnter={() => {
                   mapRef.current?.setView([listing.latitude, listing.longitude], 15);
                }}
                className={cn(
                  "flex bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group",
                  selectedListing?.id === listing.id ? "ring-2 ring-primary" : ""
                )}
                onClick={() => setSelectedListing(listing)}
              >
                <div className="relative w-32 shrink-0 aspect-square overflow-hidden bg-muted">
                  <Image 
                    src={listing.images[0]?.url || "/placeholder-property.jpg"} 
                    fill 
                    alt={listing.title} 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{listing.title}</h4>
                    <p className="text-base font-black text-primary mt-0.5 tabular-nums">
                      ${listing.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 opacity-60">
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <BedDouble className="h-3 w-3" /> {listing.rooms}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <Maximize2 className="h-3 w-3" /> {listing.area}m²
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className={cn(
        "flex-1 relative h-full",
        viewMode === 'list' ? "hidden md:block" : "block"
      )}>
        <div ref={mapContainer} className="w-full h-full z-10" />
        
        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-10 w-10 rounded-xl bg-card/90 backdrop-blur-md shadow-lg"
            onClick={centerOnUser}
          >
            <Navigation className="h-5 w-5" />
          </Button>

          <Button 
            size="icon" 
            variant={drawingActive ? "default" : "secondary"}
            className={cn(
              "h-10 w-10 rounded-xl bg-card/90 backdrop-blur-md shadow-lg transition-all",
              drawingActive && "ring-2 ring-primary bg-primary text-white"
            )}
            onClick={toggleDrawing}
          >
            <Undo2 className="h-5 w-5" />
          </Button>

          {polygonPoints && (
            <Button 
              size="icon" 
              variant="destructive"
              className="h-10 w-10 rounded-xl shadow-lg"
              onClick={clearPolygon}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}

          <Button 
            size="icon" 
            variant="secondary"
            className="h-10 w-10 rounded-xl bg-card/90 backdrop-blur-md shadow-lg"
            onClick={handleSaveSearch}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Quick Info Popup */}
        {selectedListing && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-32px)] max-w-sm bg-card dark:bg-slate-900 rounded-[32px] p-2 shadow-2xl border border-border/20 animate-in fade-in slide-in-from-bottom-5">
             <div className="flex gap-4">
                <Link href={`/listings/${selectedListing.id}`} className="relative w-32 h-32 rounded-[24px] overflow-hidden shrink-0 hover:opacity-90 transition-opacity">
                   <Image src={selectedListing.images[0]?.url || "/placeholder-property.jpg"} fill alt="" className="object-cover" />
                </Link>
                <div className="flex-1 py-1 pr-4 min-w-0 flex flex-col justify-between">
                   <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">{selectedListing.type}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedListing(null)}><X className="h-4 w-4" /></Button>
                      </div>
                       <Link href={`/listings/${selectedListing.id}`}>
                          <h3 className="font-black text-lg truncate mt-1 hover:text-primary transition-colors cursor-pointer">{selectedListing.title}</h3>
                       </Link>
                       <p className="text-xl font-black text-primary">${selectedListing.price.toLocaleString()}</p>
                    </div>
                   <Link href={`/listings/${selectedListing.id}`} className="block">
                      <Button className="w-full h-9 rounded-xl text-xs font-bold">Batafsil ko'rish</Button>
                   </Link>
                </div>
             </div>
          </div>
        )}

        {/* Prominent Save Button after drawing */}
        <AnimatePresence>
          {polygonPoints && !showSuccessModal && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100]"
            >
              <Button 
                onClick={handleSaveSearch}
                size="lg"
                className="rounded-full shadow-2xl px-10 h-14 bg-primary text-white font-black flex items-center gap-3 border-4 border-white/20 backdrop-blur-md animate-bounce-subtle"
              >
                <Save className="h-6 w-6" />
                {locale === "uz" ? "Hududni saqlash" : "Сохранить область"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Notification Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-white/20 flex flex-col items-center text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 blur-[60px] rounded-full -z-10" />
              
              <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-3xl animate-pulse" />
                 <Bell className="h-10 w-10 text-primary relative z-10" />
              </div>
              
              <h3 className="text-2xl font-black mb-3 tracking-tight">
                {locale === "uz" ? "Qidiruv saqlandi!" : "Поиск сохранен!"}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed mb-8">
                {locale === "uz" 
                  ? "Siz chizgan hudud bo'yicha yangi e'lonlar chiqsa, biz sizga darhol bildirishnoma yuboramiz." 
                  : "Мы отправим вам уведомление, как только появятся новые объявления в выбранной вами области."}
              </p>
              
              <Button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {locale === "uz" ? "Tushunarli" : "Понятно"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] md:hidden">
        <Button 
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="rounded-full shadow-2xl px-6 h-12 bg-primary text-white font-bold flex items-center gap-2 border-2 border-white/20 backdrop-blur-md"
        >
          {viewMode === 'list' ? (
            <>
              <MapPin className="h-5 w-5" />
              {locale === "uz" ? "Xaritada ko'rish" : "Показать на карте"}
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              {locale === "uz" ? "Ro'yxatni ko'rish" : "Показать списком"}
            </>
          )}
        </Button>
      </div>

      <style jsx global>{`
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .marker-pin-modern-map:hover {
          transform: scale(1.15) translateY(-5px);
          z-index: 1000 !important;
          background: #3D5AFE !important;
          color: white !important;
          box-shadow: 0 10px 30px rgba(61,90,254,0.3);
        }
        .marker-pin-modern-map:hover div {
          border-top-color: #3D5AFE !important;
        }
        .leaflet-container {
          background: #f1f5f9 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          margin-right: 20px !important;
          margin-bottom: 20px !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 14px !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
          margin: 4px !important;
          color: #1e293b !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-weight: 900 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
        }
        .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
          background: white !important;
          color: #3D5AFE !important;
          transform: scale(1.05);
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-10px) translateX(-50%); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
