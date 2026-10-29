import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MessageSquare
} from 'lucide-react';
import { bookingApi, formatINR } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const statusOptions = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];
const eventTypeOptions = ['All', 'Wedding', 'Reception', 'Engagement', 'Pre-Wedding', 'Birthday', 'Baby Shower', 'Puberty Ceremony', 'Corporate Event', 'Other'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected booking modal state
  const [activeBooking, setActiveBooking] = useState(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [updating, setUpdating] = useState(false);

  const { success, error } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getAllBookings({
        search,
        status: statusFilter,
        eventType: eventTypeFilter,
        page,
        limit: 15
      });
      if (res.data?.success) {
        setBookings(res.data.bookings);
        setTotalPages(res.data.pages || 1);
        setTotalRecords(res.data.total || 0);
      }
    } catch (err) {
      error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, eventTypeFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await bookingApi.updateStatus(bookingId, { status: newStatus });
      if (res.data?.success) {
        success(`Booking status changed to ${newStatus}. Customer notification dispatched.`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, bookingStatus: newStatus } : b))
        );
        if (activeBooking && activeBooking._id === bookingId) {
          setActiveBooking({ ...activeBooking, bookingStatus: newStatus });
        }
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!activeBooking) return;
    setUpdating(true);
    try {
      const res = await bookingApi.updateNotes(activeBooking._id, { adminNotes: adminNotesText });
      if (res.data?.success) {
        success('Internal administrative notes saved.');
        setActiveBooking({ ...activeBooking, adminNotes: adminNotesText });
        setBookings((prev) =>
          prev.map((b) => (b._id === activeBooking._id ? { ...b, adminNotes: adminNotesText } : b))
        );
        setEditingNotes(false);
      }
    } catch (err) {
      error('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Bookings &amp; Event Scheduling
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search, manage statuses, and record internal production notes for all event inquiries ({totalRecords} records).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, client, phone, venue..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Category:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
            >
              {eventTypeOptions.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-24 text-zinc-500 text-sm">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 text-sm">No bookings matched your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121217] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Client Contact</th>
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Package</th>
                  <th className="p-4">Quoted Price</th>
                  <th className="p-4">Status &amp; Action</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {bookings.map((b) => {
                  const eventDateStr = new Date(b.eventDetails.eventDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={b._id} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Ref */}
                      <td className="p-4 font-mono font-bold text-[#F5E6C8]">
                        {b.bookingReference}
                      </td>

                      {/* Client */}
                      <td className="p-4">
                        <strong className="text-white block">{b.customerDetails?.fullName}</strong>
                        <span className="text-zinc-400 block">{b.customerDetails?.primaryMobile}</span>
                        <span className="text-[11px] text-zinc-500 block truncate max-w-[160px]">
                          {b.customerDetails?.email}
                        </span>
                      </td>

                      {/* Event */}
                      <td className="p-4">
                        <span className="font-semibold text-zinc-200 block">
                          {b.eventDetails?.eventType}
                        </span>
                        <span className="text-zinc-400 block">{eventDateStr} • {b.eventDetails?.startTime}</span>
                        <span className="text-[11px] text-zinc-500 block truncate max-w-[160px]">
                          {b.eventDetails?.venueName}
                        </span>
                      </td>

                      {/* Package */}
                      <td className="p-4 text-zinc-300">
                        {b.packageSnapshot?.name}
                      </td>

                      {/* Price */}
                      <td className="p-4 font-semibold text-white">
                        {formatINR(b.totalQuotedPrice)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={b.bookingStatus}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border focus:outline-none cursor-pointer ${
                            b.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                              : b.bookingStatus === 'Pending'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                              : b.bookingStatus === 'In Progress'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-600'
                              : b.bookingStatus === 'Completed'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-600'
                              : 'bg-rose-950/80 text-rose-300 border-rose-600'
                          }`}
                        >
                          {statusOptions
                            .filter((s) => s !== 'All')
                            .map((st) => (
                              <option key={st} value={st} className="bg-zinc-900 text-white">
                                {st}
                              </option>
                            ))}
                        </select>
                      </td>

                      {/* Inspect Action */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setActiveBooking(b);
                            setAdminNotesText(b.adminNotes || '');
                            setEditingNotes(false);
                          }}
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                          title="View Full Booking Itinerary"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-zinc-800 disabled:opacity-40 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-zinc-800 disabled:opacity-40 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Booking Itinerary & Notes Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveBooking(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold text-[#F5E6C8] px-3 py-1 rounded bg-zinc-900 border border-zinc-700">
                {activeBooking.bookingReference}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700 text-white">
                {activeBooking.bookingStatus}
              </span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-6">
              {activeBooking.eventDetails.eventType} Production Details
            </h2>

            <div className="space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Client Full Name</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.customerDetails.fullName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Primary Mobile</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.customerDetails.primaryMobile}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Email</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.customerDetails.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Address</span>
                  <span className="text-zinc-200 font-semibold">
                    {activeBooking.customerDetails.fullAddress}, {activeBooking.customerDetails.city}, {activeBooking.customerDetails.state} - {activeBooking.customerDetails.postalCode}
                  </span>
                </div>
              </div>

              {/* Event Schedule Box */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Event Date</span>
                  <span className="text-zinc-200 font-semibold">
                    {new Date(activeBooking.eventDetails.eventDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Timings</span>
                  <span className="text-zinc-200 font-semibold">
                    {activeBooking.eventDetails.startTime} {activeBooking.eventDetails.endTime ? `- ${activeBooking.eventDetails.endTime}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Venue Name</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.eventDetails.venueName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Venue Address</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.eventDetails.fullAddress}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Expected Guests</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.eventDetails.expectedGuests || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Preferred Contact</span>
                  <span className="text-zinc-200 font-semibold">{activeBooking.eventDetails.preferredContact}</span>
                </div>
                {activeBooking.eventDetails.specialRequirements && (
                  <div className="col-span-2 pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 block mb-0.5">Client Special Requests / Notes</span>
                    <p className="text-zinc-300 italic">{activeBooking.eventDetails.specialRequirements}</p>
                  </div>
                )}
              </div>

              {/* Package & Quotation */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-1">Package &amp; Financials</span>
                <span className="text-base font-bold text-[#F5E6C8]">
                  {activeBooking.packageSnapshot?.name} — {formatINR(activeBooking.totalQuotedPrice)}
                </span>
                {activeBooking.additionalServices && activeBooking.additionalServices.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400 block mb-1">Selected Add-ons:</span>
                    <ul className="list-disc list-inside text-zinc-300">
                      {activeBooking.additionalServices.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Private Admin Production Notes */}
              <div className="p-4 rounded-xl bg-[#171510] border border-[#D4AF37]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Internal Production Notes (Hidden from Client)
                  </span>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Notes
                    </button>
                  )}
                </div>

                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. Lead cinematographer: Rajesh. Dual Sony A7IV assigned. Drone aerial clearance confirmed with venue manager."
                    ></textarea>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingNotes(false)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={updating}
                        className="px-4 py-1.5 rounded-lg bg-gold-gradient text-black font-bold text-xs uppercase"
                      >
                        {updating ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-300 italic">
                    {activeBooking.adminNotes || 'No internal notes recorded yet for this booking.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
