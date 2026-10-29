import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PlusCircle, ArrowRight, Sparkles, Shield, Camera, Film } from 'lucide-react';
import { packageApi, formatINR, getMediaUrl } from '../services/api';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await packageApi.getPackages();
        if (res.data?.success) {
          setPackages(res.data.packages);
        }
      } catch (err) {
        console.error('Packages error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Wedding &amp; Event Investment
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mt-3 mb-6">
            Photography Packages
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Every package includes our signature directorial guidance, cinema color-grading, and high-speed digital cloud delivery. Explore our initial collections below or request a custom bespoke itinerary.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 border ${
                pkg.isFeatured
                  ? 'glass-card-gold border-[#D4AF37]/50 shadow-[0_0_35px_rgba(212,175,55,0.15)]'
                  : 'glass-card border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Cover Banner if present */}
                {(pkg.coverImageFileId || pkg.coverImageUrl) && (
                  <div className="h-56 w-full overflow-hidden relative">
                    <img
                      src={
                        pkg.coverImageFileId
                          ? getMediaUrl(pkg.coverImageFileId)
                          : pkg.coverImageUrl
                      }
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14120e] via-transparent to-transparent"></div>
                    {pkg.isFeatured && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-gradient text-black">
                        Signature Choice
                      </span>
                    )}
                  </div>
                )}

                <div className="p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                      {pkg.name}
                    </h2>
                    <div className="text-left sm:text-right">
                      <span className="text-3xl font-extrabold text-[#F5E6C8]">
                        {formatINR(pkg.price)}
                      </span>
                      <span className="text-xs text-zinc-500 block">INR • Taxes as applicable</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed mb-8">
                    {pkg.description}
                  </p>

                  {/* Included Services */}
                  <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Included Services &amp; Deliverables
                    </h3>
                    <ul className="space-y-3">
                      {pkg.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-200">
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional Add-ons if available */}
                  {pkg.addOns && pkg.addOns.length > 0 && (
                    <div className="mb-6 pt-6 border-t border-zinc-800">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Optional Add-ons Available
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {pkg.addOns.map((add, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5"
                          >
                            <span>{add.name}</span>
                            <strong className="text-[#D4AF37] font-semibold">{formatINR(add.price)}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="p-8 pt-0">
                <Link
                  to={`/book?packageId=${pkg._id}`}
                  className="w-full py-4 rounded-2xl bg-gold-gradient text-black font-bold text-sm uppercase tracking-wider text-center block transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  Book This Package <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Requirements Box */}
        <div className="mt-16 p-8 rounded-3xl glass-card border border-zinc-800 text-center max-w-3xl mx-auto">
          <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
          <h3 className="text-xl font-serif font-bold text-white mb-2">Need a Bespoke Destination Package?</h3>
          <p className="text-sm text-zinc-400 mb-6">
            For multi-city celebrations, destination weddings in Udaipur, Goa, or international shoots, our creative directors curate custom production schedules.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 text-xs uppercase tracking-wider font-semibold transition-all"
          >
            Request Custom Quotation
          </Link>
        </div>
      </div>
    </div>
  );
}
