import { useState, useEffect } from "react";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Star, Edit2, Check } from "lucide-react";


interface Address {
  id: number;
  label: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  landmark: string;
  is_default: boolean;
}


const emptyForm = {
  label: 'Home',
  first_name: '',
  last_name: '',
  address: '',
  apartment: '',
  city: '',
  state: 'Telangana',
  zip_code: '',
  country: 'India',
  phone: '',
  landmark: '',
};


// Validation regex patterns
const phoneRegex = /^[0-9]{10}$/; // Exactly 10 digits
const pincodeRegex = /^[1-9][0-9]{5}$/; // 6 digits, doesn't start with 0


interface Props {
  /** If provided, renders in "select" mode for checkout */
  onSelect?: (addr: Address) => void;
  /** The currently selected address id (checkout mode) */
  selectedId?: number | null;
}


export default function AddressManager({ onSelect, selectedId }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const isCheckoutMode = !!onSelect;


  useEffect(() => { load(); }, []);


  const load = async () => {
    setLoading(true);
    try {
      const data = await authService.getSavedAddresses();
      const list: Address[] = Array.isArray(data) ? data : data.results || [];
      setAddresses(list);
      // Auto-select default in checkout mode
      if (onSelect) {
        const def = list.find(a => a.is_default) || list[0];
        if (def) onSelect(def);
      }
    } catch { setAddresses([]); }
    finally { setLoading(false); }
  };


  useEffect(() => {
    if (!onSelect) return;
    if (addresses.length === 0) return;
    const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
    onSelect(defaultAddr);
  }, [addresses]);


  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };


  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      label: addr.label,
      first_name: addr.first_name,
      last_name: addr.last_name,
      address: addr.address,
      apartment: addr.apartment,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
      country: addr.country,
      phone: addr.phone,
      landmark: addr.landmark,
    });
    setErrors({});
    setShowForm(true);
  };


  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    const cleaned = phone.replace(/\s+/g, ''); // Remove spaces
    return phoneRegex.test(cleaned);
  };


  // Validate pincode
  const validatePincode = (pincode: string): boolean => {
    if (!pincode) return false;
    const cleaned = pincode.replace(/\s+/g, ''); // Remove spaces
    return pincodeRegex.test(cleaned);
  };


  // Handle phone input - only allow digits
  const handlePhoneChange = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setForm(f => ({ ...f, phone: limited }));
    // Clear error if valid
    if (limited && validatePhone(limited)) {
      setErrors(e => { const newErrors = { ...e }; delete newErrors.phone; return newErrors; });
    }
  };


  // Handle pincode input - only allow digits
  const handlePincodeChange = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 6 digits
    const limited = cleaned.slice(0, 6);
    setForm(f => ({ ...f, zip_code: limited }));
    // Clear error if valid
    if (limited && validatePincode(limited)) {
      setErrors(e => { const newErrors = { ...e }; delete newErrors.zip_code; return newErrors; });
    }
  };


  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    // Required field validation
    if (!form.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!form.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!form.zip_code.trim()) {
      newErrors.zip_code = 'PIN code is required';
    } else if (!validatePincode(form.zip_code)) {
      newErrors.zip_code = 'Please enter a valid 6-digit PIN code';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const payload = editing ? { ...form, id: editing.id } : form;
      
      // Clean phone and pincode before sending
      payload.phone = payload.phone.replace(/\s+/g, '');
      payload.zip_code = payload.zip_code.replace(/\s+/g, '');
      
      await authService.saveAddress(payload);
      await load();
      setShowForm(false);
      setErrors({});
      toast.success(editing ? 'Address updated!' : 'Address saved!');
    } catch (err: any) {
      toast.error(err?.non_field_errors?.[0] || 'Failed to save address');
    } finally { 
      setSaving(false); 
    }
  };


  const handleDelete = async (id: number) => {
    try {
      await authService.deleteAddress(id);
      await load();
      toast.success('Address removed');
    } catch { 
      toast.error('Failed to delete'); 
    }
  };


  const handleSetDefault = async (id: number) => {
    try {
      await authService.setDefaultAddress(id);
      await load();
      toast.success('Default address updated');
    } catch { toast.error('Failed to update'); }
  };


  if (loading) {
    return <div className="text-sm text-muted-foreground py-4">Loading addresses...</div>;
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-foreground">
          {isCheckoutMode ? 'Shipping Address' : 'Saved Addresses'}
        </h3>
        {addresses.length < 3 && !showForm && (
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>


      {addresses.length === 0 && !showForm && (
        <div className="text-center py-6 space-y-3">
          <MapPin className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No saved address found</p>
          <button
            onClick={openNew}
            className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            Add Shipping Address
          </button>
        </div>
      )}


      <div className="space-y-3">
        {addresses.map((addr) => {
          const isSelected = isCheckoutMode ? selectedId === addr.id : addr.is_default;
          return (
            <div
              key={addr.id}
              onClick={() => isCheckoutMode && onSelect(addr)}
              className={`relative border rounded-xl p-4 transition-all ${
                isCheckoutMode ? 'cursor-pointer' : ''
              } ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/30 hover:border-border'}`}
            >
              {isCheckoutMode && (
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              )}


              {!isCheckoutMode && addr.is_default && (
                <span className="absolute top-3 right-3 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Default
                </span>
              )}


              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{addr.label}</p>
                  <p className="font-semibold text-sm text-foreground">{addr.first_name} {addr.last_name}</p>
                  <p className="text-sm text-muted-foreground">{addr.address}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — {addr.zip_code}</p>
                  <p className="text-sm text-muted-foreground">📞 {addr.phone}</p>
                </div>
              </div>


              <div className="flex gap-3 mt-3 pl-7">
                <button onClick={(e) => { e.stopPropagation(); openEdit(addr); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (deletingId === addr.id) {
                          handleDelete(addr.id);
                          setDeletingId(null);
                      } else {
                          setDeletingId(addr.id);
                          setTimeout(() => setDeletingId(null), 3000);
                      }
                    }}
                    className={`text-xs font-medium hover:underline flex items-center gap-1 ${deletingId === addr.id ? 'text-destructive font-bold' : 'text-destructive'}`}
                  >
                    <Trash2 className="w-3 h-3" /> {deletingId === addr.id ? 'Confirm?' : 'Delete'}
                </button>
                {!addr.is_default && (
                  <button onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }} className="text-xs text-muted-foreground font-medium hover:underline flex items-center gap-1">
                    <Star className="w-3 h-3" /> Set Default
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {showForm && (
        <div className="border border-border/30 rounded-xl p-5 space-y-4 bg-muted/20">
          <h4 className="font-semibold text-sm text-foreground">{editing ? 'Edit Address' : 'New Address'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'first_name', label: 'First Name *', placeholder: 'e.g. John' },
              { key: 'last_name', label: 'Last Name', placeholder: 'e.g. Doe' },
              { key: 'phone', label: 'Phone *', placeholder: '10-digit mobile number', type: 'tel' },
              { 
                key: 'address', 
                label: 'Street Address *', 
                full: true, 
                placeholder: 'Flat No, Building, Street Name, Area/Sector',
                hint: 'Please include Block, Street, and Area details here.'
              },
              { key: 'city', label: 'City *', placeholder: 'e.g. Hyderabad' },
              { key: 'state', label: 'State *', placeholder: 'e.g. Telangana' },
              { key: 'zip_code', label: 'ZIP Code *', placeholder: '6-digit Pincode', type: 'text' },
            ].map(({ key, label, full, placeholder, hint, type = 'text' }) => (
              <div key={key} className={full ? 'sm:col-span-2' : ''}>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => {
                    if (key === 'phone') {
                      handlePhoneChange(e.target.value);
                    } else if (key === 'zip_code') {
                      handlePincodeChange(e.target.value);
                    } else {
                      setForm(f => ({ ...f, [key]: e.target.value }));
                    }
                  }}
                  placeholder={placeholder}
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-card focus:ring-2 focus:ring-primary outline-none placeholder:text-gray-300 ${
                    errors[key] ? 'border-red-500' : 'border-black'
                  }`}
                />
                {hint && (
                  <span className="text-[10px] text-gray-400 mt-1 block italic">
                    {hint}
                  </span>
                )}
                {errors[key] && (
                  <span className="text-[10px] text-red-500 mt-1 block font-medium">
                    {errors[key]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-black text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-60 hover:bg-gray-800 transition-all shadow-lg"
            >
              {saving ? 'Saving...' : editing ? 'Update Address' : 'Save Address'}
            </button>
            
            <button 
              onClick={() => setShowForm(false)} 
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}