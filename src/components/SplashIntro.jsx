import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Camera } from 'lucide-react';
import logoDark from '../assets/logo-dark.svg';
import logoIcon from '../assets/logo-icon.svg';

export default function SplashIntro({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [starsVisible, setStarsVisible] = useState([false, false, false, false, false]);

  useEffect(() => {
    // Reveal stars sequentially over the first 1.2s
    const starTimers = [150, 350, 550, 750, 950].map((delay, index) => {
      return setTimeout(() => {
        setStarsVisible((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, delay);
    });

    // Fill progress bar smoothly up to 100% over 2.7s
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 54);

    // At 2.7s start smooth fade out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2700);

    // At 3.2s finish completely and unmount
    const endTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3200);

    return () => {
      starTimers.forEach(clearTimeout);
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070709] transition-all duration-700 select-none overflow-hidden ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient lighting and radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.18)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Floating 3D golden dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#D4AF37] opacity-60 animate-ping"
            style={{
              top: `${(i * 17) % 95}%`,
              left: `${(i * 23) % 95}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDuration: `${2 + (i % 3)}s`,
              animationDelay: `${(i * 0.15)}s`
            }}
          />
        ))}
      </div>

      {/* Skip button in top right */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-[#D4AF37] border border-zinc-800 hover:border-[#D4AF37]/50 rounded-full px-4 py-1.5 bg-black/40 backdrop-blur-md transition-all"
      >
        Skip Intro →
      </button>

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated 5 Golden Stars Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`transition-all duration-500 transform ${
                starsVisible[idx]
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-50 -translate-y-4'
              }`}
            >
              <div className="relative">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] fill-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
                <span className="absolute inset-0 flex items-center justify-center animate-ping opacity-30">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5E6C8] fill-[#F5E6C8]" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Animated Lens Aperture Logo */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F5E6C8] to-[#997300] blur-2xl opacity-40 animate-pulse" />
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-4 bg-gradient-to-b from-[#1c1811] to-[#0c0c0f] border-2 border-[#D4AF37]/60 shadow-[0_0_50px_rgba(212,175,55,0.35)] flex items-center justify-center transform hover:rotate-6 transition-transform">
            <img
              src={logoIcon}
              alt="5Star Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain animate-spin"
              style={{ animationDuration: '24s' }}
            />
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-widest text-gold-gradient uppercase drop-shadow-md">
            5Star
          </h1>
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#F5E6C8] font-bold">
            Cinematography
          </h2>
          <p className="text-[11px] text-zinc-400 tracking-wider uppercase font-medium max-w-xs mx-auto pt-1">
            Luxury Weddings &amp; 3D Live Photo Transmissions
          </p>
        </div>

        {/* 3-Second Progress Bar */}
        <div className="w-56 sm:w-64 space-y-2">
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F5E6C8] to-[#D4AF37] rounded-full transition-all duration-75 shadow-[0_0_10px_#D4AF37]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>STARTING 3D ENGINE</span>
            <span className="text-[#D4AF37]">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
