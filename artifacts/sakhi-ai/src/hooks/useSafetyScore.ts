import { useMemo } from "react";
import { DELHI_SAFE_PLACES, DELHI_DANGER_ZONES, getDistanceKm } from "@/data/delhiData";

export interface SafetyScoreBreakdown {
  score: number;
  color: "emerald" | "yellow" | "orange" | "red";
  label: string;
  factors: { label: string; impact: number; positive: boolean }[];
}

const AREA_RISK: Record<string, number> = {
  "28.65,77.22": 30,
  "28.64,77.21": 25,
  "28.52,77.30": 20,
  "28.50,77.24": 20,
  "28.61,77.31": 20,
};

function getAreaRisk(pos: [number, number]): number {
  let riskPenalty = 0;
  DELHI_DANGER_ZONES.forEach((zone) => {
    const dist = getDistanceKm(pos, zone.pos);
    if (dist < zone.radius / 1000 + 0.3) {
      riskPenalty += Math.max(0, 30 * (1 - dist / (zone.radius / 1000 + 0.3)));
    }
  });
  return Math.min(50, riskPenalty);
}

function getNearestPoliceBoost(pos: [number, number]): number {
  const stations = DELHI_SAFE_PLACES.filter((p) => p.type === "police");
  const minDist = Math.min(...stations.map((s) => getDistanceKm(pos, s.pos)));
  if (minDist < 0.3) return 20;
  if (minDist < 0.7) return 12;
  if (minDist < 1.5) return 6;
  return 0;
}

function getNearestHospitalBoost(pos: [number, number]): number {
  const hospitals = DELHI_SAFE_PLACES.filter((p) => p.type === "hospital");
  const minDist = Math.min(...hospitals.map((h) => getDistanceKm(pos, h.pos)));
  if (minDist < 0.5) return 10;
  if (minDist < 1.5) return 5;
  return 0;
}

function getTimeOfDayPenalty(): number {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) return 20;
  if (hour >= 20 || hour < 7) return 10;
  return 0;
}

export function useSafetyScore(
  userPos: [number, number] | null,
  guardianActive: boolean,
  stalkerThreat: "none" | "low" | "medium" | "high",
  nearbyReportCount: number = 0
): SafetyScoreBreakdown {
  return useMemo(() => {
    if (!userPos) {
      return { score: 75, color: "emerald", label: "Good", factors: [] };
    }

    let score = 100;
    const factors: { label: string; impact: number; positive: boolean }[] = [];

    const riskPenalty = getAreaRisk(userPos);
    if (riskPenalty > 0) {
      score -= riskPenalty;
      factors.push({ label: "Danger zone proximity", impact: -riskPenalty, positive: false });
    }

    const policeBoost = getNearestPoliceBoost(userPos);
    if (policeBoost > 0) {
      score += policeBoost;
      factors.push({ label: "Police station nearby", impact: policeBoost, positive: true });
    }

    const hospitalBoost = getNearestHospitalBoost(userPos);
    if (hospitalBoost > 0) {
      score += hospitalBoost;
      factors.push({ label: "Hospital nearby", impact: hospitalBoost, positive: true });
    }

    const timePenalty = getTimeOfDayPenalty();
    if (timePenalty > 0) {
      score -= timePenalty;
      factors.push({ label: "Night time risk", impact: -timePenalty, positive: false });
    }

    if (guardianActive) {
      score += 8;
      factors.push({ label: "Guardian mode active", impact: 8, positive: true });
    }

    const stalkerPenalty = stalkerThreat === "high" ? 25 : stalkerThreat === "medium" ? 12 : stalkerThreat === "low" ? 5 : 0;
    if (stalkerPenalty > 0) {
      score -= stalkerPenalty;
      factors.push({ label: "Suspicious movement detected", impact: -stalkerPenalty, positive: false });
    }

    if (nearbyReportCount > 0) {
      const reportPenalty = Math.min(15, nearbyReportCount * 5);
      score -= reportPenalty;
      factors.push({ label: `${nearbyReportCount} community report(s) nearby`, impact: -reportPenalty, positive: false });
    }

    score = Math.min(100, Math.max(5, Math.round(score)));

    const color: SafetyScoreBreakdown["color"] =
      score >= 75 ? "emerald" : score >= 55 ? "yellow" : score >= 35 ? "orange" : "red";
    const label = score >= 75 ? "Good" : score >= 55 ? "Moderate" : score >= 35 ? "Caution" : "Danger";

    return { score, color, label, factors };
  }, [userPos, guardianActive, stalkerThreat, nearbyReportCount]);
}
