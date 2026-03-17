import { useState } from "react";
import MapView from "@/components/MapView";
import { Layers, Filter, AlertTriangle, Shield, Flame, Car, Moon } from "lucide-react";

const layers = [
  { id: "safe-zones", label: "Safe Zones", color: "#22c55e", icon: Shield },
  { id: "crime", label: "Crime Incidents", color: "#ef4444", icon: AlertTriangle },
  { id: "lighting", label: "Poor Lighting", color: "#f59e0b", icon: Moon },
  { id: "harassment", label: "Harassment Reports", color: "#f97316", icon: Flame },
  { id: "transport", label: "Safe Transport", color: "#3b82f6", icon: Car },
];

export default function SafetyMap() {
  const [activeLayers, setActiveLayers] = useState(["safe-zones", "crime"]);

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-full h-full">
      <MapView className="absolute inset-0 w-full h-full" zoom={12} showMarkers={true} />

      {/* Header */}
      <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md border border-border">
        <div className="flex items-center gap-2 mb-0.5">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-[14px] font-semibold text-foreground">Safety Map</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">Toggle layers to see safety data</p>
      </div>

      {/* Layer controls */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-md border border-border space-y-1.5 min-w-[180px]">
          <div className="flex items-center gap-1.5 pb-1 border-b border-border mb-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Layers</span>
          </div>
          {layers.map((layer) => {
            const Icon = layer.icon;
            const active = activeLayers.includes(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-sm
                  ${active ? "bg-muted/80" : "opacity-50 hover:opacity-80"}`}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: layer.color + "20" }}>
                  <Icon className="w-3 h-3" style={{ color: layer.color }} />
                </div>
                <span className="text-[12px] font-medium text-foreground text-left flex-1">{layer.label}</span>
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
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Safety Level</div>
          <div className="flex items-center gap-4">
            {[["#22c55e", "Safe"], ["#f59e0b", "Moderate"], ["#ef4444", "Unsafe"]].map(([color, label]) => (
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
