import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Film,
  Camera
} from 'lucide-react';
import { galleryApi, getMediaUrl, getMediaDownloadUrl, getShareBaseUrl } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function GalleryDetail() {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await galleryApi.getById(id);
        if (res.data?.success) {
          setGallery(res.data.gallery);
          setMedia(res.data.media || []);
        }
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [id]);

  const handleShare = () => {
    const shareUrl = `${getShareBaseUrl()}/gallery/${id}`;
    navigator.clipboard.writeText(shareUrl);
    success(`Gallery link copied: ${shareUrl}`);
  };

  const handleNext = () => {
    if (activeMediaIndex !== null && activeMediaIndex < media.length - 1) {
      setActiveMediaIndex(activeMediaIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeMediaIndex !== null && activeMediaIndex > 0) {
      setActiveMediaIndex(activeMediaIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen bg-[#09090b] text-zinc-400">
        Loading collection...
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen bg-[#09090b]">
        <h2 className="text-2xl font-serif text-white mb-4">Gallery Not Found</h2>
        <Link to="/gallery" className="text-[#D4AF37] hover:underline text-sm">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  const currentItem = activeMediaIndex !== null ? media[activeMediaIndex] : null;

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Back to Collections
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
              title="Share Gallery"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {gallery.downloadEnabled && media.length > 0 && (
              <a
                href={`/api/galleries/${gallery._id}/download-zip`}
                className="px-4 py-2 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                <Download className="w-3.5 h-3.5" /> Download All (ZIP)
              </a>
            )}
          </div>
        </div>

        {/* Gallery Title & Info */}
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            {gallery.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-2 mb-4">
            {gallery.title}
          </h1>
          {gallery.description && (
            <p className="text-zinc-300 text-base max-w-3xl leading-relaxed mb-4">
              {gallery.description}
            </p>
          )}
          {gallery.eventDate && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Event Date: {new Date(gallery.eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Media Grid */}
        {media.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl max-w-md mx-auto p-8 border border-zinc-800">
            <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Photographs and videos for this collection are being curated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item, index) => {
              const isVideo = item.mediaType === 'video';
              const mediaSrc = getMediaUrl(item.gridFsFileId);

              return (
                <div
                  key={item._id}
                  onClick={() => setActiveMediaIndex(index)}
                  className="group relative rounded-2xl overflow-hidden glass-card border border-zinc-800 hover:border-[#D4AF37] transition-all cursor-pointer aspect-square"
                >
                  {isVideo ? (
                    <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative">
                      <video
                        src={mediaSrc}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-black" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={mediaSrc}
                      alt={item.caption || item.originalFilename}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs text-zinc-200 font-medium truncate max-w-[70%]">
                      {item.caption || item.originalFilename}
                    </span>
                    <span className="p-1.5 rounded-full bg-black/60 text-white hover:text-[#D4AF37]">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8">
          {/* Top Bar Controls */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <span className="text-xs font-mono text-[#F5E6C8]">
              {activeMediaIndex + 1} / {media.length}
            </span>
            <div className="flex items-center gap-3">
              {gallery.downloadEnabled && (
                <a
                  href={getMediaDownloadUrl(currentItem.gridFsFileId)}
                  download
                  className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  title="Download Original"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => setActiveMediaIndex(null)}
                className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-white hover:text-rose-400 hover:border-rose-400 transition-all"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {activeMediaIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-zinc-800 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {activeMediaIndex < media.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 border border-zinc-800 text-white hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Content View */}
          <div className="max-w-5xl max-h-[82vh] w-full flex items-center justify-center">
            {currentItem.mediaType === 'video' ? (
              <video
                src={getMediaUrl(currentItem.gridFsFileId)}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={getMediaUrl(currentItem.gridFsFileId)}
                alt={currentItem.caption || currentItem.originalFilename}
                className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
