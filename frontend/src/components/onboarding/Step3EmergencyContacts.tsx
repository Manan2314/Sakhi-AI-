import React from "react";

interface Contact {
  name: string;
  phone: string;
}

interface Step3EmergencyContactsProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  onContinue: () => void;
  isLoading: boolean;
}

export const Step3EmergencyContacts: React.FC<Step3EmergencyContactsProps> = ({
  contacts,
  setContacts,
  onContinue,
  isLoading,
}) => {
  const addContact = () => {
    setContacts([...contacts, { name: "", phone: "" }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const isComplete = contacts.length > 0 && contacts.every((c) => c.name && c.phone);

  return (
    <div className="w-full max-w-[480px] space-y-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="font-manrope text-3xl font-bold text-stone-900 mb-2">Emergency Contacts</h2>
        <p className="font-inter text-on-surface-variant">
          Who should we notify in case of an emergency? Add your trusted circle.
        </p>
      </div>

      {/* Contacts Container */}
      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="glass-card rounded-xl border border-outline-variant p-4 shadow-sm relative group">
            {contacts.length > 1 && (
              <button
                onClick={() => removeContact(index)}
                className="absolute top-4 right-4 text-stone-400 hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
            <div className="space-y-4">
              <div className="relative">
                <label className="absolute -top-2 left-3 px-1 bg-white text-xs font-semibold text-primary z-10">
                  Full Name
                </label>
                <input
                  className="w-full h-14 bg-surface/50 border border-outline-variant rounded-lg px-4 pt-2 font-inter text-stone-900 focus:ring-2 focus:ring-primary-container focus:border-primary transition-all outline-none"
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={contact.name}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 px-1 bg-white text-xs font-semibold text-primary z-10">
                  Phone Number
                </label>
                <div className="flex items-center h-14 bg-surface/50 border border-outline-variant rounded-lg px-4 pt-2 focus-within:ring-2 focus-within:ring-primary-container focus-within:border-primary transition-all">
                  <span className="font-inter text-on-surface-variant mr-2">+91</span>
                  <input
                    className="w-full bg-transparent border-none p-0 font-inter text-stone-900 focus:ring-0 outline-none"
                    type="tel"
                    placeholder="9876543210"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, "phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Contact Button */}
        <button
          onClick={addContact}
          className="w-full py-4 rounded-xl border-2 border-dashed border-primary/30 text-primary font-manrope font-bold flex items-center justify-center gap-2 hover:bg-primary-container/10 transition-colors active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Contact
        </button>
      </div>

      {/* Informational Card */}
      <div className="p-4 bg-secondary-container/30 rounded-xl border border-secondary-container flex gap-3">
        <span className="material-symbols-outlined text-on-secondary-container">verified_user</span>
        <p className="text-sm font-inter text-on-secondary-container">
          These contacts will receive your location and SOS alerts if you trigger an emergency event.
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-stack-md space-y-4">
        <button
          onClick={onContinue}
          disabled={isLoading || !isComplete}
          className="w-full h-14 bg-gradient-to-r from-primary-container to-inverse-primary text-on-primary-container font-manrope font-bold rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? "Saving Contacts..." : "Continue to Final Step"}
          {!isLoading && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
        <button
          onClick={onContinue}
          className="w-full h-14 text-on-surface-variant font-manrope font-semibold rounded-full hover:bg-stone-100 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};
