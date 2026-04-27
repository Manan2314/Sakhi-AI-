import React from "react";

interface Step4ConfirmationProps {
  formData: {
    fullName: string;
    preferences: string[];
    contacts: Array<{ name: string; phone: string }>;
  };
  onComplete: () => void;
}

export const Step4Confirmation: React.FC<Step4ConfirmationProps> = ({
  formData,
  onComplete,
}) => {
  return (
    <div className="w-full max-w-[480px] space-y-stack-lg animate-in fade-in zoom-in-95 duration-500">
      <section className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-stack-md">
          <div className="absolute inset-0 bg-primary-container/20 rounded-full animate-pulse"></div>
          <div className="relative w-full h-full rounded-full border-4 border-primary-container bg-white flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
        </div>
        <h2 className="font-manrope text-3xl font-bold text-stone-900 mb-2">
          All set, {formData.fullName.split(" ")[0]}!
        </h2>
        <p className="font-inter text-on-surface-variant max-w-[320px] mx-auto">
          Your safety net is active and ready to protect you on your journey.
        </p>
      </section>

      <section className="space-y-4">
        {/* Profile Card */}
        <div className="glass-card border border-outline-variant p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-inter text-xs font-semibold text-on-surface-variant">Profile Identity</span>
            <span className="text-primary material-symbols-outlined text-base">verified_user</span>
          </div>
          <p className="font-manrope text-xl font-bold text-stone-900">{formData.fullName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="glass-card border border-outline-variant p-4 rounded-xl">
            <span className="block font-inter text-xs text-on-surface-variant mb-1">Emergency Contacts</span>
            <div className="flex items-center gap-2">
              <span className="font-manrope text-2xl font-bold text-stone-900">{formData.contacts.length.toString().padStart(2, '0')}</span>
              <span className="material-symbols-outlined text-primary text-xl">group</span>
            </div>
            <p className="font-inter text-xs text-primary mt-1 font-medium">Verified & Synced</p>
          </div>
          <div className="glass-card border border-outline-variant p-4 rounded-xl">
            <span className="block font-inter text-xs text-on-surface-variant mb-1">Safety Mode</span>
            <div className="flex items-center gap-2">
              <span className="font-manrope text-2xl font-bold text-stone-900">Active</span>
              <span className="material-symbols-outlined text-primary text-xl">shield_with_heart</span>
            </div>
            <p className="font-inter text-xs text-primary mt-1 font-medium">Always Protected</p>
          </div>
        </div>

        {/* Preferences Summary */}
        <div className="glass-card border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface/30">
            <h3 className="font-inter text-sm font-semibold text-stone-900">Selected Preferences</h3>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">settings_accessibility</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-lg">location_on</span>
              </div>
              <div>
                <p className="font-inter text-sm font-semibold text-stone-900">Real-time Tracking</p>
                <p className="font-inter text-xs text-on-surface-variant">Shared with {formData.contacts.length} contacts during trips</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-lg">mic</span>
              </div>
              <div>
                <p className="font-inter text-sm font-semibold text-stone-900">Voice Trigger</p>
                <p className="font-inter text-xs text-on-surface-variant">"Help Sakhi" activates emergency SOS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-stack-md space-y-4">
        <div className="p-4 bg-primary-container/10 border border-primary-container/30 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="font-inter text-xs text-on-primary-container leading-relaxed">
            You can change these preferences at any time from your account settings.
          </p>
        </div>
        <button
          onClick={onComplete}
          className="w-full h-14 bg-gradient-to-r from-secondary-container to-primary-container text-on-primary-container font-manrope font-bold rounded-full shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          Start Using Sakhi AI
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </section>

      <div className="mt-8 flex flex-col items-center gap-2 opacity-40">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span className="font-inter text-[10px] font-semibold uppercase tracking-wider">End-to-end encrypted safety data</span>
        </div>
        <div className="h-1 w-24 bg-outline-variant rounded-full"></div>
      </div>
    </div>
  );
};
