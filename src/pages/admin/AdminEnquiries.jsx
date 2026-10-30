import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { contactApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const { success, error } = useToast();

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await contactApi.getAll();
      if (res.data?.success) {
        setEnquiries(res.data.enquiries || []);
      }
    } catch (err) {
      error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await contactApi.updateStatus(id, { status: newStatus });
      if (res.data?.success) {
        success(`Enquiry marked as ${newStatus}`);
        setEnquiries((prev) =>
          prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
        );
        if (activeEnquiry && activeEnquiry._id === id) {
          setActiveEnquiry({ ...activeEnquiry, status: newStatus });
        }
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Client Website Inquiries
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review incoming contact inquiries, questions, and message logs ({enquiries.length} total).
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-24 text-zinc-500 text-sm">Loading inquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 text-sm">No website inquiries logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121217] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Date Received</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {enquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <strong className="text-white block">{enq.name}</strong>
                      <span className="text-zinc-400 block">{enq.email}</span>
                      <span className="text-zinc-500 text-[11px] block">{enq.mobile}</span>
                    </td>
                    <td className="p-4 text-zinc-200 font-medium max-w-xs truncate">
                      {enq.subject}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <select
                        value={enq.status || 'New'}
                        onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase bg-zinc-900 border border-zinc-700 text-[#F5E6C8] focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveEnquiry(enq)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold hover:border-[#D4AF37]"
                      >
                        Read Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry View Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-card p-6 sm:p-8 rounded-3xl border border-zinc-700 shadow-2xl relative">
            <button
              onClick={() => setActiveEnquiry(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
              Website Inquiry Details
            </span>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              {activeEnquiry.subject}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">From:</span>
                  <span className="text-white font-semibold">{activeEnquiry.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email:</span>
                  <a href={`mailto:${activeEnquiry.email}`} className="text-[#D4AF37] underline">
                    {activeEnquiry.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mobile:</span>
                  <a href={`tel:${activeEnquiry.mobile}`} className="text-[#D4AF37] underline">
                    {activeEnquiry.mobile}
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-1.5 font-semibold">Message Body:</span>
                <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {activeEnquiry.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-400">Current Status:</span>
                <select
                  value={activeEnquiry.status || 'New'}
                  onChange={(e) => handleStatusChange(activeEnquiry._id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-zinc-900 border border-zinc-700 text-[#F5E6C8]"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
