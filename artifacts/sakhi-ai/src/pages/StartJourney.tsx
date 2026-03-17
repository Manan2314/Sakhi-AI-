import { useState, useMemo } from "react";
import MapView from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  DELHI_DESTINATIONS,
  generateRoute,
  getDistanceKm,
} from "@/data/delhiData";
import { MapPin, Navigation2, Clock, Shield, ChevronRight, X, Locate, Loader2, CheckCircle2 } from "lucide-react";

const ROUTE_CONFIGS = [
  { label: "Safest Route", score: 92, color: "#22c55e", timeMultiplier: 1.4 },
  { label: "Fastest Route", score: 71, color: "#f59e0b", timeMultiplier: 1.0 },
  { label: "Well-lit Route", score: 88, color: "#3b82f6", timeMultiplier: 1.6 },
];

export default function StartJourney() {
  const geo = useGeolocation(true);
  const [query, setQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState<typeof DELHI_DESTINATIONS[0] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [navStarted, setNavStarted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const origin = geo.position ?? [28.6329, 77.2195];

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return DELHI_DESTINATIONS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.address.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  const routes = useMemo(() => {
    if (!selectedDest) return null;
    const distKm = getDistanceKm(origin, selectedDest.pos);
    return ROUTE_CONFIGS.map((cfg, i) => ({
      ...cfg,
      dist: `${(distKm * (0.9 + i * 0.2)).toFixed(1)} km`,
      time: `${Math.round((distKm / 15) * 60 * cfg.timeMultiplier)} min`,
      points: generateRoute(origin, selectedDest.pos, i),
    }));
  }, [selectedDest, origin[0], origin[1]]);

  const activeRoute = routes ? routes[selectedRoute].points : null;

  const handleSelectDest = (dest: typeof DELHI_DESTINATIONS[0]) => {
    setSelectedDest(dest);
    setQuery(dest.name);
    setShowSuggestions(false);
    setNavStarted(false);
    setSelectedRoute(0);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedDest(null);
    setNavStarted(false);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full h-full">
      <MapView
        className="absolute inset-0 w-full h-full"
        zoom={13}
        showSafePlaces={false}
        showDangerZones={false}
        userLocation={geo.position}
        route={activeRoute}
        fitToRoute={!!activeRoute && navStarted}
      />

      {/* Input Panel */}
      <div className="absolute top-4 left-4 z-10 w-[320px]">
        <div className="bg-card/97 backdrop-blur-sm rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Navigation2 className="w-4 h-4 text-primary" />
              <h2 className="text-[15px] font-semibold text-foreground">Plan Your Journey</h2>
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
              <div className="flex-1 bg-muted/60 rounded-xl px-3 py-2 text-[13px] font-medium text-foreground border border-transparent">
                {geo.loading
                  ? "Getting your location..."
                  : geo.permissionDenied
                  ? "New Delhi (Default)"
                  : `${origin[0].toFixed(4)}°N, ${origin[1].toFixed(4)}°E`}
              </div>
            </div>

            <div className="ml-[14px] w-px h-3 border-l-2 border-dashed border-muted-foreground/30" />

            {/* To — with autocomplete */}
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
                  placeholder="Search Delhi locations..."
                />
                {query && (
                  <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((dest) => (
                  <button
                    key={dest.name}
                    onMouseDown={() => handleSelectDest(dest)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${dest.safe ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}>
                      <MapPin className={`w-3 h-3 ${dest.safe ? "text-emerald-600" : "text-amber-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground truncate">{dest.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{dest.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Places — shown when no destination */}
          {!selectedDest && !query && (
            <div className="px-4 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Places</div>
              <div className="space-y-1">
                {DELHI_DESTINATIONS.slice(0, 4).map((place) => (
                  <button
                    key={place.name}
                    onClick={() => handleSelectDest(place)}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-muted/60 transition-colors text-left"
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${place.safe ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}>
                      <Clock className={`w-3 h-3 ${place.safe ? "text-emerald-600" : "text-amber-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-foreground truncate">{place.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{place.address}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Route options */}
          {selectedDest && routes && (
            <div className="px-4 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Route Options</div>
              <div className="space-y-2">
                {routes.map((route, i) => (
                  <button
                    key={route.label}
                    onClick={() => { setSelectedRoute(i); setNavStarted(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left
                      ${selectedRoute === i ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/60"}`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: route.color + "20" }}>
                      <Navigation2 className="w-4 h-4" style={{ color: route.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-foreground">{route.label}</span>
                        {i === 0 && (
                          <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full uppercase">Recommended</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{route.time} · {route.dist}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Shield className="w-3 h-3" style={{ color: route.color }} />
                        <span className="text-[13px] font-bold" style={{ color: route.color }}>{route.score}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground">safety</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setNavStarted(true)}
                className="w-full mt-3 bg-primary text-primary-foreground rounded-xl py-3 text-[13px] font-semibold
                  flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Navigation2 className="w-4 h-4" />
                Start Navigation
              </button>
            </div>
          )}
        </div>
      </div>

      {navStarted && selectedDest && (
        <div className="absolute top-4 right-4 z-10 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <div>
            <div className="text-[13px] font-bold">Navigating to {selectedDest.name}</div>
            <div className="text-[11px] opacity-80">{routes?.[selectedRoute].time} · {routes?.[selectedRoute].dist}</div>
          </div>
        </div>
      )}
    </div>
  );
}
