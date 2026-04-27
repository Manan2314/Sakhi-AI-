import React from "react";

interface Step2SafetyPreferencesProps {
  preferences: string[];
  setPreferences: (prefs: string[]) => void;
  onContinue: () => void;
  isLoading: boolean;
}

const PREFERENCE_OPTIONS = [
  {
    id: "harassment",
    title: "Harassment / Eve-teasing",
    desc: "Alerts for high-frequency report zones involving public misconduct.",
    icon: "record_voice_over",
  },
  {
    id: "poor_lighting",
    title: "Poor Lighting Areas",
    desc: "Prioritize routes with active street lighting and commercial activity.",
    icon: "lightbulb_outline",
  },
  {
    id: "isolated_areas",
    title: "Unsafe / Isolated Areas",
    desc: "Warnings for construction zones or areas with low foot traffic.",
    icon: "map",
  },
  {
    id: "stalking",
    title: "Stalking / Being Followed",
    desc: "AI analysis of movement patterns to detect suspicious proximity.",
    icon: "visibility",
  },
];

export const Step2SafetyPreferences: React.FC<Step2SafetyPreferencesProps> = ({
  preferences,
  setPreferences,
  onContinue,
  isLoading,
}) => {
  const togglePreference = (id: string) => {
    if (preferences.includes(id)) {
      setPreferences(preferences.filter((p) => p !== id));
    } else {
      setPreferences([...preferences, id]);
    }
  };

  return (
    <div className="w-full max-w-[480px] space-y-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <section className="text-center">
        <h2 className="font-manrope text-3xl font-bold text-stone-900 mb-2">Safety Preferences</h2>
        <p className="font-inter text-on-surface-variant">
          Select the situations where you would like Sakhi to be more vigilant. Multiple selection allowed.
        </p>
      </section>

      {/* Selection Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {PREFERENCE_OPTIONS.map((option) => {
          const isSelected = preferences.includes(option.id);
          return (
            <div
              key={option.id}
              onClick={() => togglePreference(option.id)}
              className={`group relative bg-white p-4 rounded-xl border-2 transition-all active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? "border-primary shadow-md"
                  : "border-outline-variant hover:border-primary/30"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className={`p-3 rounded-lg transition-colors ${
                    isSelected ? "bg-primary-container text-primary" : "bg-surface text-stone-400"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {option.icon}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "bg-primary border-primary text-white" : "border-outline-variant"
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                </div>
              </div>
              <h3 className="font-manrope font-bold text-stone-900 mb-1">{option.title}</h3>
              <p className="font-inter text-sm text-on-surface-variant leading-relaxed">{option.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-stack-md flex gap-4">
        <button
          onClick={onContinue}
          className="flex-1 h-14 rounded-full font-manrope font-bold text-stone-400 border border-outline-variant hover:bg-stone-50 transition-all"
        >
          Skip
        </button>
        <button
          onClick={onContinue}
          disabled={isLoading}
          className="flex-[2] h-14 rounded-full font-manrope font-bold text-white bg-gradient-to-r from-primary-container to-[#874e58] shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Continue to Step 3"}
        </button>
      </div>
    </div>
  );
};
