import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onMapReady?: (map: L.Map) => void;
  className?: string;
  showMarkers?: boolean;
}

const DELHI_CENTER: [number, number] = [28.6139, 77.2090];

const safeLocations = [
  { name: "AIIMS Hospital", pos: [28.5676, 77.2100] as [number, number], type: "hospital" },
  { name: "Connaught Place Police Station", pos: [28.6329, 77.2195] as [number, number], type: "police" },
  { name: "India Gate", pos: [28.6129, 77.2295] as [number, number], type: "landmark" },
  { name: "New Delhi Railway Station", pos: [28.6426, 77.2196] as [number, number], type: "transport" },
  { name: "Safdarjung Hospital", pos: [28.5688, 77.2040] as [number, number], type: "hospital" },
  { name: "Lajpat Nagar Police Station", pos: [28.5672, 77.2432] as [number, number], type: "police" },
];

const iconColors: Record<string, string> = {
  hospital: "#ef4444",
  police: "#3b82f6",
  landmark: "#f59e0b",
  transport: "#8b5cf6",
};

function createCustomIcon(type: string) {
  const color = iconColors[type] ?? "#6b7280";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.9"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export default function MapView({ center = DELHI_CENTER, zoom = 13, onMapReady, className = "", showMarkers = true }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: "© OpenStreetMap" }).addTo(map);

    if (showMarkers) {
      safeLocations.forEach((loc) => {
        L.marker(loc.pos, { icon: createCustomIcon(loc.type) })
          .addTo(map)
          .bindPopup(`<strong>${loc.name}</strong><br/><span style="color:${iconColors[loc.type]}">${loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}</span>`);
      });
    }

    mapRef.current = map;
    onMapReady?.(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={`leaflet-container ${className}`} />;
}
