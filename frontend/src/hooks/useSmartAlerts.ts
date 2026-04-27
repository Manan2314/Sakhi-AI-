import { useMemo } from "react";
import { DELHI_DANGER_ZONES, getDistanceKm } from "@/data/delhiData";

export type AlertSeverity = "info" | "warning" | "danger" | "critical";

export interface SmartAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  icon: string;
  timestamp: number;
}

export function useSmartAlerts(
  userPos: [number, number] | null,
  stalkerThreat: "none" | "low" | "medium" | "high",
  safetyScore: number,
  nearbyReportCount: number = 0
): SmartAlert[] {
  return useMemo(() => {
    const alerts: SmartAlert[] = [];
    const now = Date.now();

    if (!userPos) return alerts;

    DELHI_DANGER_ZONES.forEach((zone) => {
      const dist = getDistanceKm(userPos, zone.pos);
      const threshold = zone.radius / 1000 + 0.2;
      if (dist < threshold) {
        const isVeryClose = dist < zone.radius / 1000;
        alerts.push({
          id: `zone-${zone.name}`,
          severity: isVeryClose ? "critical" : "danger",
          title: isVeryClose ? `⛔ Inside ${zone.name}` : `⚠️ Near ${zone.name}`,
          message: zone.reason,
          icon: "🔴",
          timestamp: now,
        });
      }
    });

    if (stalkerThreat === "high") {
      alerts.push({
        id: "stalker-high",
        severity: "critical",
        title: "🚨 Suspicious Follower Detected",
        message: "Someone nearby has been following your path. Consider entering a public building or contacting police.",
        icon: "🚨",
        timestamp: now,
      });
    } else if (stalkerThreat === "medium") {
      alerts.push({
        id: "stalker-medium",
        severity: "warning",
        title: "👁️ Suspicious Movement Nearby",
        message: "Someone nearby is mirroring your movement. Stay alert and move toward a well-lit area.",
        icon: "👁️",
        timestamp: now,
      });
    }

    const hour = new Date().getHours();
    if ((hour >= 22 || hour < 5) && safetyScore < 60) {
      alerts.push({
        id: "night-risk",
        severity: "warning",
        title: "🌙 Late Night Risk",
        message: "It's late at night in an area with limited visibility. Enable Guardian Mode and avoid isolated routes.",
        icon: "🌙",
        timestamp: now,
      });
    }

    if (nearbyReportCount >= 3) {
      alerts.push({
        id: "reports-cluster",
        severity: "warning",
        title: `📍 ${nearbyReportCount} Community Reports Nearby`,
        message: "Multiple safety incidents have been reported in your current area recently.",
        icon: "📍",
        timestamp: now,
      });
    }

    if (safetyScore < 35) {
      alerts.push({
        id: "score-critical",
        severity: "critical",
        title: "⚡ High Risk Zone",
        message: "Your safety score is critically low. Activate SOS monitoring and share your live location.",
        icon: "⚡",
        timestamp: now,
      });
    }

    return alerts.slice(0, 4);
  }, [userPos, stalkerThreat, safetyScore, nearbyReportCount]);
}
