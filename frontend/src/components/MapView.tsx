import { useEffect, useRef } from "react";
import L from "leaflet";
import { Shield, Hospital, MapPin, Bus, Star } from "lucide-react";

export interface ReportMarker {
  id: number;
  pos: [number, number];
  category: string;
  title: string;
  color: string;
}

export interface RoutePoint {
  pos: [number, number];
  score: number;
  risk_level: string;
}

export interface SafePlaceMarker {
  id: string;
  pos: [number, number];
  label: string;
  type: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  userLocation?: [number, number] | null;
  routePoints?: RoutePoint[] | null;
  reportMarkers?: ReportMarker[];
  safePlaceMarkers?: SafePlaceMarker[];
  onMapClick?: (latlng: [number, number]) => void;
  fitToRoute?: boolean;
}

const DELHI_CENTER: [number, number] = [28.6139, 77.2090];

const PLACE_ICONS: Record<string, { color: string; glyph: string }> = {
  police: { color: "#3b82f6", glyph: "👮" }, // blue
  hospital: { color: "#22c55e", glyph: "🏥" }, // green
  metro: { color: "#8b5cf6", glyph: "🚇" }, // purple
  landmark: { color: "#f59e0b", glyph: "⭐" },
  default: { color: "#6b7280", glyph: "📍" }
};

function makePinIcon(color: string, size = 28) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size*1.3)}" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.95"/>
    <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.95"/>
  </svg>`;
  return L.divIcon({ 
    html: svg, 
    className: "", 
    iconSize: [size, Math.round(size * 1.3)], 
    iconAnchor: [size / 2, Math.round(size * 1.3)],
    popupAnchor: [0, -Math.round(size * 1.3)]
  });
}

function makeSafePlaceIcon(type: string) {
  const cfg = PLACE_ICONS[type] || PLACE_ICONS.default;
  const html = `
    <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:100%; height:100%; background:${cfg.color}; border-radius:50%; opacity:0.2; transform: scale(1.2);"></div>
      <div style="width:24px; height:24px; background:${cfg.color}; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
        ${cfg.glyph}
      </div>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
}

function makeUserIcon() {
  const html = `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.3);animation:user-pulse 2s ease-in-out infinite;"></div>
      <div style="position:absolute;inset:3px;border-radius:50%;background:#3b82f6;border:2.5px solid white;"></div>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [20, 20], iconAnchor: [10, 10] });
}

export default function MapView({
  center = DELHI_CENTER,
  zoom = 13,
  className = "",
  userLocation = null,
  routePoints = null,
  reportMarkers = [],
  safePlaceMarkers = [],
  onMapClick,
  fitToRoute = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const safePlacesLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      });
    }

    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    safePlacesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync user location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userLocation, { icon: makeUserIcon(), zIndexOffset: 1000 }).addTo(map);
      map.setView(userLocation, map.getZoom());
    } else {
      userMarkerRef.current.setLatLng(userLocation);
    }
  }, [userLocation]);

  // Sync report markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    reportMarkers.forEach((rm) => {
      L.marker(rm.pos, { icon: makePinIcon(rm.color, 24) })
        .addTo(layer)
        .bindPopup(`<strong>${rm.title}</strong><br/><small>${rm.category}</small>`);
    });
  }, [reportMarkers]);

  // Sync safe place markers
  useEffect(() => {
    const layer = safePlacesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    safePlaceMarkers.forEach((sp) => {
      L.marker(sp.pos, { icon: makeSafePlaceIcon(sp.type) })
        .addTo(layer)
        .bindPopup(`<strong>${sp.label}</strong><br/><small>Safest Spot: ${sp.type.toUpperCase()}</small>`);
    });
  }, [safePlaceMarkers]);

  // Sync route with risk segments
  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    if (routePoints && routePoints.length >= 2) {
      routePoints.forEach((p, i) => {
        if (i === 0) return;
        const prev = routePoints[i - 1];
        
        // Color based on the target point's score
        // Score: 80+ Safe (green), 50+ Moderate (yellow/orange), <50 Unsafe (red)
        const color = p.score >= 80 ? "#22c55e" : p.score >= 50 ? "#f59e0b" : "#ef4444";
        
        L.polyline([prev.pos, p.pos], { 
          color, 
          weight: 6, 
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(layer);
      });

      // Add Start/End icons
      const start = routePoints[0].pos;
      const end = routePoints[routePoints.length - 1].pos;
      
      L.circleMarker(start, { radius: 6, color: "#22c55e", fillOpacity: 1 }).addTo(layer);
      L.marker(end, { icon: makePinIcon("#ec4899", 32) }).addTo(layer).bindPopup("Destination");

      if (fitToRoute) {
        const bounds = L.latLngBounds(routePoints.map(p => p.pos));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routePoints, fitToRoute]);

  return <div ref={containerRef} className={`leaflet-container ${className}`} />;
}
