import { useState, useEffect, useRef } from "react";

export interface SimulatedPerson {
  id: string;
  pos: [number, number];
  suspicionScore: number;
  suspected: boolean;
  label: string;
}

interface PersonState {
  id: string;
  label: string;
  pos: [number, number];
  direction: [number, number];
  speed: number;
  proximityCount: number;
  suspicionScore: number;
  history: [number, number][];
}

function randomNearby(center: [number, number], radiusKm: number): [number, number] {
  const r = radiusKm / 111;
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * r;
  return [center[0] + dist * Math.cos(angle), center[1] + dist * Math.sin(angle)];
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function dotProduct(a: [number, number], b: [number, number]): number {
  const magA = Math.sqrt(a[0] ** 2 + a[1] ** 2);
  const magB = Math.sqrt(b[0] ** 2 + b[1] ** 2);
  if (magA === 0 || magB === 0) return 0;
  return (a[0] * b[0] + a[1] * b[1]) / (magA * magB);
}

const PERSON_LABELS = ["Bystander A", "Person B", "Pedestrian C", "Individual D"];

export function useStalkerDetection(
  userPos: [number, number] | null,
  enabled: boolean = true
): { persons: SimulatedPerson[]; highThreatDetected: boolean; threatLevel: "none" | "low" | "medium" | "high" } {
  const personsRef = useRef<PersonState[]>([]);
  const [output, setOutput] = useState<SimulatedPerson[]>([]);
  const [highThreatDetected, setHighThreatDetected] = useState(false);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!userPos || !enabled) {
      personsRef.current = [];
      setOutput([]);
      setHighThreatDetected(false);
      return;
    }

    if (personsRef.current.length === 0) {
      personsRef.current = PERSON_LABELS.map((label, i) => {
        const spawnRadius = 0.3 + Math.random() * 0.4;
        const startPos = randomNearby(userPos, spawnRadius);
        const angle = Math.random() * 2 * Math.PI;
        return {
          id: `person-${i}`,
          label,
          pos: startPos,
          direction: [Math.cos(angle) * 0.00008, Math.sin(angle) * 0.00008] as [number, number],
          speed: 0.00005 + Math.random() * 0.00006,
          proximityCount: 0,
          suspicionScore: 0,
          history: [startPos],
        };
      });
    }

    const interval = setInterval(() => {
      tickRef.current++;
      const tick = tickRef.current;

      personsRef.current = personsRef.current.map((p) => {
        let [dlat, dlng] = p.direction;

        if (tick % 20 === 0) {
          const angleChange = (Math.random() - 0.5) * 0.8;
          const cos = Math.cos(angleChange);
          const sin = Math.sin(angleChange);
          dlat = dlat * cos - dlng * sin;
          dlng = dlat * sin + dlng * cos;
        }

        const stalkerChance = p.suspicionScore > 40 ? 0.7 : 0.15;
        if (Math.random() < stalkerChance && userPos) {
          const toUser: [number, number] = [userPos[0] - p.pos[0], userPos[1] - p.pos[1]];
          const mag = Math.sqrt(toUser[0] ** 2 + toUser[1] ** 2) || 1;
          dlat = (dlat * 0.3 + (toUser[0] / mag) * p.speed * 0.7);
          dlng = (dlng * 0.3 + (toUser[1] / mag) * p.speed * 0.7);
        }

        const newPos: [number, number] = [p.pos[0] + dlat, p.pos[1] + dlng];
        const history = [...p.history.slice(-10), newPos];

        const distToUser = userPos ? haversineKm(newPos, userPos) : 999;
        const isClose = distToUser < 0.15;

        let proximityCount = p.proximityCount;
        if (isClose) {
          proximityCount = Math.min(proximityCount + 1, 20);
        } else {
          proximityCount = Math.max(proximityCount - 0.1, 0);
        }

        let dirSimilarity = 0;
        if (userPos && history.length >= 3) {
          const pMove: [number, number] = [history[history.length - 1][0] - history[history.length - 3][0], history[history.length - 1][1] - history[history.length - 3][1]];
          const uDir: [number, number] = [dlat, dlng];
          dirSimilarity = Math.max(0, dotProduct(pMove, uDir));
        }

        const newScore = Math.min(
          100,
          Math.max(
            0,
            p.suspicionScore * 0.92 +
              (isClose ? 12 : -3) +
              proximityCount * 2.5 +
              dirSimilarity * 15
          )
        );

        return {
          ...p,
          pos: newPos,
          direction: [dlat, dlng] as [number, number],
          proximityCount,
          suspicionScore: newScore,
          history,
        };
      });

      const maxScore = Math.max(...personsRef.current.map((p) => p.suspicionScore));
      const anyHigh = maxScore > 65;
      setHighThreatDetected(anyHigh);

      setOutput(
        personsRef.current.map((p) => ({
          id: p.id,
          label: p.label,
          pos: p.pos,
          suspicionScore: p.suspicionScore,
          suspected: p.suspicionScore > 65,
        }))
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [userPos, enabled]);

  const maxScore = Math.max(0, ...output.map((p) => p.suspicionScore));
  const threatLevel: "none" | "low" | "medium" | "high" =
    maxScore > 65 ? "high" : maxScore > 40 ? "medium" : maxScore > 20 ? "low" : "none";

  return { persons: output, highThreatDetected, threatLevel };
}
