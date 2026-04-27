import React from "react";

interface Step1UserDetailsProps {
  formData: {
    fullName: string;
    mobile: string;
    email: string;
  };
  setFormData: (data: any) => void;
  onContinue: () => void;
  isLoading: boolean;
}

export const Step1UserDetails: React.FC<Step1UserDetailsProps> = ({
  formData,
  setFormData,
  onContinue,
  isLoading,
}) => {
  return (
    <div className="w-full max-w-[480px] space-y-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="text-center space-y-stack-sm">
        <h2 className="font-manrope text-3xl font-bold text-stone-900">Welcome to Sakhi</h2>
        <p className="font-inter text-base text-on-surface-variant px-4">
          Let's start with the basics. Your safety is our priority, and these details help us personalize your experience.
        </p>
      </div>

      {/* Onboarding Card */}
      <div className="glass-card border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-stack-md">
        {/* Input Group: Full Name */}
        <div className="space-y-unit">
          <label className="block font-inter text-sm font-semibold text-on-surface-variant ml-1" htmlFor="full_name">
            Full Name
          </label>
          <div className="relative group">
            <input
              className="w-full h-14 px-4 rounded-lg border border-outline-variant bg-surface/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-stone-400 outline-none"
              id="full_name"
              placeholder="e.g. Aditi Sharma"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 group-focus-within:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </div>
          </div>
        </div>

        {/* Input Group: Mobile Number */}
        <div className="space-y-unit">
          <label className="block font-inter text-sm font-semibold text-on-surface-variant ml-1" htmlFor="mobile">
            Mobile Number
          </label>
          <div className="flex gap-2">
            <div className="h-14 px-3 flex items-center justify-center bg-surface/50 border border-outline-variant rounded-lg text-on-surface font-inter font-medium">
              +91
            </div>
            <div className="relative flex-1 group">
              <input
                className="w-full h-14 px-4 rounded-lg border border-outline-variant bg-surface/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-stone-400 outline-none"
                id="mobile"
                placeholder="98765 43210"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Group: Email (Optional) */}
        <div className="space-y-unit">
          <div className="flex justify-between items-center ml-1">
            <label className="block font-inter text-sm font-semibold text-on-surface-variant" htmlFor="email">
              Email Address
            </label>
            <span className="font-inter text-xs text-stone-400 italic">Optional</span>
          </div>
          <div className="relative group">
            <input
              className="w-full h-14 px-4 rounded-lg border border-outline-variant bg-surface/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-stone-400 outline-none"
              id="email"
              placeholder="aditi@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="space-y-stack-md pt-stack-sm">
        <button
          onClick={onContinue}
          disabled={isLoading || !formData.fullName || !formData.mobile}
          className="w-full h-14 bg-gradient-to-r from-secondary-container to-primary-container text-on-primary-container font-manrope font-bold rounded-full shadow-lg shadow-primary-container/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Continue"}
          {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
        <p className="text-center font-inter text-xs text-stone-400 px-8 leading-relaxed">
          By continuing, you agree to our <a className="text-primary underline decoration-primary/30 underline-offset-2" href="#">Terms of Service</a> and <a className="text-primary underline decoration-primary/30 underline-offset-2" href="#">Privacy Policy</a>.
        </p>
      </div>

      {/* Visual Support Element */}
      <div className="grid grid-cols-2 gap-gutter opacity-60">
        <div className="p-4 rounded-xl bg-surface/50 border border-outline-variant/20 flex flex-col items-center text-center space-y-2">
          <span className="material-symbols-outlined text-primary">encrypted</span>
          <span className="font-inter text-xs text-on-surface-variant">Encrypted Data</span>
        </div>
        <div className="p-4 rounded-xl bg-surface/50 border border-outline-variant/20 flex flex-col items-center text-center space-y-2">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          <span className="font-inter text-xs text-on-surface-variant">Secure Identity</span>
        </div>
      </div>
    </div>
  );
};
