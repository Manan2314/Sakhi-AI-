import { useState } from "react";
import MapView from "@/components/MapView";
import {
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  Activity,
  Eye,
  Users,
  Hospital,
  Flame,
  Star,
} from "lucide-react";

const safePlaces = [
  { name: "AIIMS Hospital", dist: "1.2 km", type: "Hospital", icon: Hospital, safe: true },
  { name: "CP Police Station", dist: "0.8 km", type: "Police", icon: Shield, safe: true },
  { name: "Safdarjung Hospital", dist: "2.1 km", type: "Hospital", icon: Hospital, safe: true },
  { name: "CRPF Camp", dist: "1.5 km", type: "Security", icon: Shield, safe: true },
];

export default function Dashboard() {
  const [guardianActive, setGuardianActive] = useState(true);
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleSOS = () => {
    setSosTriggered(true);
    setTimeout(() => setSosTriggered(false), 3000);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Map fills the screen */}
      <div className="flex-1 relative">
        <MapView className="absolute inset-0 w-full h-full" showMarkers={true} />

        {/* Top overlay bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
          {/* Safety Score */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-border flex items-center gap-2.5 pointer-events-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground leading-none">Safety Score</div>
              <div className="text-[17px] font-bold text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">78<span className="text-xs font-medium text-muted-foreground">/100</span></div>
            </div>
          </div>

          {/* Guardian Mode */}
          <div className={`bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border flex items-center gap-2.5 pointer-events-auto cursor-pointer transition-all
            ${guardianActive ? "border-primary/30 bg-primary/5" : "border-border"}`}
            onClick={() => setGuardianActive(!guardianActive)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${guardianActive ? "bg-primary/15" : "bg-muted"}`}>
              <Eye className={`w-4 h-4 ${guardianActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground leading-none">Guardian Mode</div>
              <div className={`text-[13px] font-semibold leading-none mt-0.5 ${guardianActive ? "text-primary" : "text-muted-foreground"}`}>
                {guardianActive ? "Active" : "Inactive"}
              </div>
            </div>
            <div className={`ml-1 w-2 h-2 rounded-full ${guardianActive ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
          </div>

          <div className="flex-1" />

          {/* Alert badge */}
          <div className="bg-amber-500/90 backdrop-blur-sm rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-1.5 pointer-events-auto">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span className="text-[12px] font-semibold text-white">2 Alerts Nearby</span>
          </div>
        </div>

        {/* Floating SOS Button */}
        <button
          onClick={handleSOS}
          className={`
            absolute bottom-6 right-6 z-20
            w-16 h-16 rounded-full flex flex-col items-center justify-center
            shadow-xl font-bold text-white transition-all duration-200
            ${sosTriggered
              ? "bg-red-700 scale-95"
              : "bg-red-600 hover:bg-red-700 active:scale-95 sos-pulse"
            }
          `}
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wide">SOS</span>
        </button>

        {sosTriggered && (
          <div className="absolute bottom-28 right-4 z-20 bg-red-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold animate-bounce">
            🚨 Emergency alert sent!
          </div>
        )}

        {/* Bottom overlay: Safe Places */}
        <div className="absolute bottom-6 left-4 z-10 max-w-[280px]">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Nearby Safe Places
              </span>
              <span className="text-[10px] text-muted-foreground">Delhi</span>
            </div>
            <div className="px-3 pb-3 space-y-1">
              {safePlaces.slice(0, 3).map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.name} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.type}</div>
                    </div>
                    <span className="text-[10px] font-medium text-primary whitespace-nowrap">{p.dist}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Left stat pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-border flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[12px] font-medium text-foreground">New Delhi, India</span>
          </div>
        </div>
      </div>
    </div>
  );
}
