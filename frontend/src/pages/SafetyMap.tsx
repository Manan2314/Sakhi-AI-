import { useState, useEffect, useCallback } from "react";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { apiFetch, endpoints } from "@/lib/api";
import { Layers, Filter, AlertTriangle, Shield, Flame, Car, Moon, Sparkles, RefreshCcw } from "lucide-react";

const layerDefinitions = [
  { id: "safe-zones", label: "Safe Locations", color: "#3b82f6", icon: Shield, type: "safe_place" },
  { id: "harassment", label: "Harassment", color: "#ef4444", icon: Flame, type: "report" },
  { id: "unsafe_area", label: "Unsafe Areas", color: "#f97316", icon: AlertTriangle, type: "report" },
  { id: "poor_lighting", label: "Poor Lighting", color: "#f59e0b", icon: Moon, type: "report" },
];

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090];

export default function SafetyMap() {
  const geo = useGeolocation(true);
  const [activeLayers, setActiveLayers] = useState(["safe-zones", "harassment", "unsafe_area", "poor_lighting"]);
  const [reportMarkers, setReportMarkers] = useState<any[]>([]);
  const [safePlaceMarkers, setSafePlaceMarkers] = useState<any[]>([]);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  const fetchBriefing = useCallback(async () => {
    setLoadingBriefing(true);
    const pos = geo.position || DEFAULT_CENTER;
    try {
      const data = await apiFetch(endpoints.getAreaInsights(pos[0], pos[1]));
      setAiBriefing(data.briefing);
    } catch (err) {
      console.error("Failed to fetch area insights", err);
    } finally {
      setLoadingBriefing(false);
    }
  }, [geo.position]);

  const fetchMarkers = useCallback(async () => {
    try {
      // 1. Fetch Reports (filtered by active layers)
      const reportTypes = activeLayers.filter(l => l !== "safe-zones");
      let allReports: any[] = [];
      
      if (reportTypes.length > 0) {
        // Fetch each active report type
        const results = await Promise.all(
          reportTypes.map(type => apiFetch(endpoints.getReports(type)))
        );
        allReports = results.flat();
      }

      const CAT_COLORS: Record<string, string> = {
        harassment: "#ef4444",
        unsafe_area: "#f97316",
        poor_lighting: "#f59e0b",
      };

      setReportMarkers(allReports.map((r: any) => ({
        id: r.id,
        pos: [r.latitude, r.longitude],
        category: r.type,
        title: r.type.replace("_", " ").toUpperCase(),
        color: CAT_COLORS[r.type] || "#6b7280",
      })));

      // 2. Fetch Safe Places if active
      if (activeLayers.includes("safe-zones")) {
        const pos = geo.position || DEFAULT_CENTER;
        const data = await apiFetch(endpoints.getSafePlaces(pos[0], pos[1]));
        setSafePlaceMarkers(data.map((p: any) => ({
          id: p.id.toString(),
          pos: [p.latitude, p.longitude],
          label: p.name,
          type: p.type
        })));
      } else {
        setSafePlaceMarkers([]);
      }

    } catch (err) {
      console.error("SafetyMap failed to fetch live data:", err);
    }
  }, [activeLayers, geo.position]);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  useEffect(() => {
    fetchBriefing();
  }, [fetchBriefing]);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-full h-full">
      <MapView 
        className="absolute inset-0 w-full h-full" 
        zoom={12} 
        center={geo.position || DEFAULT_CENTER}
        userLocation={geo.position}
        reportMarkers={reportMarkers}
        safePlaceMarkers={safePlaceMarkers}
      />

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md border border-border">
          <div className="flex items-center gap-2 mb-0.5">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-[14px] font-semibold text-foreground">Safety Intelligence Map</h2>
          </div>
          <p className="text-[11px] text-muted-foreground">Live community & government data</p>
        </div>

        {/* AI Briefing Panel */}
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-md border border-border w-[280px]">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">AI Area Insights</span>
            </div>
            <button onClick={fetchBriefing} disabled={loadingBriefing} className="p-1 hover:bg-muted rounded-full transition-colors">
              <RefreshCcw className={`w-3 h-3 text-muted-foreground ${loadingBriefing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="text-[12px] text-muted-foreground leading-snug min-h-[40px] flex items-center">
            {loadingBriefing ? (
              <span className="animate-pulse">Analyzing local safety patterns...</span>
            ) : aiBriefing ? (
              <span className="text-foreground/90">{aiBriefing}</span>
            ) : (
              <span>Insights unavailable.</span>
            )}
          </div>
        </div>
      </div>

      {/* Layer controls */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-md border border-border space-y-1.5 min-w-[190px]">
          <div className="flex items-center gap-1.5 pb-1 border-b border-border mb-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Filters</span>
          </div>
          {layerDefinitions.map((layer) => {
            const Icon = layer.icon;
            const active = activeLayers.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-sm
                  ${active ? "bg-muted/80 font-semibold" : "opacity-50 hover:opacity-80"}`}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: layer.color + "20" }}>
                  <Icon className="w-3 h-3" style={{ color: layer.color }} />
                </div>
                <span className="text-[12px] text-foreground text-left flex-1 truncate">{layer.label}</span>
                <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex-shrink-0
                  ${active ? "border-primary bg-primary" : "border-muted-foreground/30"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-10">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md border border-border">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confidence Level</div>
          <div className="flex items-center gap-4">
            {[["#22c55e", "Verified"], ["#f59e0b", "Recent"], ["#ef4444", "High Alert"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
