import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, CalendarCheck, ArrowRight, User, Home, Mail } from 'lucide-react';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('ref') || '5STAR-BK-CONFIRMED';

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F5E6C8', '#FFFFFF', '#AA820A']
      });
    } catch (err) {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="pt-32 pb-24 bg-[#09090b] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full glass-card-gold p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/50 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-20 h-20 rounded-full bg-[#1c1811] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
          Inquiry Successfully Logged
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-2 mb-3">
          Booking Confirmed!
        </h1>
        <p className="text-zinc-300 text-sm leading-relaxed mb-6">
          Thank you for trusting 5Star Cinematography. Your booking request has been registered and is under review by our studio production team.
        </p>

        {/* Reference Box */}
        <div className="p-5 rounded-2xl bg-[#14120e] border border-[#D4AF37]/30 mb-8 inline-block w-full text-center">
          <span className="text-xs text-zinc-400 block mb-1">Your Unique Booking Reference</span>
          <span className="text-xl sm:text-2xl font-mono font-extrabold text-[#F5E6C8] tracking-wider selection:bg-zinc-800">
            {bookingRef}
          </span>
        </div>

        {/* Notice Info */}
        <div className="text-left space-y-2.5 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 mb-8">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>A confirmation email has been dispatched with full summary details.</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Our team will contact you via WhatsApp / phone within 24 hours.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" /> Go to Customer Dashboard
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-zinc-700 hover:border-[#D4AF37] text-zinc-300 text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
