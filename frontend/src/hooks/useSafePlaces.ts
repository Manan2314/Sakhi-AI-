import { useState, useEffect, useCallback } from "react";
import { apiFetch, endpoints } from "@/lib/api";

export interface SafePlace {
  id: number;
  name: string;
  type: string;
  distance: number;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  priority: number;
}

export function useSafePlaces(userPos: [number, number] | null) {
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = useCallback(async () => {
    if (!userPos) return;
    setLoading(true);
    try {
      const data = await apiFetch(endpoints.getSafePlaces(userPos[0], userPos[1]));
      setPlaces(data);
    } catch (err) {
      console.error("Failed to fetch safe places", err);
    } finally {
      setLoading(false);
    }
  }, [userPos]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return { places, loading, refresh: fetchPlaces };
}
