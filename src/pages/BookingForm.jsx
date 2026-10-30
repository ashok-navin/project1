import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { packageApi, bookingApi, formatINR } from '../services/api';

const eventCategories = [
  'Wedding',
  'Reception',
  'Engagement',
  'Pre-Wedding',
  'Birthday',
  'Baby Shower',
  'Puberty Ceremony',
  'Corporate Event',
  'Other'
];

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const preselectedPkgId = searchParams.get('packageId');
  const { user, isAuthenticated } = useAuth();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      primaryMobile: user?.mobile || '',
      alternateMobile: '',
      fullAddress: '',
      city: '',
      state: '',
      postalCode: '',
      eventType: 'Wedding',
      eventDate: '',
      startTime: '10:00 AM',
      endTime: '11:00 PM',
      venueName: '',
      venueAddress: '',
      expectedGuests: '',
      specialRequirements: '',
      preferredContact: 'WhatsApp'
    }
  });

  // Fetch packages
  useEffect(() => {
    const fetchPkgs = async () => {
      try {
        const res = await packageApi.getPackages();
        if (res.data?.success) {
          const list = res.data.packages;
          setPackages(list);
          if (preselectedPkgId) {
            const found = list.find((p) => p._id === preselectedPkgId);
            if (found) setSelectedPackage(found);
          } else if (list.length > 0) {
            setSelectedPackage(list[0]);
          }
        }
      } catch (err) {
        console.error('Packages error in booking:', err);
      }
    };
    fetchPkgs();
  }, [preselectedPkgId]);

  // Update user default values if auth loads late
  useEffect(() => {
    if (user) {
      if (user.name) setValue('fullName', user.name);
      if (user.email) setValue('email', user.email);
      if (user.mobile) setValue('primaryMobile', user.mobile);
    }
  }, [user, setValue]);

  // Calculate live total price
  const calculateTotal = () => {
    if (!selectedPackage) return 0;
    let total = selectedPackage.price;
    selectedAddOns.forEach((addonName) => {
      const match = selectedPackage.addOns?.find((a) => a.name === addonName);
      if (match) total += match.price;
    });
    return total;
  };

  const handleAddOnToggle = (addonName) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      warning('Please log in or register before submitting your event booking.');
      navigate('/login?redirect=/book');
      return;
    }

    if (!selectedPackage) {
      error('Please select a photography package.');
      return;
    }

    // Prevent past date validation
    const chosenDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosenDate < today) {
      error('Event date cannot be in the past. Please choose an upcoming date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerDetails: {
          fullName: data.fullName,
          email: data.email,
          primaryMobile: data.primaryMobile,
          alternateMobile: data.alternateMobile,
          fullAddress: data.fullAddress,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode
        },
        eventDetails: {
          eventType: data.eventType,
          eventDate: data.eventDate,
          startTime: data.startTime,
          endTime: data.endTime,
          venueName: data.venueName,
          fullAddress: data.venueAddress,
          expectedGuests: Number(data.expectedGuests || 0),
          specialRequirements: data.specialRequirements,
          preferredContact: data.preferredContact
        },
        packageId: selectedPackage._id,
        additionalServices: selectedAddOns
      };

      const res = await bookingApi.createBooking(payload);
      if (res.data?.success) {
        success('Booking inquiry submitted successfully!');
        navigate(`/booking-success?ref=${res.data.booking.bookingReference}`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Minimum allowed date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Reserve Your Celebration
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-2 mb-3">
            Event Booking Request
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Fill in the details below to schedule your photography and cinematography coverage. Our production team will contact you to confirm venue logistics.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center justify-between text-xs text-amber-200">
            <span>You are currently not logged in. An active account is required to preserve your booking history.</span>
            <Link
              to="/login?redirect=/book"
              className="px-4 py-1.5 rounded-full bg-gold-gradient text-black font-bold uppercase tracking-wider shrink-0"
            >
              Log In
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Form Fields */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Customer Details */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-800">
                <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  1. Primary Customer Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Full name is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. Priya Sharma"
                    />
                    {errors.fullName && <p className="text-rose-400 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email address is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. priya@example.com"
                    />
                    {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Primary Mobile Number *
                    </label>
                    <input
                      type="tel"
                      {...register('primaryMobile', { required: 'Mobile number is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. +91 98765 43210"
                    />
                    {errors.primaryMobile && <p className="text-rose-400 text-xs mt-1">{errors.primaryMobile.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Alternate Mobile Number
                    </label>
                    <input
                      type="tel"
                      {...register('alternateMobile')}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Full Address *
                    </label>
                    <input
                      type="text"
                      {...register('fullAddress', { required: 'Address is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="House / Apartment, Street, Locality"
                    />
                    {errors.fullAddress && <p className="text-rose-400 text-xs mt-1">{errors.fullAddress.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. Hyderabad"
                    />
                    {errors.city && <p className="text-rose-400 text-xs mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      {...register('state', { required: 'State is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. Telangana"
                    />
                    {errors.state && <p className="text-rose-400 text-xs mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      {...register('postalCode', { required: 'Postal code is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. 500033"
                    />
                    {errors.postalCode && <p className="text-rose-400 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Event Details */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-zinc-800">
                <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  2. Event Schedule &amp; Venue
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Event Category *
                    </label>
                    <select
                      {...register('eventType', { required: 'Event category is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    >
                      {eventCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      min={minDateString}
                      {...register('eventDate', { required: 'Event date is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    />
                    {errors.eventDate && <p className="text-rose-400 text-xs mt-1">{errors.eventDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Start Time *
                    </label>
                    <input
                      type="text"
                      {...register('startTime', { required: 'Start time is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. 10:00 AM"
                    />
                    {errors.startTime && <p className="text-rose-400 text-xs mt-1">{errors.startTime.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      End Time (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('endTime')}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. 11:00 PM"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      {...register('venueName', { required: 'Venue name is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. Taj Falaknuma Palace / Marriott Convention Center"
                    />
                    {errors.venueName && <p className="text-rose-400 text-xs mt-1">{errors.venueName.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Full Venue Address *
                    </label>
                    <input
                      type="text"
                      {...register('venueAddress', { required: 'Venue address is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="Exact landmark and address for crew navigation"
                    />
                    {errors.venueAddress && <p className="text-rose-400 text-xs mt-1">{errors.venueAddress.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Expected Guests
                    </label>
                    <input
                      type="number"
                      {...register('expectedGuests')}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="e.g. 500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Preferred Contact Method
                    </label>
                    <select
                      {...register('preferredContact')}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Special Requirements or Itinerary Notes
                    </label>
                    <textarea
                      rows={3}
                      {...register('specialRequirements')}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                      placeholder="Tell us about special traditions, drone permits, specific portrait timings, etc."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Package Selection & Summary Card */}
            <div className="space-y-6">
              <div className="glass-card-gold p-6 rounded-3xl border border-[#D4AF37]/40 shadow-2xl sticky top-28">
                <h3 className="text-base font-serif font-bold text-white mb-4 border-b border-zinc-800 pb-3 flex items-center justify-between">
                  <span>Selected Package</span>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </h3>

                {/* Package Dropdown Selector */}
                <div className="mb-4">
                  <label className="block text-xs text-zinc-400 mb-1">Choose Package</label>
                  <select
                    value={selectedPackage?._id || ''}
                    onChange={(e) => {
                      const found = packages.find((p) => p._id === e.target.value);
                      setSelectedPackage(found);
                      setSelectedAddOns([]);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-[#D4AF37]/50 text-[#F5E6C8] font-semibold text-sm focus:outline-none"
                  >
                    {packages.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {formatINR(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPackage && (
                  <div className="space-y-4 mb-6">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedPackage.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-2">
                        Included Key Highlights
                      </span>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        {selectedPackage.features?.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Add-ons Checkboxes */}
                    {selectedPackage.addOns && selectedPackage.addOns.length > 0 && (
                      <div className="pt-3 border-t border-zinc-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                          Available Add-ons
                        </span>
                        <div className="space-y-2">
                          {selectedPackage.addOns.map((addon, i) => {
                            const isChecked = selectedAddOns.includes(addon.name);
                            return (
                              <label
                                key={i}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-[#272013] border-[#D4AF37] text-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleAddOnToggle(addon.name)}
                                    className="accent-[#D4AF37]"
                                  />
                                  <span>{addon.name}</span>
                                </div>
                                <span className="font-semibold text-[#D4AF37]">{formatINR(addon.price)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Base Package:</span>
                        <span>{formatINR(selectedPackage.price)}</span>
                      </div>
                      {selectedAddOns.length > 0 && (
                        <div className="flex justify-between text-zinc-400">
                          <span>Add-ons ({selectedAddOns.length}):</span>
                          <span>{formatINR(calculateTotal() - selectedPackage.price)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline text-base font-bold text-white pt-2 border-t border-zinc-800">
                        <span>Total Quoted:</span>
                        <span className="text-xl text-[#F5E6C8]">{formatINR(calculateTotal())}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        *Enquiry-based booking. No immediate online payment required.
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting Reservation...' : 'Confirm & Send Booking Request'}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
