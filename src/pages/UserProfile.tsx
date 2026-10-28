// src/pages/UserProfile.tsx
// Complete user profile page for Rastlina.
// Tabs: My Orders | Addresses | The person behind the plants
// Order history uses the full-featured OrderHistory component.
// Preserves existing sidebar design from the uploaded UserProfile.tsx.

import { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, LogOut, ArrowUpRight, Leaf, User as UserIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService, orderService } from '@/services/api';
import { toast } from 'sonner';

import AddressManager from '@/components/profile/AdressManager';
import OrderHistory from '@/components/profile/OrderHistory';
import ProfileDetails from '@/components/profile/ProfileDetails';
import './account-premium.css';

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
  if (!authUser) {
    navigate('/login', {
      state: {
        redirectTo: '/profile?tab=orders',
      },
    });
  }
}, [authUser, navigate]);

  // ── Switch tab + sync URL ──────────────────────────────────────────────────
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab === 'orders') {
      setCurrentPage(1);
      if (activeTab === 'orders') void loadOrders(1);
    }
  };

  useEffect(() => {
    const next = searchParams.get('tab');
    setActiveTab(next === 'addresses' || next === 'details' ? next : 'orders');
  }, [searchParams]);

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
  if (!authUser) return;

  if (activeTab === 'orders') {
    loadOrders(currentPage);
  }

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, authUser]);

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
      throw new Error('Profile update failed');
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
          <div className="account-panel">
            <div className="account-panel-heading">
              <h2 className="account-section-title">
                Your orders
              </h2>
              <p className="account-section-note">
                Track your deliveries, revisit your favourites, and bring home more green.
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
          <div className="account-panel">
            <div className="account-panel-heading">
              <h2 className="account-section-title">
                A place to grow
              </h2>
              <p className="account-section-note">
                Keep your delivery details ready for your next green arrival.
              </p>
            </div>
            <AddressManager />
          </div>
        );

      case 'details':
        return (
          <div className="account-panel">
            <div className="account-panel-heading">
              <h2 className="account-section-title">
                The person behind the plants
              </h2>
              <p className="account-section-note">
                A few details to make every Rastlina visit feel like home.
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

  return (
    <div className="account-page">
      <div className="account-container">
        <header className="account-welcome">
          <div className="account-welcome-copy">
            <span className="account-eyebrow"><Leaf size={14} aria-hidden="true" /> YOUR RASTLINA</span>
            <h1>A little green.<br /><em>A space of your own.</em></h1>
            <p>Welcome back, {authUser.first_name || 'plant lover'}. Make yourself at home.</p>
          </div>
          <a className="account-shop-link" href="/shop">Find your next favourite <ArrowUpRight size={18} /></a>
          <Leaf className="account-hero-leaf" strokeWidth={0.7} aria-hidden="true" />
        </header>

        <div className="account-layout">
          <aside className="account-sidebar" aria-label="Your account">
            <div className="account-member">
              <span className="account-avatar" aria-hidden="true">{(authUser.first_name?.charAt(0) || authUser.email?.charAt(0) || '?').toUpperCase()}</span>
              <div><p>{authUser.first_name || 'Rastlina member'}</p><span>Your little corner of green</span></div>
            </div>
            <nav className="account-nav" aria-label="Account navigation">
              {([
                { id: 'orders', label: 'My orders', icon: Package },
                { id: 'addresses', label: 'Addresses', icon: MapPin },
                { id: 'details', label: 'My profile', icon: UserIcon },
              ] as const).map(item => (
                <button key={item.id} type="button" aria-current={activeTab === item.id ? 'page' : undefined}
                  onClick={() => switchTab(item.id)}>
                  <item.icon size={18} aria-hidden="true" /><span>{item.label}</span>
                </button>
              ))}
            </nav>
            <button type="button" onClick={handleLogout} className="account-logout"><LogOut size={16} /> Sign out</button>
          </aside>
          <main className="account-main" id="account-content">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
