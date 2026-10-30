import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Download,
  RefreshCw,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle2,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { liveApi, getMediaUrl, getShareBaseUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import logoIcon from '../assets/logo-icon.svg';

export default function LivePhotoSharing() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { success, error } = useToast();
  const pollTimerRef = useRef(null);

  const fetchLiveFeed = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await liveApi.getPhotos();
      if (res.data?.success) {
        if (res.data.hasActiveEvent) {
          setActiveEvent(res.data.event);
          setPhotos(res.data.photos || []);
        } else {
          setActiveEvent(null);
          setPhotos([]);
        }
      }
    } catch (err) {
      console.error('Live feed error:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();

    // Auto-polling every 12 seconds to pick up live photos in real-time
    pollTimerRef.current = setInterval(() => {
      if (autoRefresh) {
        fetchLiveFeed();
      }
    }, 12000);

    return () => clearInterval(pollTimerRef.current);
  }, [autoRefresh]);

  const handleShare = () => {
    const shareUrl = `${getShareBaseUrl()}/live`;
    navigator.clipboard.writeText(shareUrl);
    success(`Permanent Live URL copied: ${shareUrl}`);
  };

  const handleNext = () => {
    if (activePhotoIndex !== null && activePhotoIndex < photos.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activePhotoIndex !== null && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
    }
  };

  const currentPhoto = activePhotoIndex !== null ? photos[activePhotoIndex] : null;

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Permanent QR Badge */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c1811] border border-[#D4AF37]/40 text-[#F5E6C8] text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <img src={logoIcon} alt="5Star" className="w-4 h-4" />
            <span>Permanent Live Event Distribution System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Live Event Photographs
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Welcome, guests! Browse and download high-resolution photos captured live by 5Star Cinematography. No account or login required.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-zinc-400 text-sm">
            Connecting to live event feed...
          </div>
        ) : !activeEvent ? (
          /* Inactive Event State */
          <div className="max-w-xl mx-auto glass-card p-12 rounded-3xl border border-zinc-800 text-center my-8">
            <div className="w-16 h-16 rounded-full bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-3">
              No Live Event In Progress
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              There is no event currently broadcasting on this permanent channel. As soon as the photographer commences the next celebration, photographs will instantly stream to this page.
            </p>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-6">
              Tip: Keep this page open on your phone or scan the table card once ceremony photography begins.
            </div>
            <button
              onClick={() => fetchLiveFeed(true)}
              disabled={refreshing}
              className="px-6 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Check for Live Stream Now
            </button>
          </div>
        ) : (
          /* Active Event Feed */
          <div>
            {/* Live Event Control Header */}
            <div className="glass-card-gold p-6 rounded-3xl border border-[#D4AF37]/40 mb-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Live Broadcast Active
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-xs text-[#F5E6C8]">{activeEvent.category}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
                  {activeEvent.name}
                </h2>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {photos.length} Photos Uploaded So Far
                  </span>
                  <span>•</span>
                  <span>Sequential Cataloging Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fetchLiveFeed(true)}
                  disabled={refreshing}
                  className="px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:border-[#D4AF37] hover:text-white transition-all"
                  title="Refresh Photos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
                  Refresh
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  title="Share Live Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {photos.length > 0 && (
                  <a
                    href={liveApi.getDownloadAllUrl()}
                    className="px-5 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:opacity-90 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download All (ZIP)
                  </a>
                )}
              </div>
            </div>

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl max-w-md mx-auto p-8 border border-zinc-800">
                <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-white font-serif font-bold text-base mb-1">Event In Progress</h3>
                <p className="text-zinc-400 text-xs">
                  The studio photographer has initiated this celebration. Photos will appear in real-time as they are transmitted from the camera.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => {
                  const mediaSrc = getMediaUrl(photo.gridFsFileId);
                  const downloadUrl = liveApi.getDownloadUrl(photo.id);

                  return (
                    <div
                      key={photo.id}
                      className="group relative rounded-2xl overflow-hidden glass-card border border-zinc-800 hover:border-[#D4AF37] transition-all aspect-square cursor-pointer"
                      onClick={() => setActivePhotoIndex(index)}
                    >
                      <img
                        src={mediaSrc}
                        alt={`Live Photo ${photo.formattedSequence}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Photo Sequence Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-zinc-700 text-[10px] font-mono font-bold text-[#F5E6C8]">
                        #{photo.formattedSequence}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <span className="text-[11px] font-mono text-zinc-300">
                          {photo.formattedSequence}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={downloadUrl}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-full bg-gold-gradient text-black hover:scale-110 transition-transform"
                            title="Download Original"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <span className="p-1.5 rounded-full bg-black/60 text-white">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8">
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-[#F5E6C8] px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700">
                Photo #{currentPhoto.formattedSequence}
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                {activePhotoIndex + 1} of {photos.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={liveApi.getDownloadUrl(currentPhoto.id)}
                download
                className="px-4 py-2 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
              >
                <Download className="w-3.5 h-3.5" /> Download Original
              </a>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-white hover:text-rose-400 hover:border-rose-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {activePhotoIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-zinc-800 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {activePhotoIndex < photos.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-zinc-800 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-5xl max-h-[82vh] w-full flex items-center justify-center">
            <img
              src={getMediaUrl(currentPhoto.gridFsFileId)}
              alt={`Live Photo ${currentPhoto.formattedSequence}`}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
