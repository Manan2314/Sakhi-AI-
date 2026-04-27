import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { Step1UserDetails } from "./onboarding/Step1UserDetails";
import { Step2SafetyPreferences } from "./onboarding/Step2SafetyPreferences";
import { Step3EmergencyContacts } from "./onboarding/Step3EmergencyContacts";
import { Step4Confirmation } from "./onboarding/Step4Confirmation";

export default function UserOnboarding() {
  const { setUser } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Form State
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });
  const [preferences, setPreferences] = useState<string[]>(["harassment", "poor_lighting"]);
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);

  const handleStep1Submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await apiFetch("/user", {
        method: "POST",
        body: JSON.stringify({
          name: userDetails.fullName,
          phone: userDetails.mobile,
          email: userDetails.email,
        }),
      });
      setUserId(user.id);
      setUserData(user);
      localStorage.setItem("sakhi_user_id", user.id.toString());
      setStep(2);
    } catch (error: any) {
      console.error("Step 1 failed:", error);
      setError(error.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/user/${userId}/preferences`, {
        method: "PUT",
        body: JSON.stringify(preferences),
      });
      setStep(3);
    } catch (error: any) {
      console.error("Step 2 failed:", error);
      setError(error.message || "Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // Parallel API calls for each contact as per backend endpoint
      await Promise.all(
        contacts.map(contact => 
          apiFetch(`/user/${userId}/contacts`, {
            method: "POST",
            body: JSON.stringify(contact),
          })
        )
      );
      setStep(4);
    } catch (error: any) {
      console.error("Step 3 failed:", error);
      setError(error.message || "Failed to save contacts.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalComplete = () => {
    // Final transition to Dashboard
    if (userData) {
      setUser({
        ...userData,
        preferences,
        contacts // We can attach these for immediate use if needed
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface min-h-screen overflow-y-auto font-inter selection:bg-primary-container/30">
      {/* TopAppBar */}
      <header className="bg-white/80 backdrop-blur-lg fixed top-0 w-full z-50 border-b border-stone-200/50 shadow-[0_4px_20px_rgba(255,182,193,0.04)]">
        <div className="flex justify-between items-center px-6 h-16 max-w-lg mx-auto font-manrope">
          <button 
            onClick={() => step > 1 && setStep(step - 1)}
            className="text-stone-400 hover:bg-stone-100/50 transition-colors p-2 rounded-full"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900">Sakhi AI</h1>
          <button className="text-stone-400 hover:bg-stone-100/50 transition-colors p-2 rounded-full">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 flex flex-col items-center min-h-screen">
        {/* Step Indicator */}
        <div className="w-full max-w-[480px] flex flex-col items-center space-y-stack-sm mb-stack-lg">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 transition-all duration-300 rounded-full ${
                  s === step ? "w-8 bg-primary shadow-[0_0_10px_rgba(135,78,88,0.2)]" : "w-2 bg-stone-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Step {step} of 4
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="w-full max-w-[480px] mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Something went wrong</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Steps */}
        {step === 1 && (
          <Step1UserDetails
            formData={userDetails}
            setFormData={setUserDetails}
            onContinue={handleStep1Submit}
            isLoading={loading}
          />
        )}
        {step === 2 && (
          <Step2SafetyPreferences
            preferences={preferences}
            setPreferences={setPreferences}
            onContinue={handleStep2Submit}
            isLoading={loading}
          />
        )}
        {step === 3 && (
          <Step3EmergencyContacts
            contacts={contacts}
            setContacts={setContacts}
            onContinue={handleStep3Submit}
            isLoading={loading}
          />
        )}
        {step === 4 && (
          <Step4Confirmation
            formData={{ ...userDetails, preferences, contacts }}
            onComplete={handleFinalComplete}
          />
        )}
      </main>

      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-secondary-container/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary-container/20 to-transparent opacity-40" />
      </div>
    </div>
  );
}
