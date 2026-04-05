"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onSelect, initialLat, initialLng }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainer.current) return;

      const center: [number, number] = initialLat && initialLng 
        ? [initialLat, initialLng] 
        : [41.2995, 69.2401];

      const map = L.map(mapContainer.current).setView(center, initialLat ? 16 : 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const makeIcon = (L: any) => L.divIcon({
        className: "",
        html: `<div style="
          background: #3D5AFE;
          width: 40px; height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 20px rgba(61,90,254,0.5);
          border: 3px solid white;
        "></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], { icon: makeIcon(L) }).addTo(map);
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lng });
        onSelect(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: makeIcon(L) }).addTo(map);
        }
      });
    };

    if ((window as any).L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: "260px" }} />

      {/* Instruction overlay */}
      {!coords && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2 text-sm font-medium text-foreground pointer-events-none">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span>Xaritada joylashuvni bosing</span>
        </div>
      )}
      {coords && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-primary/10 border border-primary/30 px-4 py-2 rounded-full shadow text-sm font-semibold text-primary pointer-events-none">
          ✓ {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}
