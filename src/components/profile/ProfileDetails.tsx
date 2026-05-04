import { useState } from "react";

interface ProfileDetailsProps {
  user: any;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
}

export default function ProfileDetails({ user, onSave, loading }: ProfileDetailsProps) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  return (
    <div className="bg-card rounded-2xl border border-border/30 p-6 space-y-6">
      <h2 className="font-display font-bold text-lg text-foreground text-left">Personal Information</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {[
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'phone', label: 'Phone Number' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
              {label}
            </label>
            <input
              value={(form as any)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              /* Set border-black for consistency with Address Manager */
              className="w-full border border-black rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        ))}
        
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input 
            value={user?.email} 
            disabled 
            className="w-full border border-border/20 rounded-xl px-4 py-2.5 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed" 
          />
        </div>
      </div>

      <div className="flex justify-start">
        <button 
          onClick={() => onSave(form)} 
          disabled={loading}
          /* Changed from gradient-primary to solid black bg-black for visibility */
          className="bg-black text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-60 hover:bg-gray-800 transition-all shadow-lg"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}