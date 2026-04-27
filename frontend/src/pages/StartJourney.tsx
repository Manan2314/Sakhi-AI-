import { useState, useMemo } from "react";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRouteAnalysis } from "@/hooks/useRouteAnalysis";
import { MapPin, Navigation2, Shield, X, Locate, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

// Minimal static destinations for search simulation (backend alignment)
const DESTINATIONS = [
  { name: "Lajpat Nagar Market", address: "Lajpat Nagar, New Delhi", pos: [28.5720, 77.2432] as [number, number] },
  { name: "Saket Metro Station", address: "Saket, South Delhi", pos: [28.5224, 77.2188] as [number, number] },
  { name: "Connaught Place", address: "CP, New Delhi", pos: [28.6289, 77.2065] as [number, number] },
  { name: "India Gate", address: "Rajpath, New Delhi", pos: [28.6129, 77.2295] as [number, number] },
  { name: "AIIMS Hospital", address: "Ansari Nagar, New Delhi", pos: [28.5676, 77.2100] as [number, number] },
  { name: "Rajiv Chowk Metro", address: "Central Delhi", pos: [28.6331, 77.2194] as [number, number] },
];

export default function StartJourney() {
  const geo = useGeolocation(true);
  const { analysis, loading: routeLoading, analyzeRoute, clear: clearRoute } = useRouteAnalysis();
  
  const [query, setQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState<typeof DESTINATIONS[0] | null>(null);
  const [navStarted, setNavStarted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const origin = geo.position ?? [28.6139, 77.2090];

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return DESTINATIONS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.address.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  const handleSelectDest = async (dest: typeof DESTINATIONS[0]) => {
    setSelectedDest(dest);
    setQuery(dest.name);
    setShowSuggestions(false);
    setNavStarted(false);
    
    // Call backend for safe-route analysis
    await analyzeRoute(origin, dest.pos);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedDest(null);
    setNavStarted(false);
    setShowSuggestions(false);
    clearRoute();
  };

  return (
    <div className="relative w-full h-full">
      <MapView
        className="absolute inset-0 w-full h-full"
        zoom={13}
        userLocation={geo.position}
        routePoints={analysis?.points}
        fitToRoute={!!analysis && navStarted}
      />

      {/* Input Panel */}
      <div className="absolute top-4 left-4 z-10 w-[320px]">
        <div className="bg-card/97 backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Navigation2 className="w-4 h-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Intelligent Routing</h2>
            </div>

            {/* From */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                {geo.loading ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                ) : (
                  <Locate className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 bg-muted/60 rounded-xl px-3 py-2 text-[13px] font-medium text-foreground border border-transparent truncate">
                {geo.loading ? "Locating..." : "Your Location"}
              </div>
            </div>

            {/* To */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setSelectedDest(null); }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-muted/60 rounded-xl px-3 py-2 text-[13px] font-medium text-foreground outline-none border border-transparent focus:border-primary/40 placeholder:text-muted-foreground transition-all pr-8"
                  placeholder="Enter destination..."
                />
                {query && (
                  <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((dest) => (
                  <button
                    key={dest.name}
                    onMouseDown={() => handleSelectDest(dest)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-primary opacity-60" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground truncate">{dest.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{dest.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {selectedDest && (
            <div className="px-4 py-4">
              {routeLoading ? (
                <div className="flex items-center justify-center py-6 gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Analyzing path safety...</span>
                </div>
              ) : analysis ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-5 h-5 ${analysis.route_risk === "safe" ? "text-emerald-500" : analysis.route_risk === "medium" ? "text-amber-500" : "text-red-500"}`} />
                      <span className="text-sm font-bold capitalize">{analysis.route_risk} Route</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{analysis.average_score}<span className="text-[10px] font-medium text-muted-foreground ml-0.5">/100</span></div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Safety Score</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border mb-4 text-[12px] leading-relaxed
                    ${analysis.route_risk === "safe" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : analysis.route_risk === "medium" ? "bg-amber-50 border-amber-100 text-amber-800" : "bg-red-50 border-red-100 text-red-800"}`}>
                    {analysis.recommendation}
                  </div>

                  <button
                    onClick={() => setNavStarted(true)}
                    className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-[13px] font-semibold
                      flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    <Navigation2 className="w-4 h-4 translate-y-[1px]" />
                    Confirm & Start Journey
                  </button>
                </>
              ) : (
                <div className="text-center py-4 text-red-500 text-xs">Failed to calculate route safety.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {navStarted && selectedDest && (
        <div className="absolute top-4 right-4 z-20 bg-emerald-600 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <div className="text-[13px] font-bold">Navigation Active</div>
            <div className="text-[11px] opacity-90">Heading to {selectedDest.name}</div>
          </div>
          <button onClick={() => setNavStarted(false)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
