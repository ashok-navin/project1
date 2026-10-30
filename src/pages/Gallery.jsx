import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Image as ImageIcon, ChevronRight, Lock, Eye } from 'lucide-react';
import { galleryApi, getMediaUrl } from '../services/api';

const categories = [
  'All',
  'Wedding Photography',
  'Reception',
  'Pre-Wedding Shoot',
  'Engagement',
  'Cinematic Trailers',
  'Other Events'
];

export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const res = await galleryApi.getPublic();
        if (res.data?.success) {
          setGalleries(res.data.galleries);
        }
      } catch (err) {
        console.error('Gallery fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  const filteredGalleries = selectedCategory === 'All'
    ? galleries
    : galleries.filter((g) => g.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Visual Storytelling
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mt-3 mb-4">
            Portfolio &amp; Cinema Films
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Browse our curated collections from royal weddings, serene golden-hour pre-wedding shoots, and high-energy receptions across India.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                selectedCategory === cat
                  ? 'bg-gold-gradient text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#D4AF37] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Galleries Grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500 text-sm">Loading gallery collections...</div>
        ) : filteredGalleries.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl max-w-md mx-auto p-8 border border-zinc-800">
            <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No galleries found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGalleries.map((gal) => (
              <Link
                key={gal._id}
                to={`/gallery/${gal._id}`}
                className="group rounded-3xl overflow-hidden glass-card border border-zinc-800 hover:border-[#D4AF37] transition-all duration-500 flex flex-col justify-between"
              >
                {/* Image Cover */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={
                      gal.coverImageFileId
                        ? getMediaUrl(gal.coverImageFileId)
                        : gal.coverImageUrl ||
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={gal.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-zinc-700 text-[#F5E6C8]">
                    {gal.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#F5E6C8] transition-colors mb-2">
                    {gal.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {gal.description || 'Exclusive photography and cinematic film collection.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {gal.mediaCount ? `${gal.mediaCount} Media Items` : 'View Album'}
                    </span>
                    <span className="flex items-center gap-1 text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform">
                      Open Folder <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
