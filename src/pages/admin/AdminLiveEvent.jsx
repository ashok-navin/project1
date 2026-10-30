import React, { useState, useEffect } from 'react';
import {
  Radio,
  PlusCircle,
  Upload,
  Download,
  QrCode,
  Share2,
  Trash2,
  Clock,
  Layers,
  StopCircle,
  Archive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Camera,
  X
} from 'lucide-react';
import { liveApi, getMediaUrl, getShareBaseUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminLiveEvent() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [livePhotos, setLivePhotos] = useState([]);
  const [archives, setArchives] = useState([]);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'archives'
  const [loading, setLoading] = useState(true);

  // QR Code State
  const [qrData, setQrData] = useState(null);

  // Start New Event Modal
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventCategory, setEventCategory] = useState('Wedding Ceremony');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventDescription, setEventDescription] = useState('');
  const [starting, setStarting] = useState(false);

  // Upload Photos Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Selected Archive
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [archivePhotos, setArchivePhotos] = useState([]);
  const [loadingArchivePhotos, setLoadingArchivePhotos] = useState(false);

  const { success, error, warning } = useToast();

  const fetchLiveState = async () => {
    setLoading(true);
    try {
      const [activeRes, qrRes, archRes] = await Promise.all([
        liveApi.getActive(),
        liveApi.getPermanentQR(),
        liveApi.getArchives()
      ]);

      if (activeRes.data?.success && activeRes.data.hasActiveEvent) {
        setActiveEvent(activeRes.data.event);
        // fetch photos
        const photoRes = await liveApi.getPhotos();
        if (photoRes.data?.success) {
          setLivePhotos(photoRes.data.photos || []);
        }
      } else {
        setActiveEvent(null);
        setLivePhotos([]);
      }

      if (qrRes.data?.success) {
        setQrData(qrRes.data);
      }

      if (archRes.data?.success) {
        setArchives(archRes.data.archives || []);
      }
    } catch (err) {
      console.error('Fetch live state error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
  }, []);

  const handleStartEvent = async (e) => {
    e.preventDefault();
    if (!eventName || !eventCategory) {
      error('Event name and category are required.');
      return;
    }

    setStarting(true);
    try {
      const res = await liveApi.startEvent({
        name: eventName,
        category: eventCategory,
        eventDate,
        description: eventDescription
      });

      if (res.data?.success) {
        success(`Live event "${eventName}" is now broadcasting on the permanent QR code!`);
        setIsStartModalOpen(false);
        setActiveEvent(res.data.event);
        setLivePhotos([]);
        setEventName('');
        setEventDescription('');
        fetchLiveState();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to start event');
    } finally {
      setStarting(false);
    }
  };

  const handleUploadPhotos = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      error('Please select images to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('photos', selectedFiles[i]);
      }

      const res = await liveApi.uploadPhotos(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data?.success) {
        success(`Uploaded ${res.data.photos?.length} photo(s) with sequential cataloging!`);
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
        setUploadProgress(0);
        // Append newly uploaded photos in real-time
        if (res.data.photos) {
          setLivePhotos((prev) => [...res.data.photos, ...prev]);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleEndEvent = async () => {
    if (
      !window.confirm(
        `Are you sure you want to end event "${activeEvent.name}"? This will archive all photos in MongoDB Atlas and leave the permanent QR code ready for your next event.`
      )
    )
      return;

    try {
      const res = await liveApi.endEvent();
      if (res.data?.success) {
        success(res.data.message);
        setActiveEvent(null);
        setLivePhotos([]);
        fetchLiveState();
      }
    } catch (err) {
      error('Failed to end event');
    }
  };

  const copyQrLink = () => {
    const liveUrl = qrData?.liveUrl || `${getShareBaseUrl()}/live`;
    navigator.clipboard.writeText(liveUrl);
    success(`Permanent QR destination link copied: ${liveUrl}`);
  };

  const openArchivePhotos = async (arch) => {
    setSelectedArchive(arch);
    setLoadingArchivePhotos(true);
    try {
      const res = await liveApi.getArchivePhotos(arch._id);
      if (res.data?.success) {
        setArchivePhotos(res.data.photos || []);
      }
    } catch (err) {
      error('Failed to load archive photos');
    } finally {
      setLoadingArchivePhotos(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#D4AF37]" />
            Live Event Photo Distribution &amp; Permanent QR
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time guest distribution during celebrations. The permanent QR code never changes across events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'live'
                ? 'bg-gold-gradient text-black shadow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
            }`}
          >
            Live Console
          </button>
          <button
            onClick={() => setActiveTab('archives')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'archives'
                ? 'bg-gold-gradient text-black shadow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
            }`}
          >
            Archived Events ({archives.length})
          </button>
        </div>
      </div>

      {activeTab === 'live' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Event Banner or Inactive Card */}
            {activeEvent ? (
              <div className="glass-card-gold p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/50 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        BROADCASTING IN REAL-TIME
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-xs text-[#F5E6C8]">{activeEvent.category}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                      {activeEvent.name}
                    </h2>
                    <span className="text-xs text-zinc-400 block mt-1">
                      Started: {new Date(activeEvent.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {livePhotos.length} Photos Cataloged
                    </span>
                  </div>

                  {/* Actions for Active Event */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:opacity-90"
                    >
                      <Upload className="w-4 h-4" /> Upload Photos
                    </button>
                    <button
                      onClick={handleEndEvent}
                      className="px-4 py-2.5 rounded-full border border-rose-800 bg-rose-950/60 text-rose-300 font-bold text-xs uppercase tracking-wider hover:bg-rose-900 transition-all flex items-center gap-1.5"
                    >
                      <StopCircle className="w-4 h-4" /> End Event
                    </button>
                  </div>
                </div>

                {/* Uploaded Live Photos Feed */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                      Live Upload Stream ({livePhotos.length})
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      Sequential naming active (000001, 000002...)
                    </span>
                  </div>

                  {livePhotos.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-2xl p-6">
                      <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-300 text-xs mb-3">
                        No photos uploaded yet for this active celebration.
                      </p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase"
                      >
                        Upload First Batch Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                      {livePhotos.map((p) => (
                        <div
                          key={p.id}
                          className="group relative rounded-xl overflow-hidden glass-card border border-zinc-800 aspect-square"
                        >
                          <img
                            src={getMediaUrl(p.gridFsFileId)}
                            alt={`Seq ${p.formattedSequence}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-[#F5E6C8]">
                            #{p.formattedSequence}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black text-[9px] text-zinc-300 truncate">
                            {p.originalFilename}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* No Active Event Card */
              <div className="glass-card p-10 rounded-3xl border border-zinc-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  No Live Event Currently Active
                </h2>
                <p className="text-zinc-400 text-xs max-w-md mx-auto leading-relaxed">
                  Start a new event before uploading ceremony photographs. The single permanent QR code will automatically route guests to this event feed once launched.
                </p>
                <button
                  onClick={() => setIsStartModalOpen(true)}
                  className="px-8 py-3.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Start New Live Event
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Permanent QR Code Hub (1 col) */}
          <div className="space-y-6">
            <div className="glass-card-gold p-6 rounded-3xl border border-[#D4AF37]/40 shadow-2xl text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                Permanent Table Card QR
              </span>
              <h3 className="font-serif font-bold text-white text-lg">
                Universal Live QR Code
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Print this QR code on table cards, easels, and guest invites. It never expires or changes.
              </p>

              {qrData?.qrDataUrl && (
                <div className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-inner">
                  <img
                    src={qrData.qrDataUrl}
                    alt="5Star Permanent QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-[#F5E6C8] break-all">
                {qrData?.liveUrl || `${getShareBaseUrl()}/live`}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={copyQrLink}
                  className="py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold uppercase tracking-wider hover:border-[#D4AF37] flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Copy Link
                </button>
                {qrData?.qrDataUrl && (
                  <a
                    href={qrData.qrDataUrl}
                    download="5Star_Permanent_Event_QR.png"
                    className="py-2.5 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" /> Save PNG
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Archived Events Tab */
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-800">
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              Past Archived Live Events ({archives.length})
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              When an event is ended, all its photographs and sequence records are permanently preserved in MongoDB Atlas GridFS.
            </p>

            {archives.length === 0 ? (
              <p className="text-zinc-500 text-xs py-8 text-center">No past archived events found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archives.map((arch) => (
                  <div
                    key={arch._id}
                    onClick={() => openArchivePhotos(arch)}
                    className="p-6 rounded-2xl glass-card border border-zinc-800 hover:border-[#D4AF37] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#D4AF37] mb-2 font-semibold">
                        <span>{arch.category}</span>
                        <span className="text-zinc-500 font-mono">Archived</span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-white mb-2 leading-snug">
                        {arch.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{new Date(arch.startedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{arch.photoCount || 0} Photographs</span>
                      </div>
                    </div>

                    <button className="w-full py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 text-xs font-semibold uppercase tracking-wider">
                      Inspect Archived Photos
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archived Photos Modal */}
          {selectedArchive && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-4xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => setSelectedArchive(null)}
                  className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-serif font-bold text-white mb-1">
                  {selectedArchive.name} (Archived)
                </h2>
                <span className="text-xs text-zinc-400 block mb-6">
                  {archivePhotos.length} permanent photos in MongoDB Atlas GridFS
                </span>

                {loadingArchivePhotos ? (
                  <div className="text-center py-16 text-zinc-500 text-xs">Loading photos...</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto">
                    {archivePhotos.map((p) => (
                      <div
                        key={p._id}
                        className="rounded-xl overflow-hidden glass-card border border-zinc-800 aspect-square relative"
                      >
                        <img
                          src={getMediaUrl(p.gridFsFileId)}
                          alt={p.formattedSequence}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-[#F5E6C8]">
                          #{p.formattedSequence}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Start New Event */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative">
            <button
              onClick={() => setIsStartModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Launch Live Event
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Only one live event is active at a time. Guests scanning the permanent QR code will immediately be directed to this new feed.
            </p>

            <form onSubmit={handleStartEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  placeholder="e.g. Ananya & Siddharth Wedding Reception"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  required
                  placeholder="e.g. Wedding Reception, Sangeet Night, Birthday"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Optional Description
                </label>
                <textarea
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Venue or celebratory notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={starting}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-bold uppercase text-xs shadow hover:opacity-90 disabled:opacity-50"
                >
                  {starting ? 'Starting...' : 'Commence Live Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Photos to Active Event */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative">
            <button
              onClick={() => !uploading && setIsUploadModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-2">
              Transmit Live Photographs
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Photos uploaded here will instantly be assigned sequential IDs (e.g. 000001, 000002) and will appear on the guest live feed.
            </p>

            <form onSubmit={handleUploadPhotos} className="space-y-4 text-xs">
              <div className="p-8 border-2 border-dashed border-zinc-700 hover:border-[#D4AF37] rounded-2xl text-center cursor-pointer bg-zinc-950">
                <Camera className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-zinc-200 font-semibold block mb-1">
                    Select camera images for live broadcast
                  </span>
                  <span className="text-zinc-500 text-[11px] block">
                    Supported formats: JPG, JPEG, PNG, WebP
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <strong className="text-white block mb-1">{selectedFiles.length} images selected:</strong>
                  <ul className="max-h-24 overflow-y-auto space-y-1 text-[11px] text-zinc-400">
                    {Array.from(selectedFiles).map((f, i) => (
                      <li key={i} className="truncate">• {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Streaming to MongoDB Atlas GridFS...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gold-gradient transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFiles || selectedFiles.length === 0}
                  className="px-6 py-2 rounded-xl bg-gold-gradient text-black font-bold uppercase text-xs shadow hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? `Uploading (${uploadProgress}%)` : 'Broadcast Photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
