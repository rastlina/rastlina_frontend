import { useState, useEffect } from 'react';
import { 
  Package, MapPin, LogOut, ChevronRight, User as UserIcon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService, orderService } from '@/services/api';
import { toast } from 'sonner';

// Import the dedicated components we created[cite: 28, 29, 30]
import AddressManager from '@/components/profile/AdressManager';
import OrderHistory from '@/components/profile/OrderHistory';
import ProfileDetails from '@/components/profile/ProfileDetails';

export default function UserProfile() {
  const { logout, user: authUser, refreshUser } = useAuth(); 
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'details'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load orders only once for the OrderHistory component[cite: 29]
  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await orderService.getUserOrders(1);
        setOrders(data.results || []);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleUpdateProfile = async (formData: any) => {
    setUpdating(true);
    try {
      await authService.updateProfile(formData);
      await refreshUser(); // Update global auth state
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-serif font-bold uppercase tracking-tight text-gray-900">Order History</h2>
            </div>
            {loading ? (
              <div className="flex justify-center py-20 font-bold uppercase tracking-[0.2em] text-gray-400 text-xs">Loading Orders...</div>
            ) : (
              <OrderHistory orders={orders} /> // Use the dedicated OrderHistory[cite: 29]
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-8 text-left">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-serif font-bold uppercase tracking-tight text-gray-900">Saved Addresses</h2>
            </div>
            {/* AddressManager handles its own data fetching and state */}
            <AddressManager />
          </div>
        );

      case 'details':
        return (
          <div className="space-y-8 text-left">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-serif font-bold uppercase tracking-tight text-gray-900">Account Details</h2>
            </div>
            <ProfileDetails 
              user={authUser} 
              onSave={handleUpdateProfile} 
              loading={updating} 
            /> // Use the dedicated ProfileDetails
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pt-[140px] pb-24"> 
      <div className="container-custom max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[300px] space-y-4 flex-shrink-0 lg:sticky lg:top-40 self-start">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl uppercase mb-4 shadow-lg shadow-primary/20">
                        {authUser?.first_name?.charAt(0) || authUser?.email?.charAt(0)}
                    </div>
                    <p className="font-black text-xs text-gray-900 uppercase tracking-widest truncate max-w-full">
                      {authUser?.first_name || 'Member'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 truncate max-w-full">{authUser?.email}</p>
                </div>

                <nav className="space-y-1.5">
                    {[
                      { id: 'orders', label: 'My Orders', icon: Package },
                      { id: 'addresses', label: 'Addresses', icon: MapPin },
                      { id: 'details', label: 'Account', icon: UserIcon },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)} 
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                          activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/10' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-3"><item.icon size={16} /> {item.label}</span>
                        <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    ))}
                    
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-red-400 hover:bg-red-50 rounded-2xl mt-6 transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                </nav>
            </div>
          </aside>

          {/* Main Display */}
          <main className="flex-1 bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm min-h-[650px] w-full">
            {renderContent()}
          </main>
          
        </div>
      </div>
    </div>
  );
}