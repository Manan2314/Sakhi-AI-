import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar, { type Page } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import SafetyMap from "@/pages/SafetyMap";
import StartJourney from "@/pages/StartJourney";
import CommunityReports from "@/pages/CommunityReports";
import EmergencyCenter from "@/pages/EmergencyCenter";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

function AppContent() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [isDark, setIsDark] = useState(false);

  const handleToggleDark = () => {
    setIsDark((d) => {
      const next = !d;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "safety-map": return <SafetyMap />;
      case "journey": return <StartJourney />;
      case "community": return <CommunityReports />;
      case "emergency": return <EmergencyCenter />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isDark={isDark}
        onToggleDark={handleToggleDark}
      />
      <main className="flex-1 overflow-hidden relative">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
