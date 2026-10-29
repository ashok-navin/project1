import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, FacebookIcon } from '../components/SocialIcons';
import { contactApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ContactUs() {
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await contactApi.submit(data);
      if (res.data?.success) {
        success('Thank you! Your message has been sent to our studio coordinator.');
        reset();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Connect With Our Directors
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mt-2 mb-4">
            Contact &amp; Studio Inquiries
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Have questions about wedding availability, cinematic packages, or destination coverage? Reach out through the form below or contact our Hyderabad studio directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-2 glass-card p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" /> Send Us a Direct Message
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    placeholder="e.g. Rahul Varma"
                  />
                  {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    {...register('mobile', { required: 'Phone is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                  {errors.mobile && <p className="text-rose-400 text-xs mt-1">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                    placeholder="e.g. Wedding Inquiry for December 2026"
                  />
                  {errors.subject && <p className="text-rose-400 text-xs mt-1">{errors.subject.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={5}
                  {...register('message', { required: 'Message is required' })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
                  placeholder="Share details regarding your event dates, cities, and photography vision..."
                ></textarea>
                {errors.message && <p className="text-rose-400 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Sending Message...' : 'Transmit Message to Studio'}
                {!submitting && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Right Column: Studio Information */}
          <div className="space-y-6">
            <div className="glass-card-gold p-8 rounded-3xl border border-[#D4AF37]/40 shadow-2xl space-y-6">
              <h3 className="font-serif font-bold text-white text-xl border-b border-zinc-800 pb-3">
                5Star Studio Headquarters
              </h3>

              <div className="space-y-4 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Physical Studio Address:</strong>
                    <span>Studio 5, Luxury Arts Enclave, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <strong className="text-white block mb-0.5">Telephone &amp; WhatsApp:</strong>
                    <a href="tel:+919876543210" className="hover:text-[#D4AF37] transition-colors">+91 98765 43210</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <strong className="text-white block mb-0.5">Official Inquiries:</strong>
                    <a href="mailto:contact@5starcinematography.com" className="hover:text-[#D4AF37] transition-colors">contact@5starcinematography.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Consultation Hours:</strong>
                    <span>Tuesday – Sunday: 10:00 AM – 8:00 PM IST<br />(Mondays reserved for post-production grading)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
                  Follow Our Productions
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  >
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
