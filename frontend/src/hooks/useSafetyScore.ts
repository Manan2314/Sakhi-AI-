import { useState, useEffect, useCallback } from "react";
import { apiFetch, endpoints } from "@/lib/api";

export interface SafetyBreakdown {
  score: number;
  risk_level: string;
  color: string;
  breakdown: Record<string, number>;
}

export function useSafetyScore(pos: [number, number] | null) {
  const [data, setData] = useState<SafetyBreakdown>({
    score: 100,
    risk_level: "safe",
    color: "emerald",
    breakdown: {}
  });

  const fetchScore = useCallback(async () => {
    if (!pos) return;
    
    // Automatically get userId from localStorage within the hook for simple linkage
    const userId = localStorage.getItem("sakhi_user_id");

    try {
      const res = await apiFetch(endpoints.getSafetyScore(
        pos[0], 
        pos[1], 
        userId ? parseInt(userId) : undefined
      ));

      const colorMap: Record<string, string> = {
        safe: "emerald",
        medium: "yellow",
        unsafe: "red",
      };

      setData({
        score: res.score,
        risk_level: res.risk_level,
        color: colorMap[res.risk_level] || "emerald",
        breakdown: res.breakdown || {},
      });
    } catch (err) {
      console.error("Safety fetch error:", err);
    }
  }, [pos]);

  useEffect(() => {
    fetchScore();
    const timer = setInterval(fetchScore, 15000);
    return () => clearInterval(timer);
  }, [fetchScore]);

  return data;
}
