import { useEffect, useRef } from "react";
import L from "leaflet";
import { DELHI_SAFE_PLACES, DELHI_DANGER_ZONES } from "@/data/delhiData";

export interface ReportMarker {
  id: number;
  pos: [number, number];
  category: string;
  title: string;
  color: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  showSafePlaces?: boolean;
  showDangerZones?: boolean;
  userLocation?: [number, number] | null;
  route?: [number, number][] | null;
  reportMarkers?: ReportMarker[];
  onMapClick?: (latlng: [number, number]) => void;
  fitToRoute?: boolean;
}

const DELHI_CENTER: [number, number] = [28.6139, 77.2090];

const PLACE_COLORS: Record<string, string> = {
  hospital: "#ef4444",
  police: "#3b82f6",
  metro: "#8b5cf6",
  landmark: "#f59e0b",
  pharmacy: "#22c55e",
};

function makePinIcon(color: string, size = 28) {
  const s = size;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${Math.round(s*1.28)}" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.92"/>
    <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.95"/>
  </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [s, Math.round(s * 1.28)], iconAnchor: [s / 2, Math.round(s * 1.28)], popupAnchor: [0, -Math.round(s * 1.28)] });
}

function makeUserIcon() {
  const html = `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:user-pulse 2s ease-in-out infinite;"></div>
      <div style="position:absolute;inset:3px;border-radius:50%;background:#3b82f6;border:2.5px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [20, 20], iconAnchor: [10, 10] });
}

function makeDestIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="41" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.268 21.732 0 14 0z" fill="#ec4899" opacity="0.95"/>
    <circle cx="14" cy="14" r="5.5" fill="white" opacity="0.95"/>
  </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [32, 41], iconAnchor: [16, 41], popupAnchor: [0, -41] });
}

export default function MapView({
  center = DELHI_CENTER,
  zoom = 13,
  className = "",
  showSafePlaces = false,
  showDangerZones = false,
  userLocation = null,
  route = null,
  reportMarkers = [],
  onMapClick,
  fitToRoute = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const reportLayerRef = useRef<L.LayerGroup | null>(null);

  // Init map once
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
    L.control.attribution({ position: "bottomleft", prefix: "© OpenStreetMap" }).addTo(map);

    // Safe places
    if (showSafePlaces) {
      DELHI_SAFE_PLACES.forEach((loc) => {
        const color = PLACE_COLORS[loc.type] ?? "#6b7280";
        const label = loc.type.charAt(0).toUpperCase() + loc.type.slice(1);
        const phone = loc.phone ? `<br/><small>📞 ${loc.phone}</small>` : "";
        L.marker(loc.pos, { icon: makePinIcon(color) })
          .addTo(map)
          .bindPopup(`<strong>${loc.name}</strong><br/><span style="color:${color}">${label}</span><br/><small>${loc.address}</small>${phone}`);
      });
    }

    // Danger zones
    if (showDangerZones) {
      DELHI_DANGER_ZONES.forEach((zone) => {
        L.circle(zone.pos, {
          radius: zone.radius,
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "6,4",
        }).addTo(map).bindPopup(`<strong style="color:#ef4444">⚠️ ${zone.name}</strong><br/><small>${zone.reason}</small>`);
      });
    }

    // Click handler for reports
    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      });
    }

    reportLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      userCircleRef.current = null;
      routeLayerRef.current = null;
      destMarkerRef.current = null;
      reportLayerRef.current = null;
    };
  }, []);

  // Update user location
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLocation, { icon: makeUserIcon(), zIndexOffset: 1000 }).addTo(map).bindPopup("<strong>📍 Your Location</strong><br/><small>Live GPS position</small>");
        userCircleRef.current = L.circle(userLocation, { radius: 80, color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08, weight: 1 }).addTo(map);
        map.setView(userLocation, map.getZoom());
      } else {
        userMarkerRef.current.setLatLng(userLocation);
        userCircleRef.current?.setLatLng(userLocation);
      }
    } else {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      userCircleRef.current?.remove();
      userCircleRef.current = null;
    }
  }, [userLocation]);

  // Update route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeLayerRef.current?.remove();
    destMarkerRef.current?.remove();
    routeLayerRef.current = null;
    destMarkerRef.current = null;

    if (route && route.length >= 2) {
      routeLayerRef.current = L.polyline(route, {
        color: "#ec4899",
        weight: 4,
        opacity: 0.85,
        dashArray: "10,6",
        lineCap: "round",
      }).addTo(map);

      const dest = route[route.length - 1];
      destMarkerRef.current = L.marker(dest, { icon: makeDestIcon(), zIndexOffset: 900 }).addTo(map).bindPopup("<strong>🏁 Destination</strong>");

      if (fitToRoute) {
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
      }
    }
  }, [route]);

  // Update report markers
  useEffect(() => {
    const layer = reportLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    reportMarkers.forEach((rm) => {
      L.marker(rm.pos, { icon: makePinIcon(rm.color, 22) })
        .addTo(layer)
        .bindPopup(`<strong>${rm.title}</strong><br/><span style="color:${rm.color}">${rm.category}</span>`);
    });
  }, [reportMarkers]);

  return <div ref={containerRef} className={`leaflet-container ${className}`} />;
}
