import { useState } from 'react';
import { 
  Package, MapPin, LogOut, ChevronRight, 
  Truck, CheckCircle, Clock, X, Info, Plus, Pencil, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products, formatPrice } from '@/data/products';
import { Link } from 'react-router-dom';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // 1. Mock User State - Removed Name, keeping only Email & Initials
  const [user] = useState({
    email: "surya.k@example.com",
    initials: "S"
  });

  // 2. Enhanced Mock Orders
  const orders = [
    { 
      id: '#ORD-7721', 
      date: 'Oct 24, 2025, 02:30 PM', 
      status: 'Delivered', 
      payment_status: 'Paid',
      total: 1499, 
      first_name: 'Surya',
      last_name: 'K.',
      shipping_address: 'Flat 402, Lake View Towers',
      landmark: 'Near Safari Nagar',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      zip_code: '500084',
      phone: '+91 98765 43210',
      tracking_link: '#',
      items: [
        { productId: 'MON-001', name: 'Monstera Deliciosa', size: 'Medium', color: 'Terracotta', price: 1499, qty: 1 }
      ]
    },
    { 
      id: '#ORD-7650', 
      date: 'Sep 12, 2025, 10:15 AM', 
      status: 'Processing', 
      payment_status: 'Paid',
      total: 1798, 
      first_name: 'Surya',
      last_name: 'K.',
      shipping_address: 'Satoru Foundation, Hitech City',
      landmark: '',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      zip_code: '500081',
      phone: '+91 98765 43210',
      tracking_link: '',
      items: [
        { productId: 'SNK-002', name: 'Snake Plant', size: 'Small', color: 'White', price: 599, qty: 1 },
        { productId: 'ZZ-005', name: 'ZZ Plant', size: 'Medium', color: 'Black', price: 1199, qty: 1 }
      ] 
    },
  ];

  // 3. Mock Addresses
  const addresses = [
    { id: 1, label: 'Home', is_default: true, first_name: 'Surya', last_name: 'K.', address: 'Flat 402, Lake View Towers', city: 'Hyderabad', state: 'Telangana', zip_code: '500084', phone: '+91 98765 43210' },
    { id: 2, label: 'Office', is_default: false, first_name: 'Surya', last_name: 'K.', address: 'Satoru Foundation, Hitech City', city: 'Hyderabad', state: 'Telangana', zip_code: '500081', phone: '+91 98765 43210' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Delivered': return { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-primary bg-primary/10 border-primary/20' };
      case 'Shipped': return { icon: <Truck className="w-3.5 h-3.5" />, color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 'Processing': return { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-[#BFA275] bg-[#BFA275]/10 border-[#BFA275]/20' };
      default: return { icon: <Package className="w-3.5 h-3.5" />, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-tight text-gray-900">Order History</h2>
            </div>
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all bg-white">
                  
                  {/* Order Header */}
                  <div className="bg-[#F8F7F4] p-5 md:p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
                    <div className="flex gap-8 md:gap-12 text-left">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID & Date</p>
                        <p className="text-sm font-black text-gray-900">{order.id}</p>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-sm font-black text-gray-900">{formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Payment</p>
                        <p className={`text-[11px] font-black uppercase tracking-wider ${order.payment_status === 'Paid' ? 'text-primary' : 'text-red-500'}`}>
                          {order.payment_status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border ${getStatusConfig(order.status).color}`}>
                        {getStatusConfig(order.status).icon}
                        <span className="text-[10px] font-black uppercase tracking-wider">{order.status}</span>
                      </div>
                      {order.tracking_link && order.status !== 'Cancelled' && (
                        <a href={order.tracking_link} className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm">
                          <Truck size={14} /> Track
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 md:p-6 space-y-6">
                    {order.items.map((item, idx) => {
                      const productData = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex gap-5 items-center">
                          <div className="w-20 h-24 bg-[#F8F7F4] rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                            {productData?.image ? (
                              <img src={productData.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <Link to={`/product/${productData?.slug || '#'}`} className="text-base font-black text-gray-900 uppercase tracking-wide hover:text-primary transition-colors">
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{item.size} | {item.color}</p>
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Qty: {item.qty}</p>
                          </div>
                          <p className="font-black text-base text-gray-900">{formatPrice(item.price)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer / Shipping Details */}
                  <div className="px-5 md:px-6 pb-6">
                    <button 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} 
                      className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      {expandedOrderId === order.id ? <X size={14}/> : <Info size={14}/>} 
                      {expandedOrderId === order.id ? "Hide Details" : "View Shipping Address"}
                    </button>
                    
                    {expandedOrderId === order.id && (
                      <div className="mt-4 p-5 bg-[#F8F7F4] rounded-2xl border border-gray-200/60 animate-in slide-in-from-top-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Shipping To:</p>
                        <p className="text-sm font-black uppercase text-gray-900">{order.first_name} {order.last_name}</p>
                        <p className="text-xs font-bold uppercase mt-1.5 text-gray-700">{order.shipping_address}</p>
                        <p className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-wide">
                          {order.landmark && `${order.landmark}, `}{order.city}, {order.state}, {order.country} - {order.zip_code}
                        </p>
                        <p className="text-[11px] font-black mt-3 uppercase tracking-widest text-gray-700">Contact: {order.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-8 text-left">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <h2 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-tight text-gray-900">Saved Addresses</h2>
              {!showAddForm && (
                <Button 
                  onClick={() => setShowAddForm(true)} 
                  className="bg-primary hover:opacity-90 text-white text-[11px] font-bold uppercase h-10 rounded-full px-6 tracking-widest shadow-sm transition-opacity"
                >
                  <Plus size={16} className="mr-2" /> Add New
                </Button>
              )}
            </div>

            {showAddForm ? (
              <form className="space-y-5 bg-[#F8F7F4] p-6 md:p-8 rounded-[2rem] border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Address Label</label>
                    <input placeholder="e.g. Home, Office" className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">First Name</label>
                    <input className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
                    <input className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Street Address</label>
                    <input className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">City</label>
                    <input className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Pincode</label>
                    <input className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-900" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" onClick={() => setShowAddForm(false)} className="bg-primary hover:opacity-90 text-white px-8 rounded-full text-[11px] font-bold uppercase tracking-widest h-12 shadow-md transition-opacity">
                    Save Address
                  </Button>
                  <Button type="button" onClick={() => setShowAddForm(false)} variant="outline" className="px-8 rounded-full text-[11px] font-bold uppercase tracking-widest h-12 border-gray-200 hover:bg-gray-100">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-5">
                {addresses.map(addr => (
                  <div key={addr.id} className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${addr.is_default ? 'border-primary bg-[#F8F7F4] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 transition-colors'}`}>
                    <div>
                      <p className="font-black text-[11px] uppercase text-gray-400 mb-3 tracking-widest flex items-center gap-2">
                        {addr.label} {addr.is_default && <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-[9px]">Default</span>}
                      </p>
                      <p className="text-base font-black uppercase text-gray-900 tracking-wide">{addr.first_name} {addr.last_name}</p>
                      <p className="text-xs text-gray-600 mt-2 uppercase font-bold leading-relaxed max-w-md">{addr.address}, {addr.city}, {addr.state} - {addr.zip_code}</p>
                      <p className="text-[11px] font-black text-gray-500 mt-4 flex items-center gap-1.5 tracking-widest">
                        <Clock size={14}/> {addr.phone}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <button className="p-3.5 hover:bg-white rounded-full bg-gray-50 border border-gray-200 transition-colors shadow-sm text-primary"><Pencil size={18} /></button>
                      <button className="p-3.5 hover:bg-red-50 rounded-full bg-gray-50 border border-gray-200 transition-colors shadow-sm text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default: 
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F4] pt-[120px] pb-20"> 
      <div className="container-custom max-w-6xl">
        
        {/* ADDED items-start to prevent sidebar from stretching vertically */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR - Fixed to top on scroll using sticky and h-max */}
          <aside className="w-full lg:w-[320px] space-y-4 flex-shrink-0 lg:sticky lg:top-32 self-start h-max">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left">
                
                {/* Avatar Section - Removed name, keeping just the email */}
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-sm flex-shrink-0 uppercase">
                        {user.initials}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-gray-900 truncate">{user.email}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('orders')} 
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'
                      }`}
                    >
                        <span className="flex items-center gap-3"><Package size={18} className={activeTab === 'orders' ? 'text-white' : ''} /> My Orders</span>
                        <ChevronRight size={16} className={activeTab === 'orders' ? 'opacity-100' : 'opacity-0'} />
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('addresses')} 
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'addresses' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'
                      }`}
                    >
                        <span className="flex items-center gap-3"><MapPin size={18} className={activeTab === 'addresses' ? 'text-white' : ''} /> Addresses</span>
                        <ChevronRight size={16} className={activeTab === 'addresses' ? 'opacity-100' : 'opacity-0'} />
                    </button>

                    <button 
                      className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all mt-4"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[600px] w-full">
            {renderContent()}
          </div>
          
        </div>
      </div>
    </div>
  );
}