"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SearchFilters({ locations }: { locations: any[] }) {
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    locationId: searchParams.get("locationId") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const handleApply = () => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.locationId) params.set("locationId", filters.locationId);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    
    router.push(`/?${params.toString()}`);
  };

  if (!hasMounted) return null;

  return (
    <Card className="h-fit sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Saralash</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>E'lon turi</Label>
          <Tabs value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="">Barchasi</TabsTrigger>
              <TabsTrigger value="sale">Sotuv</TabsTrigger>
              <TabsTrigger value="rent">Ijara</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label>Hudud</Label>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.locationId}
            onChange={(e) => setFilters({...filters, locationId: e.target.value})}
          >
            <option value="">Barchasi</option>
            {locations.map((loc: any) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}

          </select>
        </div>

        <div className="space-y-2">
          <Label>Narx ($)</Label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Dan" 
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            />
            <Input 
              type="number" 
              placeholder="Gacha" 
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>
        </div>

        <Button className="w-full" onClick={handleApply}>
          Qo'llash
        </Button>
      </CardContent>
    </Card>
  );
}
