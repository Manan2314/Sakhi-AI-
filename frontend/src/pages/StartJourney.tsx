import { useState, useMemo } from "react";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRouteAnalysis } from "@/hooks/useRouteAnalysis";
import { MapPin, Navigation2, Shield, X, Locate, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { apiFetch, endpoints } from "@/lib/api";

// Minimal static destinations for search simulation (backend alignment)
const DESTINATIONS = [
  { name: "Lajpat Nagar Market", address: "Lajpat Nagar, New Delhi", pos: [28.5720, 77.2432] as [number, number] },
  { name: "Saket Metro Station", address: "Saket, South Delhi", pos: [28.5224, 77.2188] as [number, number] },
  { name: "Connaught Place", address: "CP, New Delhi", pos: [28.6289, 77.2065] as [number, number] },
  { name: "India Gate", address: "Rajpath, New Delhi", pos: [28.6129, 77.2295] as [number, number] },
  { name: "AIIMS Hospital", address: "Ansari Nagar, New Delhi", pos: [28.5676, 77.2100] as [number, number] },
  { name: "Rajiv Chowk Metro", address: "Central Delhi", pos: [28.6331, 77.2194] as [number, number] },
];

const DEMO_ROUTES = [
  { label: "AIIMS → Saket Metro", start: [28.5676, 77.2100] as [number, number], end: [28.5224, 77.2188] as [number, number], destName: "Saket Metro Station" },
  { label: "Connaught Place → India Gate", start: [28.6289, 77.2065] as [number, number], end: [28.6129, 77.2295] as [number, number], destName: "India Gate" },
  { label: "Hauz Khas → Green Park", start: [28.5494, 77.2001] as [number, number], end: [28.5586, 77.2057] as [number, number], destName: "Green Park" },
  { label: "Lajpat Nagar → Nehru Place", start: [28.5720, 77.2432] as [number, number], end: [28.5495, 77.2514] as [number, number], destName: "Nehru Place" },
];

export default function StartJourney() {
  const geo = useGeolocation(true);
  const { user } = useUser();
  const { analysis, loading: routeLoading, error: routeError, analyzeRoute, clear: clearRoute } = useRouteAnalysis();

  
  const [query, setQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState<typeof DESTINATIONS[0] | null>(null);
  const [navStarted, setNavStarted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [demoOrigin, setDemoOrigin] = useState<[number, number] | null>(null);
  
  const [prefText, setPrefText] = useState("");
  const [extractedPrefs, setExtractedPrefs] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);

  const handleExtract = async () => {
    if (!prefText.trim()) return;
    setExtracting(true);
    try {
      const data = await apiFetch(endpoints.extractPreferences, { 
        method: "POST", 
        body: JSON.stringify({ text: prefText }) 
      });
      if (data.preferences) {
        setExtractedPrefs(data.preferences);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const origin = demoOrigin ?? geo.position ?? [28.6139, 77.2090];

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
    setDemoOrigin(null);
    
    // Call backend for safe-route analysis
    const prefsList = [];
    if (user?.preferences) prefsList.push(...user.preferences);
    if (extractedPrefs.length > 0) prefsList.push(...extractedPrefs);
    const prefsStr = prefsList.length > 0 ? prefsList.join(",") : undefined;
    
    await analyzeRoute(origin, dest.pos, user?.id, prefsStr);
  };

  const handleDemoRoute = async (route: typeof DEMO_ROUTES[0]) => {
    setDemoOrigin(route.start);
    const dest = { name: route.destName, address: "Demo Destination", pos: route.end };
    setSelectedDest(dest);
    setQuery(dest.name);
    setShowSuggestions(false);
    setNavStarted(false);
    
    const prefsList = [];
    if (user?.preferences) prefsList.push(...user.preferences);
    if (extractedPrefs.length > 0) prefsList.push(...extractedPrefs);
    const prefsStr = prefsList.length > 0 ? prefsList.join(",") : undefined;
    
    await analyzeRoute(route.start, route.end, user?.id, prefsStr);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedDest(null);
    setNavStarted(false);
    setShowSuggestions(false);
    setDemoOrigin(null);
    clearRoute();
  };

  return (
    <div className="relative w-full h-full">
      {/* Demo Mode Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-500/95 text-white text-[11px] px-3.5 py-1.5 rounded-full shadow-md font-semibold whitespace-nowrap tracking-wide">
        Currently optimized using seeded Delhi safety intelligence data.
      </div>
      
      <MapView
        className="absolute inset-0 w-full h-full"
        zoom={13}
        userLocation={geo.position}
        routes={analysis?.routes}
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

            {/* AI Preferences Input */}
            <div className="mt-3 bg-muted/30 rounded-xl p-3 border border-border/50 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  What makes you feel unsafe?
                </span>
                <button 
                  onClick={handleExtract}
                  disabled={extracting || !prefText.trim()}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                >
                  {extracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </button>
              </div>
              <textarea 
                value={prefText}
                onChange={(e) => setPrefText(e.target.value)}
                onBlur={handleExtract}
                placeholder="e.g., I avoid dark and isolated roads..."
                className="w-full bg-transparent text-[12px] text-foreground outline-none resize-none placeholder:text-muted-foreground/60 h-[36px]"
              />
              
              {extractedPrefs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {extractedPrefs.map(pref => (
                    <div key={pref} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-semibold uppercase tracking-wider">
                      {pref.replace("_", " ")}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preloaded Demo Routes */}
            {!selectedDest && !query && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Preloaded Demo Routes
                </div>
                <div className="flex flex-col gap-1.5">
                  {DEMO_ROUTES.map(route => (
                    <button 
                      key={route.label}
                      onClick={() => handleDemoRoute(route)}
                      className="text-left px-3 py-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-[12px] text-foreground font-medium transition-colors flex items-center justify-between"
                    >
                      {route.label}
                      <ArrowRight className="w-3.5 h-3.5 opacity-50 text-amber-500/70" />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  <div className="space-y-3 mb-4">
                    {analysis.routes?.map((route) => {
                      const isSafest = route.type === "safest";
                      return (
                        <div 
                          key={route.type} 
                          className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all
                            ${isSafest 
                              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20" 
                              : "bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/20"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${isSafest ? "bg-emerald-500" : "bg-orange-500"}`} />
                              <span className="text-[12px] font-bold capitalize text-foreground">
                                {route.type === "safest" ? "Safest Route" : "Shortest Route"}
                              </span>
                            </div>
                            {route.average_score !== undefined && (
                              <div className="text-right">
                                <span className="text-[12px] font-bold text-foreground">{route.average_score}</span>
                                <span className="text-[9px] text-muted-foreground ml-0.5">/100</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground font-medium">
                            <span>{(route.distance / 1000).toFixed(1)} km</span>
                            <span>•</span>
                            <span>{Math.round(route.duration / 60)} mins</span>
                          </div>

                          {route.explanation && (
                            <div className={`mt-1.5 p-2 rounded-lg text-[11px] leading-snug border transition-all flex gap-1.5 items-start ${isSafest ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/20" : "bg-muted/50 text-muted-foreground border-border/50"}`}>
                              {isSafest && <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />}
                              <span>{route.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              ) : routeError ? (
                <div className="text-center py-6 px-4 bg-red-500/10 rounded-xl border border-red-500/20 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-[13px] font-semibold mb-1">Service Unavailable</div>
                  <div className="text-[11px] opacity-80">{routeError}</div>
                </div>
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
