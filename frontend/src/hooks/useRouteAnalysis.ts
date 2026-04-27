import { useState, useCallback } from "react";
import { apiFetch, endpoints } from "@/lib/api";

export interface RoutePoint {
  pos: [number, number];
  score: number;
  risk_level: string;
}

export interface RouteAnalysis {
  average_score: number;
  worst_score: number;
  route_risk: string;
  recommendation: string;
  points: RoutePoint[];
}

export function useRouteAnalysis() {
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeRoute = useCallback(async (start: [number, number], end: [number, number], prefs?: string) => {
    setLoading(true);
    try {
      // Serialize points as a simple line for the backend request
      // The backend generates 12 points internally, but we can pass start and end
      const pointsParam = `${start[0]},${start[1]}|${end[0]},${end[1]}`;
      const data = await apiFetch(endpoints.getSafeRoute(pointsParam, prefs));
      setAnalysis(data);
    } catch (err) {
      console.error("Route analysis failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analysis, loading, analyzeRoute, clear: () => setAnalysis(null) };
}
