import { useState, useCallback } from "react";
import { apiFetch, endpoints } from "@/lib/api";

export interface UnsafeSegment {
  lat: number;
  lng: number;
  score: number;
  incident_types: string[];
}

export interface RouteData {
  type: "shortest" | "safest";
  route_type: "shortest" | "safest";
  coordinates: [number, number][];
  distance: number;
  duration: number;
  average_score?: number;
  worst_score?: number;
  unsafe_segments?: UnsafeSegment[];
  explanation?: string;
}

export interface RouteAnalysis {
  routes: RouteData[];
}

export function useRouteAnalysis() {
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRoute = useCallback(async (start: [number, number], end: [number, number], userId?: number, prefs?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Serialize points as a simple line for the backend request
      // The backend generates 12 points internally, but we can pass start and end
      const pointsParam = `${start[0]},${start[1]}|${end[0]},${end[1]}`;
      const data = await apiFetch(endpoints.getSafeRoute(pointsParam, userId, prefs));
      setAnalysis(data);
    } catch (err: any) {
      console.error("Route analysis failed", err);
      setError(err.message || "Routing service temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  return { analysis, loading, error, analyzeRoute, clear: () => { setAnalysis(null); setError(null); } };
}
