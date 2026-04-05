"use client";

import { useEffect, useRef } from "react";

interface ListingMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function ListingMap({ lat, lng, title }: ListingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

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

    const loadMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainer.current) return;

      const map = L.map(mapContainer.current).setView([lat, lng], 15);
      mapRef.current = map;

      // CartoDB Voyager — cleaner, more modern tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Custom Modern Marker with subtle pulse
      const icon = L.divIcon({
        className: "custom-modern-marker",
        html: `
          <div class="marker-wrapper">
            <div class="marker-pulse"></div>
            <div class="marker-pin-modern">
               <div class="marker-inner"></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map);
      
      marker.bindPopup(`
          <div class="modern-popup-content">
            <h4 style="margin: 0; font-weight: 800; font-size: 14px; color: #1e293b;">${title}</h4>
            <div style="height: 2px; width: 20px; background: #3D5AFE; margin: 4px 0;"></div>
            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">E'lon manzili</p>
          </div>
        `, {
          className: 'modern-leaflet-popup',
          closeButton: false,
          offset: [0, -30]
        }).openPopup();
    };

    // Load Leaflet script if not already loaded
    if ((window as any).L) {
      loadMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = loadMap;
      document.body.appendChild(script);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, title]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner border border-border/10">
      <div
        ref={mapContainer}
        className="w-full h-full z-0"
        style={{ minHeight: "300px" }}
      />
      <style jsx global>{`
        .marker-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-pin-modern {
          width: 24px;
          height: 24px;
          background: #3D5AFE;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(61,90,254,0.4);
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-inner {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
        }
        .marker-pulse {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #3D5AFE;
          border-radius: 50%;
          opacity: 0.6;
          animation: marker-pulse-animation 2s infinite;
          z-index: 1;
        }
        @keyframes marker-pulse-animation {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
        .modern-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 8px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0,0,0,0.05);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
        }
        .modern-leaflet-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: none;
        }
        .leaflet-container {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}
