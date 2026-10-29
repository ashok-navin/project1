import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Home, ArrowLeft } from 'lucide-react';
import logoIcon from '../assets/logo-icon.svg';

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 bg-[#09090b] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-card p-10 rounded-3xl border border-zinc-800 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1c1811] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto mb-6">
          <Camera className="w-8 h-8" />
        </div>
        <span className="font-mono text-sm font-bold text-[#D4AF37] block mb-2">404 • OUT OF FOCUS</span>
        <h1 className="text-3xl font-serif font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-xs text-zinc-400 leading-relaxed mb-8">
          The scene or gallery reel you are looking for does not exist or has been relocated to an archive.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-all"
        >
          <Home className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
