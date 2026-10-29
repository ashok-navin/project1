import React, { useState, useEffect } from 'react';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  Camera
} from 'lucide-react';
import { packageApi, formatINR, getMediaUrl } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const { success, error } = useToast();

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await packageApi.getPackages();
      if (res.data?.success) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setEditingPkg(null);
    setName('');
    setDescription('');
    setPrice('');
    setFeaturesText('');
    setIsActive(true);
    setIsFeatured(false);
    setCoverFile(null);
    setCoverImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setDescription(pkg.description);
    setPrice(pkg.price);
    setFeaturesText(pkg.features?.join('\n') || '');
    setIsActive(pkg.isActive);
    setIsFeatured(pkg.isFeatured);
    setCoverFile(null);
    setCoverImageUrl(pkg.coverImageUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (pkgId) => {
    if (!window.confirm('Are you sure you want to delete this photography package?')) return;

    try {
      const res = await packageApi.deletePackage(pkgId);
      if (res.data?.success) {
        success('Package deleted successfully.');
        setPackages((prev) => prev.filter((p) => p._id !== pkgId));
      }
    } catch (err) {
      error('Failed to delete package');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price) {
      error('Name, description, and price are required.');
      return;
    }

    setSaving(true);
    try {
      const parsedFeatures = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('features', JSON.stringify(parsedFeatures));
      formData.append('isActive', isActive);
      formData.append('isFeatured', isFeatured);
      if (coverImageUrl) formData.append('coverImageUrl', coverImageUrl);
      if (coverFile) formData.append('coverImage', coverFile);

      if (editingPkg) {
        const res = await packageApi.updatePackage(editingPkg._id, formData);
        if (res.data?.success) {
          success('Package updated successfully.');
          setIsModalOpen(false);
          fetchPackages();
        }
      } else {
        const res = await packageApi.createPackage(formData);
        if (res.data?.success) {
          success('Package created successfully.');
          setIsModalOpen(false);
          fetchPackages();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Photography Packages Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure public studio packages, INR pricing (₹), cover artwork, and deliverable highlights.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:opacity-90"
        >
          <PlusCircle className="w-4 h-4" /> Add New Package
        </button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-24 text-zinc-500 text-sm">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-sm">No packages configured yet. Click "Add New Package" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`rounded-3xl overflow-hidden glass-card border flex flex-col justify-between transition-all ${
                pkg.isFeatured ? 'border-[#D4AF37]/50' : 'border-zinc-800'
              }`}
            >
              <div>
                {/* Cover Preview */}
                <div className="h-44 w-full bg-zinc-950 overflow-hidden relative">
                  <img
                    src={
                      pkg.coverImageFileId
                        ? getMediaUrl(pkg.coverImageFileId)
                        : pkg.coverImageUrl ||
                          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {pkg.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gold-gradient text-black">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        pkg.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-serif font-bold text-white leading-snug">
                      {pkg.name}
                    </h3>
                  </div>

                  <span className="text-2xl font-extrabold text-[#F5E6C8] block mb-3">
                    {formatINR(pkg.price)}
                  </span>

                  <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-300 mb-4">
                    {pkg.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                    {pkg.features?.length > 3 && (
                      <span className="text-[11px] text-[#D4AF37] font-semibold block">
                        +{pkg.features.length - 3} more deliverables
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 border-t border-zinc-800/80 mt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="flex-1 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-700 text-rose-400 transition-colors"
                  title="Delete Package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-serif font-bold text-white mb-6">
              {editingPkg ? 'Edit Photography Package' : 'Create New Photography Package'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Royal Wedding Collection"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Price in INR (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min={0}
                  placeholder="e.g. 135000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Briefly summarize coverage details, gear, and deliverables..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Included Features / Deliverables (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="4K Cinematic Wedding Film&#10;Lead Senior Candid Photographer&#10;Live Guest QR Distribution&#10;500+ Edited Photos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                ></textarea>
              </div>

              {/* Cover Image Upload (GridFS) */}
              <div>
                <label className="block text-zinc-300 font-semibold uppercase tracking-wider mb-1">
                  Upload Cover Photo to MongoDB GridFS
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#D4AF37] text-zinc-200 cursor-pointer flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{coverFile ? coverFile.name : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  <span className="text-zinc-500 text-[11px]">or specify fallback URL:</span>
                </div>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  <span>Active (Visible on Website)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  <span>Feature as Signature Choice</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-bold uppercase text-xs shadow hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPkg ? 'Update Package' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
