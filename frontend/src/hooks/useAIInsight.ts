import { useState, useEffect, useRef } from "react";

export interface AIInsight {
  insight: string;
  tips: string[];
}

const DELHI_AREAS: { name: string; bounds: [number, number, number, number] }[] = [
  { name: "Connaught Place", bounds: [28.62, 77.20, 28.64, 77.23] },
  { name: "Paharganj", bounds: [28.63, 77.20, 28.66, 77.22] },
  { name: "South Delhi", bounds: [28.51, 77.19, 28.58, 77.26] },
  { name: "Old Delhi", bounds: [28.64, 77.22, 28.68, 77.27] },
  { name: "Karol Bagh", bounds: [28.64, 77.18, 28.67, 77.21] },
  { name: "Lajpat Nagar", bounds: [28.56, 77.23, 28.59, 77.26] },
  { name: "Hauz Khas", bounds: [28.54, 77.19, 28.56, 77.22] },
  { name: "Dwarka", bounds: [28.55, 77.04, 28.62, 77.10] },
];

function getAreaName(pos: [number, number]): string {
  for (const area of DELHI_AREAS) {
    if (pos[0] >= area.bounds[0] && pos[0] <= area.bounds[2] && pos[1] >= area.bounds[1] && pos[1] <= area.bounds[3]) {
      return area.name;
    }
  }
  return "Delhi";
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function getRiskLevel(safetyScore: number): string {
  if (safetyScore >= 75) return "low";
  if (safetyScore >= 55) return "moderate";
  if (safetyScore >= 35) return "high";
  return "critical";
}

export function useAIInsight(
  userPos: [number, number] | null,
  safetyScore: number
): { insight: AIInsight | null; loading: boolean; refresh: () => void } {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const fetchCountRef = useRef<number>(0);

  const fetchInsight = async (pos: [number, number], score: number) => {
    const now = Date.now();
    if (now - lastFetchRef.current < 60000) return;
    lastFetchRef.current = now;
    fetchCountRef.current++;

    setLoading(true);
    try {
      const area = getAreaName(pos);
      const timeOfDay = getTimeOfDay();
      const riskLevel = getRiskLevel(score);

      const res = await fetch("/api/ai/safety-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos[0],
          longitude: pos[1],
          area,
          riskLevel,
          timeOfDay,
        }),
      });

      if (res.ok) {
        const data = await res.json() as AIInsight;
        setInsight(data);
      } else {
        throw new Error("API error");
      }
    } catch {
      setInsight({
        insight: `Stay aware of your surroundings in Delhi. Keep emergency contacts ready and stay in well-lit areas during the ${getTimeOfDay()}.`,
        tips: [
          "Stay in well-lit, crowded areas",
          "Keep phone charged — call 112 if needed",
          "Share live location with a trusted contact",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPos && fetchCountRef.current === 0) {
      fetchInsight(userPos, safetyScore);
    }
  }, [userPos]);

  const refresh = () => {
    if (userPos) {
      lastFetchRef.current = 0;
      fetchInsight(userPos, safetyScore);
    }
  };

  return { insight, loading, refresh };
}
