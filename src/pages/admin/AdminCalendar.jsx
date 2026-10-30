import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  Users
} from 'lucide-react';
import { bookingApi, formatINR } from '../../services/api';

export default function AdminCalendar() {
  const [bookings, setBookings] = useState([]);
  const [conflictDates, setConflictDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await bookingApi.getCalendar();
        if (res.data?.success) {
          setBookings(res.data.bookings || []);
          setConflictDates(res.data.conflictDates || []);
        }
      } catch (err) {
        console.error('Calendar error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month label
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map bookings to date keys (YYYY-MM-DD)
  const bookingsMap = {};
  bookings.forEach((b) => {
    const dKey = new Date(b.eventDetails.eventDate).toISOString().split('T')[0];
    if (!bookingsMap[dKey]) bookingsMap[dKey] = [];
    bookingsMap[dKey].push(b);
  });

  const selectedDateBookings = selectedDate ? bookingsMap[selectedDate] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Production Event Calendar
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visual schedule of reserved wedding ceremonies and automated scheduling conflict warnings.
          </p>
        </div>

        {conflictDates.length > 0 && (
          <div className="px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>{conflictDates.length} Date(s)</strong> have concurrent bookings scheduled!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-zinc-800">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <h2 className="text-xl font-serif font-bold text-white">{monthName}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-zinc-500 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset cells */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[80px] rounded-xl bg-transparent"></div>
            ))}

            {/* Actual Month Days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayBookings = bookingsMap[dateStr] || [];
              const hasConflict = dayBookings.length > 1;
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#221c12]'
                      : hasConflict
                      ? 'border-amber-600/50 bg-amber-950/20'
                      : dayBookings.length > 0
                      ? 'border-zinc-700 bg-zinc-900/60'
                      : 'border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#D4AF37]' : 'text-zinc-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasConflict && (
                      <span title="Concurrent bookings on same day!">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                    )}
                  </div>

                  {dayBookings.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b._id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate bg-zinc-800 text-[#F5E6C8] border border-zinc-700"
                        >
                          {b.eventDetails.eventType}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-[9px] text-[#D4AF37] block font-bold">
                          +{dayBookings.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel (1 col) */}
        <div className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4">
          <h3 className="font-serif font-bold text-white text-lg border-b border-zinc-800 pb-3 flex items-center justify-between">
            <span>Schedule for Selected Date</span>
            <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
          </h3>

          {!selectedDate ? (
            <p className="text-zinc-500 text-xs py-10 text-center">
              Click on any date in the calendar to inspect scheduled ceremonies and crew commitments.
            </p>
          ) : selectedDateBookings.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-xs text-zinc-400 block mb-2">
                No events currently scheduled on
              </span>
              <span className="text-sm font-bold text-white font-mono block">
                {selectedDate}
              </span>
              <span className="text-[11px] text-emerald-400 mt-2 block">
                ✓ Full crew capacity available
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#D4AF37] block">
                {selectedDate} ({selectedDateBookings.length} Event{selectedDateBookings.length > 1 ? 's' : ''})
              </span>

              {selectedDateBookings.length > 1 && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Concurrent booking warning: Verify camera gear &amp; crew allocations for multiple teams.
                  </span>
                </div>
              )}

              {selectedDateBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#F5E6C8]">
                      {b.bookingReference}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-200">
                      {b.bookingStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-serif font-bold text-white">
                    {b.eventDetails.eventType}
                  </h4>

                  <div className="space-y-1 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{b.eventDetails.startTime} {b.eventDetails.endTime && `- ${b.eventDetails.endTime}`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{b.eventDetails.venueName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Client: {b.customerDetails?.fullName} ({b.customerDetails?.primaryMobile})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
