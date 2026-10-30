import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, QrCode, User, ShieldCheck, LogOut, Camera, CalendarCheck } from 'lucide-react';
import logoDark from '../assets/logo-dark.svg';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/packages' },
    { name: 'Portfolio', path: '/gallery' },
    ...(isAdmin ? [{ name: 'Live Event Photos', path: '/live', highlight: true }] : []),
    { name: 'Scan QR', path: '/scan' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl'
          : 'bg-gradient-to-b from-[#09090b]/95 via-[#09090b]/70 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src={logoDark}
              alt="5Star Cinematography"
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center lg:gap-3 xl:gap-5 2xl:gap-6 shrink-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs xl:text-sm tracking-wider uppercase transition-colors relative py-1 whitespace-nowrap ${
                    isActive
                      ? 'text-[#F5E6C8] font-bold'
                      : link.highlight
                      ? 'text-[#D4AF37] hover:text-[#f8e7b9] font-semibold'
                      : 'text-zinc-300 hover:text-[#D4AF37] font-medium'
                  }`}
                >
                  {link.name}
                  {link.highlight && (
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth / Action Buttons */}
          <div className="hidden lg:flex items-center lg:gap-2.5 xl:gap-3 shrink-0">
            <Link
              to="/book"
              className="px-3.5 xl:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-gradient text-black hover:opacity-90 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Book Event
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 shrink-0">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-[#D4AF37]/50 bg-[#1f1b13] text-[#F5E6C8] hover:border-[#D4AF37] transition-all whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-[#D4AF37] transition-all whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {user?.name?.split(' ')[0] || 'Dashboard'}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-zinc-400 hover:text-rose-400 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to="/login"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-[#D4AF37] px-2.5 py-1.5 transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 hover:text-white transition-all whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <Link
              to="/book"
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-gradient text-black"
            >
              Book
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-300 hover:text-[#D4AF37] transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#0e0e12] border-b border-zinc-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-base font-medium py-1 tracking-wider ${
                  location.pathname === link.path ? 'text-[#D4AF37] font-semibold' : 'text-zinc-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="w-full text-center py-2.5 rounded-lg border border-[#D4AF37]/40 bg-[#1c1811] text-[#F5E6C8] font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="w-full text-center py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#D4AF37]" />
                    Customer Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-lg text-rose-400 border border-rose-900/40 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="text-center py-2 rounded-lg border border-zinc-700 text-zinc-200 text-sm font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 rounded-lg bg-gold-gradient text-black text-sm font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
