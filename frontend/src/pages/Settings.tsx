import { useState, useEffect } from "react";
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
  Plus,
  Trash2,
  LogOut,
  Loader2
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { apiFetch, endpoints } from "@/lib/api";

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

function Row({ icon: Icon, label, desc, rightEl, onClick, color = "text-primary" }: {
  icon: any;
  label: string;
  desc?: string;
  rightEl?: React.ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${onClick ? "cursor-pointer hover:bg-muted/30" : ""}`}
    >
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
  const { user, logout } = useUser();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });

  const fetchContacts = async () => {
    if (!user) return;
    try {
      const data = await apiFetch(endpoints.getContacts(user.id));
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const handleAddContact = async () => {
    if (!user || !newContact.name || !newContact.phone) return;
    setLoading(true);
    try {
      await apiFetch(endpoints.addContact(user.id), {
        method: "POST",
        body: JSON.stringify(newContact)
      });
      setNewContact({ name: "", phone: "" });
      setShowAddContact(false);
      fetchContacts();
    } catch (err) {
      alert("Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="text-[22px] font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-[13px] text-muted-foreground">Manage your personalized safety companion</p>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary uppercase">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="text-[17px] font-bold text-foreground">{user.name}</div>
              <div className="text-[12px] text-muted-foreground">@{user.username}</div>
              <div className="flex items-center gap-2 mt-1.5 overflow-x-auto pb-1">
                {user.preferences.map(p => (
                  <span key={p} className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded-full uppercase text-muted-foreground whitespace-nowrap">
                    {p.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 hover:bg-red-100 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Emergency Contacts Section */}
        <Section title="Emergency Network">
          <div className="p-4 space-y-3">
            {contacts.length > 0 ? (
              contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs capitalize">{c.name.charAt(0)}</div>
                    <div>
                      <div className="text-[13px] font-semibold">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.phone}</div>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-xs italic">No emergency contacts added yet.</div>
            )}
            
            {showAddContact ? (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-2 mt-4 pt-4 border-t border-border">
                <input 
                  type="text" 
                  placeholder="Contact Name"
                  className="w-full bg-muted/60 rounded-xl px-3 py-2 text-[12px] outline-none border border-transparent focus:border-primary/30"
                  value={newContact.name}
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number"
                  className="w-full bg-muted/60 rounded-xl px-3 py-2 text-[12px] outline-none border border-transparent focus:border-primary/30"
                  value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowAddContact(false)} className="flex-1 text-[12px] font-medium py-2">Cancel</button>
                  <button 
                    onClick={handleAddContact}
                    disabled={loading}
                    className="flex-1 bg-primary text-white text-[12px] font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : "Add Contact"}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddContact(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-all text-[12px] font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Emergency Contact
              </button>
            )}
          </div>
        </Section>

        {/* Global Safety Settings */}
        <Section title="Safety Features">
          <Row icon={Shield} label="Personalized Safety Score" desc="Uses your stored priorities for score calculation" />
          <Row icon={Phone} label="SOS Broadcast" desc="Alerts your 5 emergency contacts instantly" />
          <Row icon={Lock} label="Data Privacy" desc="Your movement history is encrypted and auto-deleted" />
        </Section>

        {/* App Info */}
        <div className="text-center py-6 opacity-60">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-[14px] font-bold text-foreground">Sakhi AI</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Version 1.1.0 • Secure Persistent Architecture</div>
          <div className="text-[10px] text-muted-foreground mt-1">Made with ❤️ for Women's Safety</div>
        </div>
      </div>
    </div>
  );
}
