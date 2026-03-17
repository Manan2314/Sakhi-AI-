import { useState, useEffect } from "react";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useStalkerDetection } from "@/hooks/useStalkerDetection";
import { useSafetyScore } from "@/hooks/useSafetyScore";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
import { usePolicePatrols } from "@/hooks/usePolicePatrols";
import { useAIInsight } from "@/hooks/useAIInsight";
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

const EMERGENCY_CONTACTS = [
  { name: "Mom", number: "+91 98765 43210" },
  { name: "Priya (Friend)", number: "+91 87654 32109" },
  { name: "Women Helpline", number: "1091" },
];

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
  const [guardianActive, setGuardianActive] = useState(true);
  const [sosState, setSosState] = useState<"idle" | "confirming" | "sending" | "sent">("idle");
  const [sosCountdown, setSosCountdown] = useState(3);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [stalkerEnabled, setStalkerEnabled] = useState(true);

  const patrols = usePolicePatrols();
  const { persons: stalkerPersons, threatLevel } = useStalkerDetection(geo.position, stalkerEnabled);
  const safetyBreakdown = useSafetyScore(geo.position, guardianActive, threatLevel, 0);
  const smartAlerts = useSmartAlerts(geo.position, threatLevel, safetyBreakdown.score);
  const { insight, loading: aiLoading, refresh: refreshInsight } = useAIInsight(geo.position, safetyBreakdown.score);

  const alertCount = smartAlerts.length;
  const hasCritical = smartAlerts.some((a) => a.severity === "critical");

  const handleSOS = () => { if (sosState !== "idle") return; setSosState("confirming"); };
  const confirmSOS = () => {
    setSosState("sending");
    let count = 3; setSosCountdown(count);
    const timer = setInterval(() => {
      count--; setSosCountdown(count);
      if (count <= 0) { clearInterval(timer); setSosState("sent"); setTimeout(() => setSosState("idle"), 5000); }
    }, 1000);
  };
  const cancelSOS = () => setSosState("idle");

  const locationText = geo.position
    ? geo.permissionDenied ? "New Delhi (Default)" : `${geo.position[0].toFixed(4)}°N, ${geo.position[1].toFixed(4)}°E`
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
          stalkerPersons={stalkerPersons}
          policePatrols={patrols}
        />

        {/* Top overlay bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
          {/* Safety Score — now dynamic */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-border flex items-center gap-2.5 pointer-events-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${safetyBreakdown.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/40" : safetyBreakdown.color === "yellow" ? "bg-yellow-100 dark:bg-yellow-900/40" : safetyBreakdown.color === "orange" ? "bg-orange-100 dark:bg-orange-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
              <Activity className={`w-4 h-4 ${scoreColorClass}`} />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground leading-none">Safety Score</div>
              <div className={`text-[17px] font-bold leading-none mt-0.5 ${scoreColorClass}`}>
                {safetyBreakdown.score}<span className="text-xs font-medium text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          {/* Guardian Mode */}
          <div
            className={`bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border flex items-center gap-2.5 pointer-events-auto cursor-pointer transition-all
              ${guardianActive ? "border-primary/30 bg-primary/5" : "border-border"}`}
            onClick={() => setGuardianActive(!guardianActive)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${guardianActive ? "bg-primary/15" : "bg-muted"}`}>
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

          {/* Smart Alerts badge — dynamic */}
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`backdrop-blur-sm rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-1.5 pointer-events-auto transition-all
              ${hasCritical ? "bg-red-600/90 text-white" : alertCount > 0 ? "bg-amber-500/90 text-white" : "bg-emerald-500/90 text-white"}`}
          >
            {hasCritical ? <AlertTriangle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            <span className="text-[12px] font-semibold">
              {alertCount > 0 ? `${alertCount} Alert${alertCount > 1 ? "s" : ""}` : "All Clear"}
            </span>
            {showAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Smart Alerts Panel */}
        {showAlerts && alertCount > 0 && (
          <div className="absolute top-20 right-4 z-20 w-[280px] bg-card/97 backdrop-blur-md rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-[13px] font-bold text-foreground">Smart Alerts</span>
              <button onClick={() => setShowAlerts(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-2 max-h-[240px] overflow-y-auto">
              {smartAlerts.map((alert) => (
                <div key={alert.id} className={`rounded-xl p-3 border text-[11px] ${SEVERITY_STYLES[alert.severity]}`}>
                  <div className="font-semibold text-[12px] mb-0.5">{alert.title}</div>
                  <div className="opacity-90 leading-relaxed">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Stalker Detection Notice */}
        {threatLevel === "high" && (
          <div className="absolute top-20 left-4 z-20 max-w-[260px] bg-red-600/95 backdrop-blur-sm text-white rounded-2xl px-4 py-3 shadow-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-bold">Suspicious Follower Detected</div>
              <div className="text-[11px] opacity-90 mt-0.5">AI pattern matching detected repeated proximity. Move to a public area.</div>
              <button onClick={() => setStalkerEnabled(false)} className="text-[10px] underline opacity-75 mt-1">Dismiss</button>
            </div>
          </div>
        )}
        {threatLevel === "medium" && (
          <div className="absolute top-20 left-4 z-20 max-w-[260px] bg-amber-500/95 backdrop-blur-sm text-white rounded-2xl px-4 py-3 shadow-xl flex items-start gap-3">
            <Eye className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-bold">Suspicious Movement Nearby</div>
              <div className="text-[11px] opacity-90 mt-0.5">Someone is mirroring your movement. Stay alert.</div>
            </div>
          </div>
        )}

        {/* AI Insight Panel (expandable, bottom-left) */}
        <div className="absolute bottom-6 left-4 z-10 max-w-[280px]">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              className="w-full px-4 pt-3 pb-2 flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => { setShowAI(!showAI); if (!showAI && !insight) refreshInsight(); }}
              onKeyDown={(e) => e.key === "Enter" && setShowAI(!showAI)}
            >
              <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Safety Advisor
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); refreshInsight(); }}
                  onKeyDown={(e) => e.key === "Enter" && refreshInsight()}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Refresh AI insight"
                >
                  <RefreshCw className={`w-3 h-3 ${aiLoading ? "animate-spin" : ""}`} />
                </span>
                {showAI ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
              </div>
            </div>

            {showAI && (
              <div className="px-4 pb-3 space-y-2.5">
                {aiLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span className="text-[11px] text-muted-foreground">Gemini is analyzing your area...</span>
                  </div>
                ) : insight ? (
                  <>
                    <p className="text-[11px] text-foreground leading-relaxed border-l-2 border-primary/40 pl-2">{insight.insight}</p>
                    <div className="space-y-1">
                      {insight.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-muted-foreground py-2 text-center">
                    <button onClick={refreshInsight} className="text-primary font-medium">Get AI Safety Insights →</button>
                  </div>
                )}
              </div>
            )}

            {/* Nearby Safe Places (always shown) */}
            <div className="border-t border-border/50">
              <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary" />
                  Nearby Safe Places
                </span>
                <span className="text-[10px] text-muted-foreground">Delhi</span>
              </div>
              <div className="px-3 pb-3 space-y-1">
                {[
                  { name: "AIIMS Hospital", dist: "1.2 km", type: "Hospital", icon: Hospital },
                  { name: "CP Police Station", dist: "0.8 km", type: "Police", icon: Shield },
                  { name: "Safdarjung Hospital", dist: "2.1 km", type: "Hospital", icon: Hospital },
                ].map((p) => {
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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-6 mx-6 max-w-[320px] w-full">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-[17px] font-bold text-foreground mb-1">Send SOS Alert?</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Your current location will be shared with your emergency contacts immediately.
                </p>
              </div>
              <div className="bg-muted/50 rounded-2xl p-3 mb-4 text-[11px] space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium truncate">{locationText}</span>
                </div>
                <div className="text-muted-foreground pl-5">Notifying: {EMERGENCY_CONTACTS.map(c => c.name).join(", ")}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={cancelSOS} className="flex-1 bg-muted text-foreground rounded-xl py-2.5 text-[13px] font-semibold hover:bg-muted/80 transition-all">Cancel</button>
                <button onClick={confirmSOS} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-[13px] font-bold hover:bg-red-700 active:scale-95 transition-all">Send SOS</button>
              </div>
            </div>
          </div>
        )}

        {sosState === "sending" && (
          <div className="absolute bottom-28 right-4 z-20 bg-red-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Alerting contacts... ({sosCountdown}s)
          </div>
        )}
        {sosState === "sent" && (
          <div className="absolute bottom-28 right-4 z-20 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold flex items-center gap-2">
            ✅ SOS sent! Help is on the way.
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
              {geo.loading ? "Getting location..." : geo.permissionDenied ? "New Delhi, India" : "Live Location Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
