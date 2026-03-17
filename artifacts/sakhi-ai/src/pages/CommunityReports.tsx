import { useState } from "react";
import MapView from "@/components/MapView";
import {
  MessageSquareWarning,
  Plus,
  Filter,
  AlertCircle,
  Eye,
  Moon,
  Car,
  Users,
  ThumbsUp,
  Clock,
} from "lucide-react";

const categories = [
  { id: "all", label: "All", color: "#6b7280" },
  { id: "harassment", label: "Harassment", color: "#ef4444", icon: AlertCircle },
  { id: "stalking", label: "Stalking", color: "#f97316", icon: Eye },
  { id: "lighting", label: "Poor Lighting", color: "#f59e0b", icon: Moon },
  { id: "transport", label: "Unsafe Transport", color: "#3b82f6", icon: Car },
  { id: "gathering", label: "Unsafe Gathering", color: "#8b5cf6", icon: Users },
];

const reports = [
  {
    id: 1, category: "harassment", title: "Verbal harassment near CP Metro",
    location: "Connaught Place", time: "2h ago", votes: 14, verified: true,
    desc: "Group of men making inappropriate comments near gate 5."
  },
  {
    id: 2, category: "lighting", title: "Street lights not working",
    location: "Lajpat Nagar Lane 3", time: "5h ago", votes: 8, verified: false,
    desc: "Entire stretch of road dark after 9pm, very unsafe."
  },
  {
    id: 3, category: "stalking", title: "Man following women from market",
    location: "Saket Market", time: "1d ago", votes: 22, verified: true,
    desc: "Multiple incidents reported near the south exit of the market."
  },
  {
    id: 4, category: "transport", title: "Auto driver refused to go by meter",
    location: "AIIMS Flyover", time: "3h ago", votes: 6, verified: false,
    desc: "Auto drivers demanding inflated fares and being rude to women."
  },
];

export default function CommunityReports() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showReportForm, setShowReportForm] = useState(false);

  const filtered = activeCategory === "all" ? reports : reports.filter(r => r.category === activeCategory);

  return (
    <div className="relative w-full h-full flex">
      {/* Map — takes up full space, panel overlays on left */}
      <MapView className="absolute inset-0 w-full h-full" zoom={12} showMarkers={true} />

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
                onClick={() => setShowReportForm(!showReportForm)}
                className="flex items-center gap-1 bg-primary text-primary-foreground rounded-xl px-3 py-1.5 text-[12px] font-semibold
                  hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Report
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all
                    ${activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Form */}
          {showReportForm && (
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <div className="text-[12px] font-semibold text-foreground mb-2">New Report</div>
              <input
                type="text"
                placeholder="What happened?"
                className="w-full bg-background rounded-xl px-3 py-2 text-[12px] mb-2 border border-border outline-none focus:border-primary/40"
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full bg-background rounded-xl px-3 py-2 text-[12px] mb-2 border border-border outline-none focus:border-primary/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-[12px] font-semibold hover:opacity-90 transition-all"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setShowReportForm(false)}
                  className="px-3 bg-muted rounded-xl py-2 text-[12px] font-semibold hover:bg-muted/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reports list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {filtered.map((report) => {
              const cat = categories.find(c => c.id === report.category);
              return (
                <div key={report.id} className="p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color }} />
                      <span className="text-[12px] font-semibold text-foreground leading-tight">{report.title}</span>
                    </div>
                    {report.verified && (
                      <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{report.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />{report.time}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{report.location}</span>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      {report.votes}
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
