import { useState, useEffect, useCallback } from "react";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSafetyScore } from "@/hooks/useSafetyScore";
import { useSafePlaces } from "@/hooks/useSafePlaces";
import { useGuardian } from "@/hooks/useGuardian";
import { apiFetch, endpoints } from "@/lib/api";
import {
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  Activity,
  Eye,
  Hospital,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SEVERITY_STYLES = {
  info: "bg-blue-500/10 border-blue-400/30 text-blue-700 dark:text-blue-300",
  warning: "bg-amber-500/10 border-amber-400/30 text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/10 border-red-400/30 text-red-700 dark:text-red-300",
  critical: "bg-red-600/15 border-red-500/40 text-red-800 dark:text-red-200",
};

const SCORE_COLORS: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

export default function Dashboard() {
  const geo = useGeolocation(true);
  const { isActive: guardianActive, startGuardian, stopGuardian, status: guardianStatus } = useGuardian(geo.position);
  const safetyBreakdown = useSafetyScore(geo.position);
  const { places: safePlaces, loading: placesLoading } = useSafePlaces(geo.position);
  
  const [sosState, setSosState] = useState<"idle" | "confirming" | "sending" | "sent">("idle");
  const [sosCountdown, setSosCountdown] = useState(3);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [reportMarkers, setReportMarkers] = useState<any[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      const data = await apiFetch(endpoints.getReports());
      const CAT_COLORS: Record<string, string> = {
        harassment: "#ef4444",
        unsafe_area: "#f97316",
        poor_lighting: "#f59e0b",
      };
      const markers = data.map((r: any) => ({
        id: r.id,
        pos: [r.latitude, r.longitude],
        category: r.type,
        title: r.type.replace("_", " ").toUpperCase(),
        color: CAT_COLORS[r.type] || "#6b7280",
      }));
      setReportMarkers(markers);
    } catch (err) {
      console.error("Dashboard failed to fetch reports:", err);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSOS = () => { if (sosState !== "idle") return; setSosState("confirming"); };
  
  const confirmSOS = async () => {
    if (!geo.position) return;
    setSosState("sending");
    try {
      await apiFetch(endpoints.triggerUnsafe, {
        method: "POST",
        body: JSON.stringify({ lat: geo.position[0], lng: geo.position[1] })
      });
      
      let count = 3; setSosCountdown(count);
      const timer = setInterval(() => {
        count--; setSosCountdown(count);
        if (count <= 0) { 
          clearInterval(timer); 
          setSosState("sent"); 
          setTimeout(() => setSosState("idle"), 5000); 
        }
      }, 1000);
    } catch (err) {
      setSosState("idle");
      alert("Failed to send SOS. Please call emergency services directly.");
    }
  };

  const cancelSOS = () => setSosState("idle");

  const locationText = geo.position
    ? `${geo.position[0].toFixed(4)}°N, ${geo.position[1].toFixed(4)}°E`
    : "Locating...";

  const scoreColorClass = SCORE_COLORS[safetyBreakdown.color];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        <MapView
          className="absolute inset-0 w-full h-full"
          showSafePlaces={true}
          showDangerZones={true}
          userLocation={geo.position}
          zoom={13}
          reportMarkers={reportMarkers}
          safePlaceMarkers={safePlaces.map(p => ({
            id: p.id.toString(),
            pos: [p.latitude, p.longitude],
            label: p.name,
            type: p.type
          }))}
        />

        {/* Top overlay bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-border flex items-center gap-2.5 pointer-events-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${safetyBreakdown.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/40" : safetyBreakdown.color === "yellow" ? "bg-yellow-100 dark:bg-yellow-900/40" : safetyBreakdown.color === "orange" ? "bg-orange-100 dark:bg-orange-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
              <Activity className={`w-4 h-4 ${scoreColorClass}`} />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground leading-none">Live Safety Score</div>
              <div className={`text-[17px] font-bold leading-none mt-0.5 ${scoreColorClass}`}>
                {safetyBreakdown.score}<span className="text-xs font-medium text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          <div
            className={`bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border flex items-center gap-2.5 pointer-events-auto cursor-pointer transition-all
              ${guardianActive ? "border-primary/30 bg-primary/5" : "border-border"}`}
            onClick={() => guardianActive ? stopGuardian() : startGuardian()}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${guardianActive ? "bg-primary/15" : "bg-muted"}`}>
              <Shield className={`w-4 h-4 ${guardianActive ? "text-primary" : "text-muted-foreground"}`} />
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

          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`backdrop-blur-sm rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-1.5 pointer-events-auto transition-all bg-card/95 text-foreground border border-border`}
          >
            <Bell className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-semibold">Alerts</span>
            {showAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Risk Notification from Guardian behavior analysis */}
        {guardianStatus?.is_alert_triggered && (
          <div className="absolute top-20 left-4 z-20 max-w-[260px] bg-red-600/95 backdrop-blur-sm text-white rounded-2xl px-4 py-3 shadow-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-bold">Safety Alarm</div>
              <div className="text-[11px] opacity-90 mt-0.5">{guardianStatus.behavior_analysis.reason}</div>
            </div>
          </div>
        )}

        {/* Nearby Safe Places (expandable, bottom-left) */}
        <div className="absolute bottom-6 left-4 z-10 max-w-[280px]">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-primary" />
                Nearby Safe Places
              </span>
              <span className="text-[10px] text-muted-foreground">Radius 2km</span>
            </div>
            <div className="px-3 pb-3 space-y-1 max-h-[220px] overflow-y-auto">
              {placesLoading ? (
                <div className="py-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
              ) : safePlaces.length > 0 ? (
                safePlaces.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {p.type === 'police' ? <Shield className="w-3 h-3 text-primary" /> : <Hospital className="w-3 h-3 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{p.type}</div>
                    </div>
                    <span className="text-[10px] font-medium text-primary whitespace-nowrap">{p.distance} km</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-muted-foreground py-3 text-center">No safe zones identified nearby.</div>
              )}
            </div>
          </div>
        </div>

        {/* SOS Button */}
        <button
          onClick={handleSOS}
          className={`absolute bottom-6 right-6 z-20 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-xl font-bold text-white transition-all duration-200
            ${sosState === "sending" || sosState === "sent" ? "bg-red-700 scale-95" : "bg-red-600 hover:bg-red-700 active:scale-95 sos-pulse"}`}
        >
          {sosState === "sending" ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Phone className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-wide">SOS</span>
            </>
          )}
        </button>

        {/* SOS Confirm Dialog */}
        {sosState === "confirming" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-6 max-w-[320px] w-full">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-[17px] font-bold text-foreground mb-1">Confirm SOS Alert?</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Your location will be broadcast to emergency services and guardians.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={cancelSOS} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-[13px] font-semibold hover:bg-muted/80 transition-all">Cancel</button>
                <button onClick={confirmSOS} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-[13px] font-bold hover:bg-red-700 active:scale-95 transition-all">Send</button>
              </div>
            </div>
          </div>
        )}

        {sosState === "sending" && (
          <div className="absolute bottom-28 right-4 z-20 bg-red-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Notifying emergency network...
          </div>
        )}
        {sosState === "sent" && (
          <div className="absolute bottom-28 right-4 z-20 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold flex items-center gap-2">
            ✅ Alert sent! Stay calm, help is coming.
          </div>
        )}

        {/* Location pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-border flex items-center gap-1.5">
            {geo.loading ? (
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span className="text-[12px] font-medium text-foreground">
              {geo.loading ? "Getting location..." : "Tracking Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
