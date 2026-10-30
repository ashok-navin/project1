import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Camera, Film, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import logoIcon from '../assets/logo-icon.svg';

export default function AboutUs() {
  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c1811] border border-[#D4AF37]/40 text-[#F5E6C8] text-xs font-semibold uppercase tracking-wider mb-4">
            <img src={logoIcon} alt="5Star" className="w-4 h-4" />
            <span>The 5Star Legacy</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-4">
            Preserving Your Royal Moments
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Founded with an uncompromising passion for cinematic storytelling, 5Star Cinematography has evolved into India's premier wedding photography and film studio.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
              Directorial Precision Meets Raw Human Emotion
            </h2>
            <p>
              A wedding isn't a staged photo shoot — it is a symphony of fleeting glances, tears of joy, sacred vows, and thunderous celebrations. Our philosophy centers on discreet observation combined with Hollywood-grade cinematography equipment.
            </p>
            <p>
              From royal palaces in Rajasthan to beachside sunset vows in Goa and traditional South Indian muhurthams, our team of seasoned directors, candid masters, and colorists treat every frame as an archival piece of art.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-3xl font-serif font-extrabold text-[#D4AF37] block mb-1">500+</span>
                <span className="text-xs text-zinc-400">Weddings &amp; Events Documented</span>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-3xl font-serif font-extrabold text-[#D4AF37] block mb-1">100%</span>
                <span className="text-xs text-zinc-400">Master Quality Uncompressed Archival Delivery</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden glass-card-gold p-2 border border-[#D4AF37]/40 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
                alt="5Star Crew at Work"
                className="rounded-2xl w-full h-[420px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Studio Pillars */}
        <div className="mb-24">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white text-center mb-12">
            Why Discerning Families Choose 5Star
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl border border-zinc-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1c1811] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg">Cinema 4K UHD Grading</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We grade footage using industry standard DaVinci Resolve color profiles with licensed soundtracks, creating wedding films that look indistinguishable from cinema releases.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-zinc-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1c1811] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg">Direct High-Speed Digital Delivery</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Couples and families receive instant private cloud access to browse, stream, and download their entire wedding archive in full pristine master resolution.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-zinc-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1c1811] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg">Museum-Grade Heirlooms</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our flush-mount albums are hand-bound in authentic Italian leather with archival Japanese photographic paper guaranteed to resist fading for over a century.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 rounded-3xl glass-card-gold border border-[#D4AF37]/40 max-w-3xl mx-auto shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
            Let Us Craft Your Visual Heirloom
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto mb-8">
            Connect with our creative director for a coffee consultation at our Jubilee Hills studio or schedule a video call.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/book"
              className="px-6 py-3 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider"
            >
              Check Availability
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-full border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 text-xs uppercase font-semibold"
            >
              Contact Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
