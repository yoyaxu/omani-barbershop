"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface ShopData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsappNumber: string;
  instagram: string | null;
  facebook: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  openingTime: string;
  closingTime: string;
  themeColor: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  isActive: boolean;
}

export interface ServiceData {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
}

export interface GalleryImageData {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

interface ShopContextType {
  shop: ShopData | null;
  services: ServiceData[];
  galleryImages: GalleryImageData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const ShopContext = createContext<ShopContextType>({
  shop: null,
  services: [],
  galleryImages: [],
  loading: true,
  error: null,
  refetch: () => {},
});

export function useShop() {
  return useContext(ShopContext);
}

function getShopSlug(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const isLocalhost = hostname.includes("localhost");

  if (isLocalhost) {
    if (parts.length >= 2 && parts[0] !== "www") {
      return parts[0];
    }
  } else {
    if (parts.length >= 3 && parts[0] !== "www") {
      return parts[0];
    }
  }

  // Check if we're on a /shop/[slug] route
  const pathParts = window.location.pathname.split("/");
  const shopIndex = pathParts.indexOf("shop");
  if (shopIndex !== -1 && pathParts[shopIndex + 1]) {
    return pathParts[shopIndex + 1];
  }

  return null;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShopData = useCallback(async () => {
    const slug = getShopSlug();
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/shops/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Barbería no encontrada");
        } else {
          setError("Error al cargar datos");
        }
        setShop(null);
        return;
      }
      const data = await res.json();
      setShop(data.shop);
      setServices(data.services || []);
      setGalleryImages(data.galleryImages || []);
      setError(null);
    } catch {
      setError("Error de conexión");
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  return (
    <ShopContext.Provider
      value={{
        shop,
        services,
        galleryImages,
        loading,
        error,
        refetch: fetchShopData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
