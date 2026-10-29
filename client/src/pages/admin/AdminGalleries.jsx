import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  PlusCircle,
  Upload,
  Trash2,
  Edit2,
  Lock,
  Globe,
  Share2,
  Play,
  X,
  RefreshCw,
  Film,
  Camera,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { galleryApi, getMediaUrl, getShareBaseUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const categories = [
  'Wedding Photography',
  'Reception',
  'Pre-Wedding Shoot',
  'Engagement',
  'Cinematic Trailers',
  'Birthday Events',
  'Baby Shower',
  'Corporate Events',
  'Other Events'
];

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState([]);
  const [filterVisibility, setFilterVisibility] = useState('All'); // 'All', 'Public', 'Private'
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Folder Create/Edit Modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderTitle, setFolderTitle] = useState('');
  const [folderCategory, setFolderCategory] = useState(categories[0]);
  const [folderDescription, setFolderDescription] = useState('');
  const [folderVisibility, setFolderVisibility] = useState('Public');
  const [folderCustomToken, setFolderCustomToken] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [savingFolder, setSavingFolder] = useState(false);

  // Regenerate Token Prompt Modal
  const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
  const [regenCustomWord, setRegenCustomWord] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Upload Media Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const { success, error, warning } = useToast();

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      // Use getAllAdmin to fetch BOTH Public and Private galleries
      const res = await galleryApi.getAllAdmin();
      if (res.data?.success) {
        setGalleries(res.data.galleries || []);
      }
    } catch (err) {
      error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const openFolderDetail = async (gal) => {
    setSelectedGallery(gal);
    setLoadingMedia(true);
    try {
      const res = await galleryApi.getAdminById(gal._id);
      if (res.data?.success) {
        setGalleryMedia(res.data.media || []);
      }
    } catch (err) {
      error('Failed to load gallery media');
    } finally {
      setLoadingMedia(false);
    }
  };

  const openCreateFolder = () => {
    setEditingFolder(null);
    setFolderTitle('');
    setFolderCategory(categories[0]);
    setFolderDescription('');
    setFolderVisibility('Public');
    setFolderCustomToken('');
    setCoverFile(null);
    setIsFolderModalOpen(true);
  };

  const openEditFolder = (gal) => {
    setEditingFolder(gal);
    setFolderTitle(gal.title);
    setFolderCategory(gal.category);
    setFolderDescription(gal.description || '');
    setFolderVisibility(gal.visibility || 'Public');
    setFolderCustomToken(gal.privateAccessToken || '');
    setCoverFile(null);
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderTitle) {
      error('Title is required.');
      return;
    }

    setSavingFolder(true);
    try {
      const formData = new FormData();
      formData.append('title', folderTitle);
      formData.append('category', folderCategory);
      formData.append('description', folderDescription);
      formData.append('visibility', folderVisibility);
      if (folderCustomToken) {
        formData.append('customToken', folderCustomToken);
      }
      if (coverFile) formData.append('coverImage', coverFile);

      if (editingFolder) {
        const res = await galleryApi.update(editingFolder._id, formData);
        if (res.data?.success) {
          success('Gallery folder updated.');
          setIsFolderModalOpen(false);
          fetchGalleries();
          if (selectedGallery?._id === editingFolder._id) {
            setSelectedGallery(res.data.gallery);
          }
        }
      } else {
        const res = await galleryApi.create(formData);
        if (res.data?.success) {
          success('Gallery folder created in MongoDB.');
          setIsFolderModalOpen(false);
          fetchGalleries();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save folder');
    } finally {
      setSavingFolder(false);
    }
  };

  const handleDeleteFolder = async (galId) => {
    if (!window.confirm('Are you sure you want to delete this entire gallery and clean up all its media files from GridFS?')) return;

    try {
      const res = await galleryApi.delete(galId);
      if (res.data?.success) {
        success('Gallery folder and media permanently deleted.');
        setGalleries((prev) => prev.filter((g) => g._id !== galId));
        if (selectedGallery?._id === galId) {
          setSelectedGallery(null);
          setGalleryMedia([]);
        }
      }
    } catch (err) {
      error('Failed to delete gallery');
    }
  };

  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) {
      error('Please select media files to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('media', uploadFiles[i]);
      }

      const res = await galleryApi.uploadMedia(selectedGallery._id, formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data?.success) {
        success(`Successfully uploaded ${res.data.media?.length} file(s) into GridFS!`);
        setIsUploadModalOpen(false);
        setUploadFiles([]);
        setUploadProgress(0);
        openFolderDetail(selectedGallery);
        fetchGalleries();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMediaItem = async (mediaId) => {
    if (!window.confirm('Delete this media file from GridFS?')) return;

    try {
      const res = await galleryApi.deleteMedia(selectedGallery._id, mediaId);
      if (res.data?.success) {
        success('Media item removed.');
        setGalleryMedia((prev) => prev.filter((m) => m._id !== mediaId));
      }
    } catch (err) {
      error('Failed to delete media item');
    }
  };

  const handleExecuteRegenerateToken = async (e) => {
    e.preventDefault();
    if (!selectedGallery) return;

    setRegenerating(true);
    try {
      const res = await galleryApi.regenerateToken(selectedGallery._id, regenCustomWord);
      if (res.data?.success) {
        success('New short private access link generated!');
        setSelectedGallery({
          ...selectedGallery,
          privateAccessToken: res.data.privateAccessToken,
          visibility: 'Private'
        });
        setIsRegenModalOpen(false);
        setRegenCustomWord('');
        fetchGalleries();
      }
    } catch (err) {
      error('Failed to regenerate private link');
    } finally {
      setRegenerating(false);
    }
  };

  const copyPrivateLink = (token) => {
    const url = `${getShareBaseUrl()}/gallery/private/${token}`;
    navigator.clipboard.writeText(url);
    success(`Private link copied: ${url}`);
  };

  // Filtered galleries by visibility
  const filteredGalleries = galleries.filter((g) => {
    if (filterVisibility === 'All') return true;
    return g.visibility === filterVisibility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Gallery &amp; Media Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage public portfolios and private client galleries with short custom links in MongoDB Atlas GridFS.
          </p>
        </div>

        <button
          onClick={openCreateFolder}
          className="px-5 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:opacity-90"
        >
          <PlusCircle className="w-4 h-4" /> Create Gallery Folder
        </button>
      </div>

      {/* Visibility Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        {['All', 'Public', 'Private'].map((v) => (
          <button
            key={v}
            onClick={() => setFilterVisibility(v)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              filterVisibility === v
                ? 'bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {v === 'All' ? `All Folders (${galleries.length})` : `${v} (${galleries.filter(g => g.visibility === v).length})`}
          </button>
        ))}
      </div>

      {/* Main View: Left Gallery Folders List, Right Media Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Folders List (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
              {filterVisibility} Folders ({filteredGalleries.length})
            </h2>
            <button onClick={fetchGalleries} className="text-zinc-400 hover:text-white" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-500 text-xs">Loading folders...</div>
          ) : filteredGalleries.length === 0 ? (
            <p className="text-zinc-500 text-xs py-8 text-center">No {filterVisibility.toLowerCase()} folders found.</p>
          ) : (
            filteredGalleries.map((gal) => {
              const isSelected = selectedGallery?._id === gal._id;
              const isPrivate = gal.visibility === 'Private';

              return (
                <div
                  key={gal._id}
                  onClick={() => openFolderDetail(gal)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#1a1710]'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                      {gal.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${
                        isPrivate ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                      {gal.visibility}
                    </span>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-white mb-2 leading-snug truncate">
                    {gal.title}
                  </h3>

                  {isPrivate && gal.privateAccessToken && (
                    <div className="text-[10px] font-mono text-amber-300/90 mb-2 truncate bg-black/40 p-1 rounded border border-zinc-800">
                      link: {getShareBaseUrl()}/gallery/private/{gal.privateAccessToken}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                    <span>{gal.mediaCount || 0} Media Items</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFolder(gal);
                        }}
                        className="text-zinc-400 hover:text-[#D4AF37]"
                        title="Edit Folder"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(gal._id);
                        }}
                        className="text-zinc-400 hover:text-rose-400"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Media Inspector (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-zinc-800">
          {!selectedGallery ? (
            <div className="text-center py-24">
              <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-white text-base mb-1">No Folder Selected</h3>
              <p className="text-xs text-zinc-400">
                Select any public or private gallery folder on the left to inspect, upload, or manage photos and videos.
              </p>
            </div>
          ) : (
            <div>
              {/* Folder Inspector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      {selectedGallery.category}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-xs text-zinc-400">{galleryMedia.length} Media Files</span>
                    {selectedGallery.visibility === 'Private' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private Gallery
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-white">
                    {selectedGallery.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Media
                  </button>

                  {selectedGallery.visibility === 'Private' && selectedGallery.privateAccessToken && (
                    <button
                      onClick={() => copyPrivateLink(selectedGallery.privateAccessToken)}
                      className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold uppercase tracking-wider hover:border-[#D4AF37] flex items-center gap-1"
                      title="Copy Short Private Link"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Copy Private Link
                    </button>
                  )}
                </div>
              </div>

              {/* Private Token Banner if Private */}
              {selectedGallery.visibility === 'Private' && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/50 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <strong className="text-white">Private Client Showcase</strong>
                    </div>
                    <div className="font-mono text-[11px] text-[#F5E6C8] bg-black/50 px-2 py-1 rounded inline-block">
                      {getShareBaseUrl()}/gallery/private/{selectedGallery.privateAccessToken}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => copyPrivateLink(selectedGallery.privateAccessToken)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-semibold hover:bg-amber-500/30 transition-colors"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => {
                        setRegenCustomWord(selectedGallery.privateAccessToken || '');
                        setIsRegenModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-amber-700/50 text-amber-200 hover:text-white transition-colors"
                    >
                      Change Word / Slug
                    </button>
                  </div>
                </div>
              )}

              {/* Media Items Grid */}
              {loadingMedia ? (
                <div className="text-center py-20 text-zinc-500 text-xs">Loading media files...</div>
              ) : galleryMedia.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl p-8">
                  <Upload className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-xs mb-4">No photos or videos uploaded to this folder yet.</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase"
                  >
                    Upload Photographs or Videos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryMedia.map((m) => {
                    const isVideo = m.mediaType === 'video';
                    const mediaSrc = getMediaUrl(m.gridFsFileId);

                    return (
                      <div
                        key={m._id}
                        className="group relative rounded-2xl overflow-hidden glass-card border border-zinc-800 hover:border-zinc-600 aspect-square"
                      >
                        {isVideo ? (
                          <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative">
                            <video src={mediaSrc} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={mediaSrc}
                            alt={m.originalFilename}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}

                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-zinc-300">
                          #{m.sequenceNumber}
                        </div>

                        {/* Delete button on hover */}
                        <button
                          onClick={() => handleDeleteMediaItem(m._id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-950"
                          title="Delete from GridFS"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black text-[10px] text-zinc-300 truncate">
                          {m.originalFilename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Create / Edit Folder with Short Link Word Support */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative">
            <button
              onClick={() => setIsFolderModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-serif font-bold text-white mb-6">
              {editingFolder ? 'Edit Gallery Folder' : 'Create Gallery Folder'}
            </h2>

            <form onSubmit={handleSaveFolder} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Folder Title *
                </label>
                <input
                  type="text"
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  required
                  placeholder="e.g. Royal Heritage Wedding: Arjun & Meera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={folderCategory}
                  onChange={(e) => setFolderCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="Optional notes or venue backdrop details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Visibility
                </label>
                <select
                  value={folderVisibility}
                  onChange={(e) => setFolderVisibility(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Public">Public (Visible in Portfolio to all visitors)</option>
                  <option value="Private">Private (Accessible only via short private link)</option>
                </select>
              </div>

              {/* Custom Extra Word / Short Link Slug */}
              {folderVisibility === 'Private' && (
                <div className="p-3 rounded-xl bg-[#1c1811] border border-[#D4AF37]/30 space-y-1">
                  <label className="block text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
                    Custom Short Private Link Word / Slug (Optional)
                  </label>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                    <span>/gallery/private/</span>
                    <input
                      type="text"
                      value={folderCustomToken}
                      onChange={(e) => setFolderCustomToken(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="e.g. arjun-meera or vip26"
                      className="flex-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-[#F5E6C8] font-bold focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Enter a clean extra word (e.g. client name). If empty, a short 6-character code (e.g. p-8x2k1a) is used instead of a long string.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Upload Cover Image to GridFS
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="w-full text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFolder}
                  className="px-6 py-2 rounded-xl bg-gold-gradient text-black font-bold uppercase text-xs shadow hover:opacity-90 disabled:opacity-50"
                >
                  {savingFolder ? 'Saving...' : editingFolder ? 'Save Changes' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Change/Regenerate Private Link Slug */}
      {isRegenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative">
            <button
              onClick={() => setIsRegenModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#D4AF37]" /> Set Private Link Word
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Enter a short extra word or custom name for this private gallery link:
            </p>

            <form onSubmit={handleExecuteRegenerateToken} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold uppercase mb-1">
                  Private Link Path
                </label>
                <div className="flex items-center gap-1.5 font-mono text-zinc-400 bg-zinc-900 p-2 rounded-xl border border-zinc-700">
                  <span className="text-zinc-500">/gallery/private/</span>
                  <input
                    type="text"
                    value={regenCustomWord}
                    onChange={(e) => setRegenCustomWord(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. arjun-meera"
                    className="flex-1 bg-transparent text-[#F5E6C8] font-bold focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Leave empty to generate a random short 6-char code.
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegenModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regenerating}
                  className="px-6 py-2 rounded-xl bg-gold-gradient text-black font-bold uppercase text-xs shadow hover:opacity-90 disabled:opacity-50"
                >
                  {regenerating ? 'Saving...' : 'Apply Short Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Batch Upload Media to GridFS */}
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
              Upload to: {selectedGallery?.title}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Select multiple photographs (JPG, PNG, WebP) or video files (MP4, WebM) to stream directly into MongoDB Atlas GridFS.
            </p>

            <form onSubmit={handleUploadMedia} className="space-y-4 text-xs">
              <div className="p-8 border-2 border-dashed border-zinc-700 hover:border-[#D4AF37] rounded-2xl text-center cursor-pointer bg-zinc-950">
                <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-zinc-200 font-semibold block mb-1">
                    Click to choose media files
                  </span>
                  <span className="text-zinc-500 text-[11px] block">
                    Supported: JPG, PNG, WebP, MP4, WebM
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setUploadFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadFiles && uploadFiles.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <strong className="text-white block mb-1">{uploadFiles.length} files selected:</strong>
                  <ul className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-zinc-400">
                    {Array.from(uploadFiles).map((f, i) => (
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
                  disabled={uploading || !uploadFiles || uploadFiles.length === 0}
                  className="px-6 py-2 rounded-xl bg-gold-gradient text-black font-bold uppercase text-xs shadow hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? `Uploading (${uploadProgress}%)` : 'Start GridFS Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
