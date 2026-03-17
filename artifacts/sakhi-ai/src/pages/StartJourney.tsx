import { useState } from "react";
import MapView from "@/components/MapView";
import { Search, MapPin, Navigation2, Clock, Shield, ChevronRight, Star, X, Locate } from "lucide-react";

const recentPlaces = [
  { name: "Lajpat Nagar Market", address: "Lajpat Nagar, New Delhi", safe: true },
  { name: "Saket Metro Station", address: "Saket, South Delhi", safe: true },
  { name: "Hauz Khas Village", address: "Hauz Khas, South Delhi", safe: false },
];

const routeOptions = [
  { label: "Safest Route", time: "24 min", dist: "4.2 km", score: 92, color: "#22c55e" },
  { label: "Fastest Route", time: "18 min", dist: "3.1 km", score: 71, color: "#f59e0b" },
  { label: "Well-lit Route", time: "28 min", dist: "5.0 km", score: 88, color: "#3b82f6" },
];

export default function StartJourney() {
  const [from, setFrom] = useState("Your Location");
  const [to, setTo] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [started, setStarted] = useState(false);

  return (
    <div className="relative w-full h-full">
      <MapView className="absolute inset-0 w-full h-full" zoom={13} showMarkers={false} />

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
                <Locate className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 bg-muted/60 rounded-xl px-3 py-2 text-[13px] font-medium text-foreground outline-none border border-transparent focus:border-primary/40 placeholder:text-muted-foreground transition-all"
                placeholder="From"
              />
            </div>

            {/* Dotted line connector */}
            <div className="ml-[14px] w-px h-3 border-l-2 border-dashed border-muted-foreground/30" />

            {/* To */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-muted/60 rounded-xl px-3 py-2 text-[13px] font-medium text-foreground outline-none border border-transparent focus:border-primary/40 placeholder:text-muted-foreground transition-all pr-8"
                  placeholder="Where do you want to go?"
                />
                {to && (
                  <button onClick={() => setTo("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Places */}
          {!to && (
            <div className="px-4 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Places</div>
              <div className="space-y-1">
                {recentPlaces.map((place) => (
                  <button
                    key={place.name}
                    onClick={() => setTo(place.name)}
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

          {/* Route options — show when destination is typed */}
          {to && (
            <div className="px-4 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Route Options</div>
              <div className="space-y-2">
                {routeOptions.map((route, i) => (
                  <button
                    key={route.label}
                    onClick={() => setSelectedRoute(i)}
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
                      <div className="text-[11px] text-muted-foreground">{route.time} • {route.dist}</div>
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
                onClick={() => setStarted(true)}
                className="w-full mt-3 bg-primary text-primary-foreground rounded-xl py-3 text-[13px] font-semibold
                  flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-sm"
              >
                <Navigation2 className="w-4 h-4" />
                Start Navigation
              </button>
            </div>
          )}
        </div>
      </div>

      {started && (
        <div className="absolute top-4 right-4 z-10 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold flex items-center gap-2">
          <Navigation2 className="w-4 h-4" />
          Navigation Started!
        </div>
      )}
    </div>
  );
}
