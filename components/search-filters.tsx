"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomSelect from "@/components/custom-select";
import { useLocale } from "@/context/locale-context";

export default function SearchFilters({ locations }: { locations: any[] }) {
  const { locale } = useLocale();
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
          <CustomSelect 
            label={locale === "uz" ? "Hudud" : "Регион"}
            value={filters.locationId}
            options={[{ value: "", label: locale === "uz" ? "Barchasi" : "Все" }, ...locations.map((loc: any) => ({ value: loc.id, label: loc.name }))]}
            onChange={(val) => setFilters({...filters, locationId: val})}
            searchable
          />
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
