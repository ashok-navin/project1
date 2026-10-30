import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Pause, Play, Camera } from 'lucide-react';

const samplePhotos = [
  {
    id: 1,
    title: 'Royal Heritage Palace Wedding',
    subtitle: 'Udaipur City Palace • The Royal Grandeur',
    tag: 'Celebrity Wedding Feature',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 2,
    title: 'Sunset Beach Romance & Vows',
    subtitle: 'Goa Coastal Serenade • Golden Hour',
    tag: 'Pre-Wedding Cinema Reel',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 3,
    title: 'Grand Starlight Gala Reception',
    subtitle: 'Taj Falaknuma Palace • Champagne Lights',
    tag: 'Cinematic Reception Film',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 4,
    title: 'Editorial Candid Bridal Portrait',
    subtitle: 'Heirloom Jewels & Timeless Solitude',
    tag: 'Vogue India Inspired',
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=85'
  },
  {
    id: 5,
    title: 'Sacred Traditional Muhurtham',
    subtitle: 'Authentic South Indian Rituals & Joy',
    tag: 'Heirloom Heritage Stills',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=85'
  }
];

export default function HeroPhotoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Automatic slide transition every 2 seconds (2000ms)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % samplePhotos.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? samplePhotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % samplePhotos.length);
  };

  const currentPhoto = samplePhotos[currentIndex];

  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto group">
      {/* Outer Golden Aura Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/40 via-[#F5E6C8]/20 to-[#D4AF37]/40 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>

      {/* Main Slide Card Container */}
      <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/50 bg-[#0d0c0a] shadow-2xl">
        {/* Aspect Ratio Box: 4:5 Portrait Showcase */}
        <div className="relative aspect-[4/5] sm:aspect-[4/4.8] w-full overflow-hidden">
          {samplePhotos.map((photo, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={photo.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-100 z-10'
                    : 'opacity-0 scale-105 pointer-events-none z-0'
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out scale-100 hover:scale-105 filter brightness-95 contrast-105"
                />

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>
              </div>
            );
          })}

          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#D4AF37]/40 shadow-lg">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F5E6C8]">
                {currentPhoto.tag}
              </span>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-[#D4AF37] border border-zinc-700/60 backdrop-blur-md transition-colors shadow"
              title={isPlaying ? 'Pause 2s Slideshow' : 'Resume 2s Slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#D4AF37]" />}
            </button>
          </div>

          {/* Bottom Captions & Title */}
          <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
            <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-[#D4AF37]/35 shadow-2xl">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold">
                  ★ 5Star Master Portfolio
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {currentIndex + 1} / {samplePhotos.length} • 2s Auto
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide leading-tight">
                {currentPhoto.title}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-[#D4AF37]" />
                <span>{currentPhoto.subtitle}</span>
              </p>
            </div>

            {/* Slider Dots & Next/Prev Controls */}
            <div className="flex items-center justify-between pt-1">
              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {samplePhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-7 bg-gold-gradient shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                        : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-full bg-black/70 hover:bg-[#1c1811] text-zinc-300 hover:text-[#D4AF37] border border-zinc-700/60 transition-colors"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-full bg-black/70 hover:bg-[#1c1811] text-zinc-300 hover:text-[#D4AF37] border border-zinc-700/60 transition-colors"
                  title="Next Photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
