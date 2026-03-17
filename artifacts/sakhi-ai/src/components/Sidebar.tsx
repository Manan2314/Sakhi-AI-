import { useState } from "react";
import {
  LayoutDashboard,
  Navigation2,
  Map,
  MessageSquareWarning,
  PhoneCall,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";

export type Page = "dashboard" | "journey" | "safety-map" | "community" | "emergency" | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

const navItems: { id: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "journey", label: "Start Journey", icon: Navigation2 },
  { id: "safety-map", label: "Safety Map", icon: Map },
  { id: "community", label: "Community Reports", icon: MessageSquareWarning },
  { id: "emergency", label: "Emergency Center", icon: PhoneCall },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, isDark, onToggleDark }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col h-full bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-in-out relative
        ${collapsed ? "w-[64px]" : "w-[220px]"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border overflow-hidden">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-[15px] text-sidebar-foreground leading-none whitespace-nowrap">Sakhi AI</div>
            <div className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">Women's Safety</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-hidden">
        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group relative overflow-hidden
                  ${active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? "" : "opacity-70 group-hover:opacity-100"}`} />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 border-t border-sidebar-border pt-3 space-y-0.5">
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            transition-all duration-150"
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun className="w-[18px] h-[18px] flex-shrink-0 opacity-70" /> : <Moon className="w-[18px] h-[18px] flex-shrink-0 opacity-70" />}
          {!collapsed && <span className="whitespace-nowrap">{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-50 w-6 h-6 rounded-full bg-card border border-border
          flex items-center justify-center shadow-sm hover:bg-accent hover:text-accent-foreground
          transition-all duration-150"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
