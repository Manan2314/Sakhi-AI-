import { useState, useCallback, useEffect } from "react";
import MapView, { type ReportMarker } from "@/components/MapView";
import { useGeolocation } from "@/hooks/useGeolocation";
import { apiFetch, endpoints } from "@/lib/api";
import {
  MessageSquareWarning,
  Plus,
  AlertCircle,
  Eye,
  Moon,
  Car,
  Users,
  ThumbsUp,
  Clock,
  MapPin,
  X,
  CheckCircle2,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", color: "#6b7280" },
  { id: "harassment", label: "Harassment", color: "#ef4444", icon: AlertCircle },
  { id: "unsafe_area", label: "Unsafe Area", color: "#f97316", icon: Eye },
  { id: "poor_lighting", label: "Poor Lighting", color: "#f59e0b", icon: Moon },
  { id: "transport", label: "Unsafe Transport", color: "#3b82f6", icon: Car },
  { id: "gathering", label: "Unsafe Gathering", color: "#8b5cf6", icon: Users },
];

const CAT_MAP: Record<string, string> = Object.fromEntries(CATEGORIES.slice(1).map(c => [c.id, c.color]));

export default function CommunityReports() {
  console.log("CommunityReports loaded");
  console.log("useEffect:", typeof useEffect);
  
  const geo = useGeolocation(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [pendingPin, setPendingPin] = useState<[number, number] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("harassment");
  const [newDesc, setNewDesc] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const data = await apiFetch(endpoints.getReports());
      const formatted = data.map((r: any) => ({
        id: r.id,
        category: r.type,
        title: r.type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        location: `${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)}`,
        time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        votes: 0,
        verified: false,
        desc: r.description || "Community report submitted.",
        pos: [r.latitude, r.longitude] as [number, number],
      }));
      setReports(formatted);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleMapClick = useCallback((latlng: [number, number]) => {
    if (!showReportForm) return;
    setPendingPin(latlng);
    setNewLocation(`${latlng[0].toFixed(4)}°N, ${latlng[1].toFixed(4)}°E`);
  }, [showReportForm]);

  const openForm = () => {
    setShowReportForm(true);
    setPendingPin(geo.position ?? null);
    if (geo.position) {
      setNewLocation(`${geo.position[0].toFixed(4)}°N, ${geo.position[1].toFixed(4)}°E`);
    }
  };

  const cancelForm = () => {
    setShowReportForm(false);
    setPendingPin(null);
    setNewTitle("");
    setNewLocation("");
    setNewDesc("");
    setNewCategory("harassment");
  };

  const submitReport = async () => {
    if (!newTitle.trim()) return;
    const pin = pendingPin ?? geo.position ?? [28.6139, 77.2090];
    
    try {
      await apiFetch(endpoints.getReports(), {
        method: "POST",
        body: JSON.stringify({
          type: newCategory,
          latitude: pin[0],
          longitude: pin[1],
          description: newTitle.trim() + (newDesc.trim() ? `: ${newDesc.trim()}` : ""),
        }),
      });

      fetchReports();
      cancelForm();
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
    } catch (err) {
      console.error("Failed to submit report:", err);
    }
  };

  const handleVote = (id: number) => {
    setVotes((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
  };

  const filtered = activeCategory === "all" ? reports : reports.filter(r => r.category === activeCategory);

  const mapReportMarkers: ReportMarker[] = reports.map(r => ({
    id: r.id,
    pos: r.pos,
    category: r.category,
    title: r.title,
    color: CAT_MAP[r.category] ?? "#6b7280",
  }));

  const pendingMarkers: ReportMarker[] = pendingPin ? [{
    id: -1,
    pos: pendingPin,
    category: newCategory,
    title: newTitle || "New Report",
    color: CAT_MAP[newCategory] ?? "#6b7280",
  }] : [];

  return (
    <div className="relative w-full h-full flex">
      <MapView
        className="absolute inset-0 w-full h-full"
        zoom={12}
        showSafePlaces={false}
        showDangerZones={false}
        userLocation={geo.position}
        reportMarkers={[...mapReportMarkers, ...pendingMarkers]}
        onMapClick={handleMapClick}
      />

      {/* Hint when placing marker */}
      {showReportForm && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground rounded-full px-4 py-2 text-[12px] font-semibold shadow-lg flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          Tap anywhere on map to pin the incident location
        </div>
      )}

      {/* Success toast */}
      {justSubmitted && (
        <div className="absolute top-4 right-4 z-20 bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Report submitted successfully!
        </div>
      )}

      {/* Left Panel */}
      <div className="relative z-10 w-[320px] flex flex-col h-full pointer-events-none">
        <div className="pointer-events-auto m-4 bg-card/97 backdrop-blur-sm rounded-2xl shadow-lg border border-border flex flex-col overflow-hidden max-h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-primary" />
                <h2 className="text-[15px] font-semibold text-foreground">Community Reports</h2>
              </div>
              <button
                onClick={showReportForm ? cancelForm : openForm}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[12px] font-semibold
                  hover:opacity-90 active:scale-95 transition-all shadow-sm
                  ${showReportForm ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}
              >
                {showReportForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showReportForm ? "Cancel" : "Report"}
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all
                    ${activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Form */}
          {showReportForm && (
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <div className="text-[12px] font-semibold text-foreground mb-2">New Report</div>

              {/* Category picker */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CATEGORIES.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border
                      ${newCategory === cat.id ? "text-white border-transparent" : "bg-muted border-border text-muted-foreground"}`}
                    style={newCategory === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What happened? (required)"
                className="w-full bg-background rounded-xl px-3 py-2 text-[12px] mb-2 border border-border outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground"
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe the incident..."
                rows={2}
                className="w-full bg-background rounded-xl px-3 py-2 text-[12px] mb-2 border border-border outline-none focus:border-primary/40 resize-none text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2 mb-3 bg-background rounded-xl px-3 py-2 border border-border">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Location (tap map to pin)"
                  className="flex-1 text-[12px] outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitReport}
                  disabled={!newTitle.trim()}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-[12px] font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                >
                  Submit Report
                </button>
                <button
                  onClick={cancelForm}
                  className="px-3 bg-muted rounded-xl py-2 text-[12px] font-semibold hover:bg-muted/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reports list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-[12px]">No reports in this category yet.</div>
            )}
            {filtered.map((report) => {
              const cat = CATEGORIES.find(c => c.id === report.category);
              const extraVotes = votes[report.id] ?? 0;
              return (
                <div key={report.id} className="p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color }} />
                      <span className="text-[12px] font-semibold text-foreground leading-tight">{report.title}</span>
                    </div>
                    {report.verified && (
                      <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex-shrink-0">VERIFIED</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{report.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />{report.time}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{report.location}</span>
                    </div>
                    <button
                      onClick={() => handleVote(report.id)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {report.votes + extraVotes}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
