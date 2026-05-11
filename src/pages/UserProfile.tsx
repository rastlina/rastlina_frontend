// src/pages/UserProfile.tsx
// Complete user profile page for Rastlina.
// Tabs: My Orders | Addresses | Account Details
// Order history uses the full-featured OrderHistory component.
// Preserves existing sidebar design from the uploaded UserProfile.tsx.

import { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, LogOut, ChevronRight, User as UserIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService, orderService } from '@/services/api';
import { toast } from 'sonner';

import AddressManager from '@/components/profile/AdressManager';
import OrderHistory from '@/components/profile/OrderHistory';
import ProfileDetails from '@/components/profile/ProfileDetails';

type Tab = 'orders' | 'addresses' | 'details';

export default function UserProfile() {
  const { logout, user: authUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read tab from URL query param so /profile?tab=orders works (used after checkout)
  const tabParam = searchParams.get('tab') as Tab;
  const validTabs: Tab[] = ['orders', 'addresses', 'details'];
  const [activeTab, setActiveTab] = useState<Tab>(
    validTabs.includes(tabParam) ? tabParam : 'orders'
  );

  // Order state — managed here and passed down to OrderHistory
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Profile update state
  const [updating, setUpdating] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) navigate('/login');
  }, [authUser, navigate]);

  // ── Switch tab + sync URL ──────────────────────────────────────────────────
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab === 'orders') loadOrders(1);
  };

  // ── Load orders ────────────────────────────────────────────────────────────
  const loadOrders = useCallback(async (page: number) => {
    setOrdersLoading(true);
    try {
      const data = await orderService.getUserOrders(page);
      if (data.results) {
        setOrders(data.results);
        setTotalOrders(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 5));
        setCurrentPage(page);
      } else {
        // Non-paginated fallback
        const arr = Array.isArray(data) ? data : [];
        setOrders(arr);
        setTotalOrders(arr.length);
        setTotalPages(1);
      }
    } catch {
      toast.error('Failed to load orders. Please refresh.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load orders on mount and when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') loadOrders(currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    loadOrders(page);
  };

  // ── Profile update ─────────────────────────────────────────────────────────
  const handleUpdateProfile = async (formData: { first_name: string; last_name: string; phone: string }) => {
    setUpdating(true);
    try {
      await authService.updateProfile(formData);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (!authUser) return null;

  // ── Tab content renderer ───────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-serif font-extrabold text-gray-900 uppercase tracking-tight">
                Order History
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                All your Rastlina orders in one place
              </p>
            </div>
            <OrderHistory
              orders={orders}
              loading={ordersLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalOrders={totalOrders}
              onPageChange={handlePageChange}
              onRefresh={() => loadOrders(currentPage)}
            />
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-serif font-extrabold text-gray-900 uppercase tracking-tight">
                Saved Addresses
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage your delivery addresses
              </p>
            </div>
            <AddressManager />
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-serif font-extrabold text-gray-900 uppercase tracking-tight">
                Account Details
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Update your personal information
              </p>
            </div>
            <ProfileDetails
              user={authUser}
              onSave={handleUpdateProfile}
              loading={updating}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pt-[140px] pb-24">
      <div className="container-custom max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-40 self-start">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">

              {/* Avatar + user info */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#1A3831] text-white flex items-center justify-center font-extrabold text-2xl uppercase mb-4 shadow-lg shadow-[#1A3831]/20">
                  {(authUser.first_name?.charAt(0) || authUser.email?.charAt(0) || '?').toUpperCase()}
                </div>
                <p className="font-extrabold text-sm text-gray-900 uppercase tracking-widest truncate max-w-full">
                  {authUser.first_name || 'Member'}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-full">
                  {authUser.email}
                </p>
              </div>

              {/* Nav */}
              <nav className="space-y-1.5">
                {([
                  { id: 'orders',    label: 'My Orders',  icon: Package,  badge: totalOrders > 0 ? totalOrders : null },
                  { id: 'addresses', label: 'Addresses',  icon: MapPin,   badge: null },
                  { id: 'details',   label: 'Account',    icon: UserIcon, badge: null },
                ] as const).map(item => (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={[
                      'w-full flex items-center justify-between px-5 py-4 rounded-2xl',
                      'text-[10px] font-black uppercase tracking-[0.15em] transition-all',
                      activeTab === item.id
                        ? 'bg-black text-white shadow-xl shadow-black/10'
                        : 'bg-transparent text-black hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon
                        size={15}
                        className={activeTab === item.id ? 'text-white' : 'text-black'}
                      />
                      {item.label}
                      {item.badge !== null && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          activeTab === item.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      size={14}
                      className={activeTab === item.id ? 'opacity-100' : 'opacity-0'}
                    />
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-red-500 hover:bg-red-50 rounded-2xl mt-6 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm min-h-[650px] w-full">
            {renderContent()}
          </main>

        </div>
      </div>
    </div>
  );
}