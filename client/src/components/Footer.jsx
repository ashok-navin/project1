import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, QrCode, ArrowUpRight } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, FacebookIcon } from './SocialIcons';
import logoDark from '../assets/logo-dark.svg';

export default function Footer() {
  return (
    <footer className="bg-[#070709] border-t border-zinc-800/80 pt-16 pb-12 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logoDark} alt="5Star Cinematography" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">
              Capturing authentic human emotions, grand weddings, and cinematic stories with timeless elegance and high-definition artistry.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-800 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-serif font-semibold tracking-wider uppercase text-sm mb-5 pb-2 border-b border-zinc-800/80 inline-block">
              Explore Studio
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-[#D4AF37] transition-colors">Photography Packages</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#D4AF37] transition-colors">Portfolio &amp; Films</Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-[#D4AF37] transition-colors">Scan &amp; Download Photos</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors">About Our Team</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-serif font-semibold tracking-wider uppercase text-sm mb-5 pb-2 border-b border-zinc-800/80 inline-block">
              Our Expertise
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-zinc-200">Cinematic Wedding Trailers</li>
              <li className="hover:text-zinc-200">Candid Wedding Photography</li>
              <li className="hover:text-zinc-200">Pre-Wedding Conceptual Films</li>
              <li className="hover:text-zinc-200">Grand Receptions &amp; Engagements</li>
              <li className="hover:text-zinc-200">4K Drone Aerial Cinematography</li>
              <li className="hover:text-zinc-200">Bespoke Flush-Mount Albums</li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-semibold tracking-wider uppercase text-sm mb-5 pb-2 border-b border-zinc-800/80 inline-block">
              Studio &amp; Enquiries
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1" />
                <span>Studio 5, Luxury Arts Enclave, Road No. 36, Jubilee Hills, Hyderabad, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="mailto:contact@5starcinematography.com" className="hover:text-white transition-colors">contact@5starcinematography.com</a>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                Event Guest Photo Access
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>&copy; {new Date().getFullYear()} 5Star Cinematography. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-zinc-400 transition-colors">Studio Location</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
