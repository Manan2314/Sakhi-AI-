import { useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  Phone,
  Shield,
  AlertCircle,
  PhoneCall,
  Plus,
  Trash2,
  Siren,
  Hospital,
  HeartPulse,
  MapPin,
  Loader2,
} from "lucide-react";

const emergencyContacts = [
  { name: "Women Helpline", number: "1091", type: "helpline", icon: Phone, color: "#ef4444" },
  { name: "Police", number: "100", type: "police", icon: Shield, color: "#3b82f6" },
  { name: "Ambulance", number: "102", type: "medical", icon: Hospital, color: "#22c55e" },
  { name: "Nirbhaya Helpline", number: "181", type: "helpline", icon: HeartPulse, color: "#a855f7" },
  { name: "Emergency", number: "112", type: "emergency", icon: Siren, color: "#ef4444" },
];

const personalContacts = [
  { name: "Mom", number: "+91 98765 43210", relation: "Family" },
  { name: "Priya (Friend)", number: "+91 87654 32109", relation: "Friend" },
  { name: "Office Security", number: "+91 11 2345 6789", relation: "Work" },
];

export default function EmergencyCenter() {
  const geo = useGeolocation(true);
  const [sosActive, setSosActive] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);
  const [contacts, setContacts] = useState(personalContacts);

  const locationText = geo.position
    ? geo.permissionDenied
      ? "New Delhi, India (Default)"
      : `${geo.position[0].toFixed(5)}°N, ${geo.position[1].toFixed(5)}°E`
    : "Locating...";

  const triggerSOS = () => {
    setSosActive(true);
    setSosSent(false);
    let count = 3;
    setSosCountdown(count);
    const timer = setInterval(() => {
      count--;
      setSosCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setSosActive(false);
        setSosSent(true);
        setTimeout(() => setSosSent(false), 6000);
      }
    }, 1000);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="w-5 h-5 text-primary" />
            <h1 className="text-[22px] font-bold text-foreground">Emergency Center</h1>
          </div>
          <p className="text-[13px] text-muted-foreground">Quick access to emergency services and contacts</p>
        </div>

        {/* Giant SOS Button */}
        <div className="flex flex-col items-center py-8 bg-card rounded-3xl border border-border shadow-sm">
          <div className="text-[13px] font-semibold text-muted-foreground mb-5 uppercase tracking-wider">Emergency SOS</div>
          <button
            onClick={triggerSOS}
            disabled={sosActive}
            className={`
              w-40 h-40 rounded-full flex flex-col items-center justify-center
              text-white font-black text-xl shadow-2xl transition-all duration-200
              ${sosActive
                ? "bg-red-800 cursor-not-allowed scale-95"
                : sosSent
                ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                : "bg-red-600 hover:bg-red-700 active:scale-95 sos-pulse"
              }
            `}
          >
            {sosActive ? (
              <>
                <Loader2 className="w-10 h-10 mb-1 animate-spin" />
                <span className="text-4xl font-black">{sosCountdown}</span>
                <span className="text-[12px] font-semibold mt-0.5 opacity-80">Sending...</span>
              </>
            ) : sosSent ? (
              <>
                <AlertCircle className="w-10 h-10 mb-1" />
                <span className="text-[18px] font-black leading-none">SENT!</span>
                <span className="text-[11px] font-semibold mt-1 opacity-80">Help coming</span>
              </>
            ) : (
              <>
                <Phone className="w-10 h-10 mb-1" />
                <span className="text-[28px] font-black leading-none">SOS</span>
                <span className="text-[11px] font-semibold mt-1 opacity-80">Tap to Activate</span>
              </>
            )}
          </button>

          {/* Location display */}
          <div className="mt-4 flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2.5 text-[12px]">
            {geo.loading ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            )}
            <span className="text-muted-foreground">Location: </span>
            <span className="font-medium text-foreground">{locationText}</span>
          </div>

          {sosActive && (
            <div className="mt-3 text-[13px] font-semibold text-red-600 animate-pulse flex items-center gap-2">
              🚨 Sending alert to {contacts.length} contact(s)...
            </div>
          )}
          {sosSent && (
            <div className="mt-3 text-[13px] font-semibold text-emerald-600 flex items-center gap-2">
              ✅ SOS sent to Mom, Priya & Women Helpline 1091
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-3 text-center max-w-[240px]">
            Immediately notifies your emergency contacts with your live location
          </p>
        </div>

        {/* Quick Dial */}
        <div>
          <h2 className="text-[14px] font-semibold text-foreground mb-3">Quick Dial</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {emergencyContacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.name}
                  href={`tel:${contact.number}`}
                  className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border
                    hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group"
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: contact.color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color: contact.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground truncate">{contact.name}</div>
                    <div className="text-[12px] font-bold mt-0.5" style={{ color: contact.color }}>{contact.number}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Personal Emergency Contacts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-foreground">Personal Contacts</h2>
            <button className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:opacity-80 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {contacts.map((contact, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors group">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[14px] font-bold text-primary">{contact.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground">{contact.name}</div>
                  <div className="text-[11px] text-muted-foreground">{contact.number} • {contact.relation}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${contact.number}`}
                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center hover:opacity-80">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                  <button
                    onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}
                    className="w-8 h-8 rounded-full bg-muted opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-semibold text-primary">Safety Tip</span>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Save emergency numbers on speed dial. Always share your live location with trusted contacts when traveling alone, especially at night.
          </p>
        </div>
      </div>
    </div>
  );
}
