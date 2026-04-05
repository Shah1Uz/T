"use client";

import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  ShoppingBag, 
  Trees, 
  Hospital, 
  MapPin,
  Loader2,
  AlertCircle,
  TrainFront,
  Bus
} from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Amenity {
  type: string;
  name: string;
  distance: number;
}

interface AmenitiesViewProps {
  lat: number;
  lng: number;
}

export default function AmenitiesView({ lat, lng }: AmenitiesViewProps) {
  const { t, locale } = useLocale();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Haversine formula to calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    const fetchAmenities = async () => {
      setLoading(true);
      setError(false);
      
      const mirrors = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.osm.ch/api/interpreter"
      ];

      const query = `
        [out:json][timeout:20];
        (
          node["amenity"~"school|kindergarten|hospital|university"](around:1500, ${lat}, ${lng});
          node["leisure"~"park|playground"](around:1500, ${lat}, ${lng});
          node["shop"~"supermarket|mall|convenience"](around:1500, ${lat}, ${lng});
          node["railway"~"station|subway_entrance"](around:1500, ${lat}, ${lng});
          node["amenity"~"bus_station|bus_stop"](around:1500, ${lat}, ${lng});
          way["amenity"~"school|kindergarten|hospital|university"](around:1500, ${lat}, ${lng});
          way["leisure"~"park|playground"](around:1500, ${lat}, ${lng});
          way["shop"~"supermarket|mall|convenience"](around:1500, ${lat}, ${lng});
          way["railway"~"station|subway_entrance"](around:1500, ${lat}, ${lng});
        );
        out center;
      `;

      for (const mirror of mirrors) {
        try {
          console.log(`Fetching amenities from ${mirror}...`);
          const response = await fetch(mirror, {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            signal: AbortSignal.timeout(10000), // 10s timeout
          });

          if (response.ok) {
            const data = await response.json();
            if (data.elements) {
              const results: Amenity[] = data.elements
                .map((el: any) => {
                  const elLat = el.lat || el.center?.lat;
                  const elLng = el.lon || el.center?.lon;
                  const tags = el.tags || {};
                  
                  let type = "other";
                  if (tags.amenity === "school" || tags.amenity === "university" || tags.amenity === "kindergarten") type = "education";
                  if (tags.leisure === "park" || tags.leisure === "playground") type = "park";
                  if (tags.shop) type = "shop";
                  if (tags.amenity === "hospital") type = "hospital";
                  if (tags.railway === "station" || tags.railway === "subway_entrance") type = "metro";
                  if (tags.amenity === "bus_station" || tags.amenity === "bus_stop") type = "bus";

                  return {
                    type,
                    name: tags.name || tags["name:uz"] || tags["name:ru"] || "—",
                    distance: Math.round(calculateDistance(lat, lng, elLat, elLng)),
                  };
                })
                .filter((a: Amenity) => a.name !== "—")
                .sort((a: Amenity, b: Amenity) => a.distance - b.distance)
                .reduce((acc: Amenity[], curr: Amenity) => {
                  if (!acc.find(x => x.name === curr.name)) acc.push(curr);
                  return acc;
                }, [])
                .slice(0, 8);

              setAmenities(results);
              setLoading(false);
              return; // Success!
            }
          }
        } catch (err) {
          console.warn(`Mirror ${mirror} failed, trying next...`, err);
        }
      }

      // If all mirrors fail
      setError(true);
      setLoading(false);
    };

    fetchAmenities();
  }, [lat, lng]);

  const getIcon = (type: string) => {
    switch (type) {
      case "education": return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "park": return <Trees className="h-4 w-4 text-emerald-500" />;
      case "shop": return <ShoppingBag className="h-4 w-4 text-amber-500" />;
      case "hospital": return <Hospital className="h-4 w-4 text-red-500" />;
      case "metro": return <TrainFront className="h-4 w-4 text-indigo-500" />;
      case "bus": return <Bus className="h-4 w-4 text-blue-400" />;
      default: return <MapPin className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      uz: {
        education: "Ta'lim",
        park: "Bog'lar",
        shop: "Do'konlar",
        hospital: "Tibbiyot",
        metro: "Metro",
        bus: "Avtobus",
        other: "Boshqa"
      },
      ru: {
        education: "Образование",
        park: "Парки",
        shop: "Магазины",
        hospital: "Медицина",
        metro: "Метро",
        bus: "Автобус",
        other: "Другое"
      }
    };
    return labels[locale]?.[type] || labels.uz[type];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-[24px] border border-border/50 animate-pulse">
      <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
        {locale === "uz" ? "Yaqin-atrof tahlil qilinmoqda..." : "Анализ окрестностей..."}
      </p>
    </div>
  );

  if (error || amenities.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-foreground tracking-tight">
          {locale === "uz" ? "Yaqin-atrofda nimalar bor?" : "Что находится рядом?"}
        </h3>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full uppercase">1.5 km {locale === "uz" ? "radiusda" : "радиус"}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-none bg-card dark:bg-card/50 hover:bg-muted/50 transition-all duration-300 rounded-[20px] shadow-sm hover:shadow-md border border-border/50 overflow-hidden group">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate max-w-[140px] sm:max-w-[200px]">{item.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{getTypeLabel(item.type)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-primary">{item.distance}m</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{Math.round(item.distance / 80)} min🚶</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
