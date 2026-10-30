import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Layers,
  Image as ImageIcon,
  QrCode,
  Radio,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoDark from '../../assets/logo-dark.svg';

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security enforcement: only ADMIN role can view the admin console
  if (!isAdmin) {
    return (
      <div className="pt-32 pb-24 bg-[#09090b] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-10 rounded-3xl border border-rose-900/50 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-700 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Administrative Access Restricted</h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            You do not possess the required administrator authorization credentials for this portal.
          </p>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider inline-block"
          >
            Log In as Administrator
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Bookings Management', path: '/admin/bookings', icon: <CalendarCheck className="w-4 h-4" /> },
    { name: 'Event Calendar', path: '/admin/calendar', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Live Event & QR Code', path: '/admin/live', icon: <Radio className="w-4 h-4 text-[#D4AF37]" />, highlight: true },
    { name: 'Gallery & Media', path: '/admin/galleries', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'Packages & Pricing', path: '/admin/packages', icon: <Layers className="w-4 h-4" /> },
    { name: 'Contact Inquiries', path: '/admin/enquiries', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-200 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c0c10] border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoDark} alt="5Star" className="h-10 w-auto" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Badge */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-[#171510] border border-[#D4AF37]/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient text-black flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white truncate block">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">
                Full Studio Access
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-gold-gradient text-black font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                      : item.highlight
                      ? 'text-[#F5E6C8] hover:bg-zinc-900 border border-[#D4AF37]/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800/80 space-y-2">
          <Link
            to="/live"
            target="_blank"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
          >
            <span className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#D4AF37]" /> Public Live QR Page
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" /> End Admin Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header Mobile Toggle */}
        <header className="lg:hidden bg-[#0c0c10] border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zinc-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img src={logoDark} alt="5Star" className="h-8" />
          <div className="w-6"></div>
        </header>

        {/* Admin Router View Outlet */}
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
