import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
  PlusCircle,
  FileText,
  Lock,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  Eye,
  X,
  Radio,
  QrCode,
  Camera,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingApi, authApi, formatINR } from '../services/api';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400';
    case 'In Progress':
      return 'bg-blue-950/60 border-blue-500/50 text-blue-400';
    case 'Completed':
      return 'bg-purple-950/60 border-purple-500/50 text-purple-300';
    case 'Cancelled':
    case 'Rejected':
      return 'bg-rose-950/60 border-rose-500/50 text-rose-400';
    case 'Pending':
    default:
      return 'bg-amber-950/60 border-amber-500/50 text-amber-300';
  }
};

export default function CustomerDashboard() {
  const { user, logout, updateUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getMyBookings();
        if (res.data?.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error('Fetch bookings error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const payload = { name: profileName, mobile: profileMobile };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.password = newPassword;
      }
      const res = await authApi.updateProfile(payload);
      if (res.data?.success) {
        updateUser(res.data.user);
        success('Profile updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="glass-card-gold p-8 rounded-3xl border border-[#D4AF37]/40 mb-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1c1811] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shrink-0 font-serif font-bold text-2xl">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                Customer Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Welcome, {user?.name || 'Valued Client'}
              </h1>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
                <span>{user?.email}</span>
                <span>•</span>
                <span>{user?.mobile}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/scan"
              className="px-4 py-2.5 rounded-full border border-[#D4AF37]/50 bg-[#1f1b13] text-[#F5E6C8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:border-[#D4AF37] transition-all"
            >
              <QrCode className="w-4 h-4 text-[#D4AF37]" />
              Scan QR Code
            </Link>
            <Link
              to="/book"
              className="px-5 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:opacity-90"
            >
              <PlusCircle className="w-4 h-4" /> Book New Event
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-rose-400 hover:border-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#1f1b13] border border-[#D4AF37] text-[#F5E6C8]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Event Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'profile'
                ? 'bg-[#1f1b13] border border-[#D4AF37] text-[#F5E6C8]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Account &amp; Security Settings
          </button>
          <Link
            to="/scan"
            className="ml-auto px-4 py-2 rounded-xl border border-zinc-800 hover:border-[#D4AF37] text-zinc-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#D4AF37]" /> Open QR Scanner
          </Link>
        </div>

        {/* Tab 1: Bookings List */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-zinc-400 text-sm">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-3xl border border-zinc-800 max-w-lg mx-auto p-10">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-white mb-2">No Bookings Found</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  You haven't scheduled any photography or cinematography events yet. Choose a package to submit your first reservation.
                </p>
                <Link
                  to="/book"
                  className="px-6 py-3 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
                >
                  Schedule Your Event Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const eventDate = new Date(b.eventDetails.eventDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={b._id}
                      className="glass-card p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#F5E6C8] px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                            {b.bookingReference}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(
                              b.bookingStatus
                            )}`}
                          >
                            {b.bookingStatus}
                          </span>
                        </div>

                        <h3 className="text-xl font-serif font-bold text-white">
                          {b.eventDetails.eventType} Celebration
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {eventDate}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {b.eventDetails.startTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                            {b.eventDetails.venueName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800">
                        <div className="text-left md:text-right">
                          <span className="text-lg font-extrabold text-[#F5E6C8] block">
                            {formatINR(b.totalQuotedPrice)}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {b.packageSnapshot?.name || 'Selected Package'}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-4 py-2 rounded-xl border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* Tab 3: Profile Update Form */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-zinc-800">
            <h3 className="text-xl font-serif font-bold text-white mb-2">Update Account Details</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Keep your contact information up to date so our crew can coordinate seamlessly.
            </p>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={profileMobile}
                  onChange={(e) => setProfileMobile(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#D4AF37]" /> Change Account Password (Optional)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="Required only if changing password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-3.5 mt-4 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {updatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold text-[#F5E6C8] px-3 py-1 rounded bg-zinc-900 border border-zinc-700">
                {selectedBooking.bookingReference}
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                  selectedBooking.bookingStatus
                )}`}
              >
                {selectedBooking.bookingStatus}
              </span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-6">
              {selectedBooking.eventDetails.eventType} Itinerary Details
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Event Date</span>
                  <span className="text-zinc-200 font-semibold">
                    {new Date(selectedBooking.eventDetails.eventDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Timing</span>
                  <span className="text-zinc-200 font-semibold">
                    {selectedBooking.eventDetails.startTime} {selectedBooking.eventDetails.endTime ? `- ${selectedBooking.eventDetails.endTime}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Venue</span>
                  <span className="text-zinc-200 font-semibold">{selectedBooking.eventDetails.venueName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Venue Address</span>
                  <span className="text-zinc-200 font-semibold">{selectedBooking.eventDetails.fullAddress}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-1">Selected Package</span>
                <span className="text-base font-bold text-[#F5E6C8]">
                  {selectedBooking.packageSnapshot?.name} — {formatINR(selectedBooking.totalQuotedPrice)}
                </span>
                {selectedBooking.additionalServices && selectedBooking.additionalServices.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400 block mb-1">Add-ons Selected:</span>
                    <ul className="list-disc list-inside text-zinc-300">
                      {selectedBooking.additionalServices.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-1">Contact Coordinator</span>
                <p className="text-zinc-300 leading-relaxed">
                  For date alterations or special equipment requests, please quote your reference number{' '}
                  <strong className="text-[#F5E6C8]">{selectedBooking.bookingReference}</strong> when calling our studio at{' '}
                  <a href="tel:+919876543210" className="text-[#D4AF37] underline">+91 98765 43210</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
