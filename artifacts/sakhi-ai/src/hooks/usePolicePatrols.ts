import { useState, useEffect, useRef } from "react";
import { DELHI_SAFE_PLACES } from "@/data/delhiData";

interface PatrolUnit {
  id: string;
  pos: [number, number];
  basePos: [number, number];
  angle: number;
  speed: number;
  radius: number;
}

const PATROL_STATIONS = DELHI_SAFE_PLACES.filter((p) => p.type === "police").slice(0, 3);

export function usePolicePatrols(): { id: string; pos: [number, number] }[] {
  const unitsRef = useRef<PatrolUnit[]>(
    PATROL_STATIONS.map((station, i) => ({
      id: `patrol-${i}`,
      pos: station.pos,
      basePos: station.pos,
      angle: (i * 2 * Math.PI) / PATROL_STATIONS.length,
      speed: 0.015 + Math.random() * 0.01,
      radius: 0.003 + Math.random() * 0.002,
    }))
  );

  const [patrols, setPatrols] = useState(() =>
    unitsRef.current.map((u) => ({ id: u.id, pos: u.pos }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      unitsRef.current = unitsRef.current.map((unit) => {
        const newAngle = unit.angle + unit.speed * 0.12;
        const newPos: [number, number] = [
          unit.basePos[0] + Math.cos(newAngle) * unit.radius,
          unit.basePos[1] + Math.sin(newAngle) * unit.radius * 0.7,
        ];
        return { ...unit, angle: newAngle, pos: newPos };
      });
      setPatrols(unitsRef.current.map((u) => ({ id: u.id, pos: u.pos })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return patrols;
}
