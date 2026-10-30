import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Users,
  Layers,
  Image as ImageIcon,
  Radio,
  ArrowRight,
  PlusCircle,
  QrCode,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { bookingApi, formatINR } from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await bookingApi.getStats();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-zinc-400 text-sm">Loading studio statistics...</div>;
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const upcomingEvents = data?.upcomingEvents || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Studio Command Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time analytics for bookings, live distribution, packages, and gallery collections.
          </p>
        </div>

        {/* Live Event Status Banner Button */}
        {stats.hasActiveLiveEvent ? (
          <Link
            to="/admin/live"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-wider animate-pulse"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            Live Event Active: {stats.activeLiveEventName}
          </Link>
        ) : (
          <Link
            to="/admin/live"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#D4AF37] text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <Radio className="w-4 h-4 text-zinc-400" />
            No Live Event Active • Start Now
          </Link>
        )}
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Total Inquiries</span>
            <CalendarCheck className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
            {stats.totalBookings || 0}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">All recorded events</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-extrabold text-amber-300">
            {stats.pendingBookings || 0}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">Awaiting confirmation</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-extrabold text-emerald-300">
            {stats.confirmedBookings || 0}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">Scheduled ceremonies</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-semibold">Customers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
            {stats.registeredCustomers || 0}
          </span>
          <span className="text-[11px] text-zinc-500 block mt-1">Registered accounts</span>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl font-bold text-zinc-200">{stats.completedEvents || 0} Events</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase font-semibold">Packages</span>
            <Layers className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="text-xl font-bold text-zinc-200">{stats.activePackages || 0} Active</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase font-semibold">Galleries</span>
            <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="text-xl font-bold text-zinc-200">{stats.galleryFolders || 0} Folders</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs uppercase font-semibold">Database Storage</span>
            <span className="text-[10px] font-mono text-[#D4AF37]">GridFS Atlas</span>
          </div>
          <span className="text-xl font-bold text-zinc-200">MongoDB Atlas</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="glass-card-gold p-6 rounded-2xl border border-[#D4AF37]/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-white text-base">Rapid Studio Actions</h3>
          <p className="text-xs text-zinc-300">Launch live event distribution, add new package, or inspect schedule.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/live"
            className="px-4 py-2 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
          >
            <Radio className="w-3.5 h-3.5" /> Live Photo Event
          </Link>
          <Link
            to="/admin/packages"
            className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 font-semibold text-xs uppercase tracking-wider hover:border-[#D4AF37] flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Manage Packages
          </Link>
          <Link
            to="/admin/galleries"
            className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 font-semibold text-xs uppercase tracking-wider hover:border-[#D4AF37] flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Upload Media
          </Link>
        </div>
      </div>

      {/* Split Section: Recent Inquiries & Upcoming Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries Table (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-zinc-800">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="font-serif font-bold text-white text-lg">Recent Booking Inquiries</h2>
              <span className="text-xs text-zinc-400">Latest customer submissions from website</span>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-zinc-500 text-xs py-8 text-center">No recent bookings recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 uppercase border-b border-zinc-800/80 pb-2">
                    <th className="pb-3 font-semibold">Ref Code</th>
                    <th className="pb-3 font-semibold">Client Name</th>
                    <th className="pb-3 font-semibold">Event</th>
                    <th className="pb-3 font-semibold">Quoted Price</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {recentBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-[#F5E6C8]">
                        {b.bookingReference}
                      </td>
                      <td className="py-3 text-zinc-200 font-medium">
                        {b.customerDetails?.fullName}
                      </td>
                      <td className="py-3 text-zinc-400">
                        {b.eventDetails?.eventType}
                      </td>
                      <td className="py-3 font-semibold text-zinc-200">
                        {formatINR(b.totalQuotedPrice)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : b.bookingStatus === 'Pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Events Schedule (1 col) */}
        <div className="glass-card p-6 rounded-3xl border border-zinc-800">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="font-serif font-bold text-white text-lg">Upcoming Schedule</h2>
              <span className="text-xs text-zinc-400">Next scheduled events</span>
            </div>
            <Link
              to="/admin/calendar"
              className="text-xs text-[#D4AF37] font-semibold hover:underline"
            >
              Calendar
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-zinc-500 text-xs py-8 text-center">No upcoming events scheduled.</p>
          ) : (
            <div className="space-y-3.5">
              {upcomingEvents.map((ev) => {
                const dateStr = new Date(ev.eventDetails?.eventDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={ev._id}
                    className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1c1811] border border-[#D4AF37]/30 flex flex-col items-center justify-center text-[#D4AF37] shrink-0 font-bold text-xs leading-none">
                        <span>{dateStr.split(' ')[0]}</span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{dateStr.split(' ')[1]}</span>
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white truncate block">
                          {ev.customerDetails?.fullName}
                        </span>
                        <span className="text-[11px] text-zinc-400 truncate block">
                          {ev.eventDetails?.eventType}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {ev.bookingStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
