import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Film,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
  QrCode,
  ShieldCheck,
  Award,
  ChevronRight,
  Play,
  RotateCw,
  Move3D
} from 'lucide-react';
import { packageApi, galleryApi, testimonialApi, formatINR, getMediaUrl } from '../services/api';
import logoIcon from '../assets/logo-icon.svg';
import HeroPhotoSlider from '../components/HeroPhotoSlider';
import TiltCard3D from '../components/TiltCard3D';

export default function Home() {
  const [packages, setPackages] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, galRes, testRes] = await Promise.all([
          packageApi.getPackages(),
          galleryApi.getPublic(),
          testimonialApi.getPublic()
        ]);
        if (pkgRes.data?.success) setPackages(pkgRes.data.packages.slice(0, 4));
        if (galRes.data?.success) setGalleries(galRes.data.galleries.slice(0, 4));
        if (testRes.data?.success) setTestimonials(testRes.data.testimonials);
      } catch (err) {
        console.warn('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-20">
      {/* HERO SECTION WITH INTERACTIVE 3D MODEL */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0e0e12] via-[#09090b] to-[#09090b]">
        {/* Background Visual Texture */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80"
            alt="Cinematic Wedding"
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-radial from-transparent via-[#09090b]/70 to-[#09090b]"></div>
        </div>

        {/* Ambient Gold Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action Buttons (7 cols) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Logo Badge & Star Motif */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b1812] border border-[#D4AF37]/40 text-[#F5E6C8] text-xs font-semibold tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <img src={logoIcon} alt="5Star" className="w-4 h-4" />
                <span>Luxury Wedding Photography &amp; Cinematography</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-white leading-[1.1]">
                Every Moment, <br />
                <span className="text-gold-gradient">A Timeless Story.</span>
              </h1>

              <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
                We craft soul-stirring cinematic wedding films and heirloom photography. Delivering timeless directorial vision, master color-graded portraits, and unforgettable memories with uncompromising luxury.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/book"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gold-gradient text-black font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 text-center"
                >
                  Book Your Event
                </Link>
                <Link
                  to="/packages"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-700 bg-zinc-900/80 hover:border-[#D4AF37] text-white font-semibold text-sm tracking-wider uppercase transition-all hover:bg-zinc-800 text-center"
                >
                  Explore Packages
                </Link>
                <Link
                  to="/scan"
                  className="w-full sm:w-auto px-6 py-4 rounded-full border border-[#D4AF37]/50 hover:border-[#D4AF37] bg-[#1c1811]/60 hover:bg-[#1c1811] text-[#F5E6C8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                >
                  <QrCode className="w-4 h-4 text-[#D4AF37]" />
                  Scan QR Code
                </Link>
              </div>

              {/* Feature Highlights Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-zinc-800/80 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Directorial</h4>
                    <p className="text-[11px] text-zinc-400">Cinematic 4K UHD</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Anamorphic</h4>
                    <p className="text-[11px] text-zinc-400">Color graded</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Heirloom Flush</h4>
                    <p className="text-[11px] text-zinc-400">Italian leather</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Private Vault</h4>
                    <p className="text-[11px] text-zinc-400">Lifetime archive</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Automatic 2-Second Photoshoot Carousel (5 cols) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <HeroPhotoSlider />
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE PACKAGES SECTION */}
      <section className="py-24 bg-[#0a0a0d] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Curated Studio Offerings
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-3 mb-4">
              Photography &amp; Film Packages
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Transparent, luxury coverage designed for every scale of celebration. All packages can be tailored to your custom requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <TiltCard3D key={pkg._id} className="rounded-2xl h-full" maxTilt={10}>
                <div
                  className={`flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 relative h-full ${
                    pkg.isFeatured
                      ? 'glass-card-gold shadow-[0_0_30px_rgba(212,175,55,0.2)] border-2 border-[#D4AF37]/80'
                      : 'glass-card hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {pkg.isFeatured ? (
                      <div className="mb-4">
                        {(pkg.name?.toLowerCase().includes('trailer') || pkg.order === 3) ? (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gold-gradient text-black shadow-[0_0_18px_rgba(212,175,55,0.45)] border border-[#ffeb99]">
                            ★ Most Popular
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1c1811] text-[#F5E6C8] border border-[#D4AF37]/60 shadow-sm">
                            ★ Signature Choice
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                          Curated Tier
                        </span>
                      </div>
                    )}

                    <h3 className="text-lg font-serif font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-xs text-zinc-400 mb-5 leading-relaxed line-clamp-3">{pkg.description}</p>

                    <div className="mb-6 pb-6 border-b border-zinc-800">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#F5E6C8]">
                        {formatINR(pkg.price)}
                      </span>
                      <span className="text-xs text-zinc-500 block mt-1">Starting package price</span>
                    </div>

                    <ul className="space-y-2.5 mb-6 text-xs text-zinc-300">
                      {pkg.features?.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80">
                    <Link
                      to={`/book?packageId=${pkg._id}`}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center block transition-all ${
                        pkg.isFeatured
                          ? 'bg-gold-gradient text-black hover:opacity-90 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                          : 'border border-zinc-700 text-zinc-200 hover:border-[#D4AF37] hover:text-white'
                      }`}
                    >
                      Select Package
                    </Link>
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              View Full Package Specifications &amp; Add-ons <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* FEATURED PORTFOLIO SECTION */}
      <section className="py-24 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                Captured In Motion &amp; Stills
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-3">
                Featured Portfolio
              </h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:underline"
            >
              Explore All Folders &amp; Films <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleries.map((gal) => (
              <TiltCard3D key={gal._id} className="rounded-2xl h-full aspect-[3/4]" maxTilt={12}>
                <Link
                  to={`/gallery/${gal._id}`}
                  className="group relative rounded-2xl overflow-hidden glass-card border border-zinc-800 hover:border-[#D4AF37] transition-all w-full h-full block"
                >
                  <img
                    src={
                      gal.coverImageFileId
                        ? getMediaUrl(gal.coverImageFileId)
                        : gal.coverImageUrl ||
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={gal.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
                      {gal.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#F5E6C8] transition-colors leading-snug">
                      {gal.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-white transition-colors">
                      <span>View Collection</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                  </div>
                </Link>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-[#0d0d10] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Words From Our Couples
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-3">
              Client Testimonials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <TiltCard3D key={test._id} className="rounded-2xl h-full" maxTilt={8}>
                <div className="glass-card p-8 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1 text-[#D4AF37] mb-4">
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed italic mb-6">
                      "{test.review}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-zinc-800">
                    <h4 className="font-serif font-bold text-white text-base">{test.clientName}</h4>
                    <p className="text-xs text-[#D4AF37]">{test.eventType} {test.eventLocation && `• ${test.eventLocation}`}</p>
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL BOOKING CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-[#09090b] to-[#12100a] text-center relative">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-6">
            Ready to Capture Your <span className="text-gold-gradient">Timeless Story?</span>
          </h2>
          <p className="text-zinc-300 text-base max-w-xl mx-auto mb-10">
            Dates for upcoming wedding and festive seasons book rapidly. Check availability, choose your dream package, and connect with our studio director today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/book"
              className="px-8 py-4 rounded-full bg-gold-gradient text-black font-bold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Reserve Your Date Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 rounded-full border border-zinc-700 hover:border-[#D4AF37] text-white font-semibold text-sm uppercase tracking-wider transition-all"
            >
              Contact Studio Director
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
