import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  MapPin,
  Phone,
  Moon,
  Globe,
  Volume2,
  Vibrate,
  ChevronRight,
  User,
  Lock,
  Smartphone,
} from "lucide-react";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? "left-[calc(100%-19px)]" : "left-0.5"}`} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, desc, rightEl, color = "text-primary" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc?: string;
  rightEl?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
      <div className={`w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-foreground">{label}</div>
        {desc && <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      {rightEl ?? <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </div>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState({
    guardian: true,
    liveLocation: true,
    alerts: true,
    sound: true,
    vibration: true,
    nightMode: false,
    offlineMode: false,
    anonymousReporting: true,
    fakeCall: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="text-[22px] font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-[13px] text-muted-foreground">Customize your safety preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary">S</span>
          </div>
          <div className="flex-1">
            <div className="text-[16px] font-bold text-foreground">Sakhi User</div>
            <div className="text-[12px] text-muted-foreground">Delhi, India</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-medium">Guardian Mode Active</span>
            </div>
          </div>
          <button className="text-[12px] font-semibold text-primary hover:opacity-80 transition-colors">
            Edit
          </button>
        </div>

        {/* Safety Settings */}
        <Section title="Safety">
          <Row
            icon={Eye}
            label="Guardian Mode"
            desc="Share real-time location with trusted contacts"
            rightEl={<Toggle enabled={prefs.guardian} onChange={() => toggle("guardian")} />}
          />
          <Row
            icon={MapPin}
            label="Live Location Sharing"
            desc="Always share location during journeys"
            rightEl={<Toggle enabled={prefs.liveLocation} onChange={() => toggle("liveLocation")} />}
          />
          <Row
            icon={Shield}
            label="Anonymous Reporting"
            desc="Submit community reports anonymously"
            rightEl={<Toggle enabled={prefs.anonymousReporting} onChange={() => toggle("anonymousReporting")} />}
          />
          <Row
            icon={Phone}
            label="Fake Call Feature"
            desc="Schedule a fake call for escape situations"
            rightEl={<Toggle enabled={prefs.fakeCall} onChange={() => toggle("fakeCall")} />}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            icon={Bell}
            label="Safety Alerts"
            desc="Get notified about nearby incidents"
            rightEl={<Toggle enabled={prefs.alerts} onChange={() => toggle("alerts")} />}
            color="text-amber-500"
          />
          <Row
            icon={Volume2}
            label="Alert Sound"
            desc="Play audio on emergency alerts"
            rightEl={<Toggle enabled={prefs.sound} onChange={() => toggle("sound")} />}
            color="text-blue-500"
          />
          <Row
            icon={Vibrate}
            label="Vibration"
            desc="Vibrate on alerts"
            rightEl={<Toggle enabled={prefs.vibration} onChange={() => toggle("vibration")} />}
            color="text-purple-500"
          />
        </Section>

        {/* App Preferences */}
        <Section title="App Preferences">
          <Row
            icon={Moon}
            label="Night Mode"
            desc="Dark theme for low-light use"
            rightEl={<Toggle enabled={prefs.nightMode} onChange={() => toggle("nightMode")} />}
            color="text-indigo-500"
          />
          <Row
            icon={Globe}
            label="Language"
            rightEl={
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-muted-foreground">English</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            }
            color="text-green-500"
          />
          <Row
            icon={Smartphone}
            label="Offline Mode"
            desc="Save map data for offline use"
            rightEl={<Toggle enabled={prefs.offlineMode} onChange={() => toggle("offlineMode")} />}
            color="text-teal-500"
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <Row icon={User} label="Edit Profile" />
          <Row icon={Lock} label="Privacy & Security" />
          <Row icon={Phone} label="Emergency Contacts" />
        </Section>

        {/* App version */}
        <div className="text-center py-2">
          <div className="text-[11px] text-muted-foreground">Sakhi AI v1.0.0 • Made with ❤️ for women's safety</div>
        </div>
      </div>
    </div>
  );
}
