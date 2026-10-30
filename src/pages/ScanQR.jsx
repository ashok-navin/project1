import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Upload,
  AlertTriangle,
  QrCode,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ScanQR() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [externalPrompt, setExternalPrompt] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const handleQrDecoded = (decodedText) => {
    // Stop scanner
    stopScanner();

    // Check if the URL points to our live sharing endpoint (/live)
    const currentOrigin = window.location.origin;
    if (decodedText.startsWith(currentOrigin) || decodedText.includes('/live')) {
      success('Permanent Live Event QR Code detected! Redirecting...');
      setTimeout(() => {
        navigate('/live');
      }, 800);
    } else if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
      // External URL security requirement: show destination and ask confirmation
      setExternalPrompt(decodedText);
      warning('External QR Code detected. Confirmation required.');
    } else {
      setScanResult(decodedText);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setExternalPrompt(null);
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      setIsScanning(true);

      const qrConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Prefer back camera
        qrConfig,
        (decodedText) => {
          handleQrDecoded(decodedText);
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );
    } catch (err) {
      console.error('Camera Scanner Error:', err);
      setIsScanning(false);
      setCameraError(
        'Camera permission was denied or camera is not available on this device. You can upload a QR image below or open the live stream directly.'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Stop scanner warning:', err);
      }
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-temp');
      const decodedResult = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleQrDecoded(decodedResult);
    } catch (err) {
      error('Could not detect a valid QR code in this image. Please ensure the QR code is clearly visible.');
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, []);

  return (
    <div className="pt-28 pb-24 bg-[#09090b] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1811] border border-[#D4AF37]/40 text-[#F5E6C8] text-xs font-semibold uppercase tracking-wider mb-3">
            <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" /> Guest Photo Access
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Scan &amp; Download Photos
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Scan the permanent 5Star Cinematography table QR code using your phone camera to view and download original-quality photographs right now.
          </p>
        </div>

        {/* Scanner Card */}
        <div className="glass-card-gold p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/30 shadow-2xl mb-8">
          {/* External Confirmation Modal/Warning */}
          {externalPrompt && (
            <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-600/50 mb-6 text-left">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                External URL Confirmation
              </div>
              <p className="text-xs text-zinc-300 mb-3">
                This QR code points to an external destination outside of 5Star Cinematography:
              </p>
              <div className="p-3 bg-black/60 rounded-xl font-mono text-xs text-amber-200 break-all mb-4 border border-zinc-800">
                {externalPrompt}
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={externalPrompt}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  Visit Destination <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setExternalPrompt(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 text-rose-200 text-xs leading-relaxed mb-6 flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Camera Notice</p>
                <p>{cameraError}</p>
              </div>
            </div>
          )}

          {/* Live Scanner Viewport */}
          <div className="max-w-md mx-auto mb-8">
            <div
              id="qr-reader"
              className={`overflow-hidden rounded-2xl border-2 border-[#D4AF37]/50 bg-black min-h-[280px] flex items-center justify-center relative ${!isScanning ? 'hidden' : ''
                }`}
            ></div>

            {/* Hidden temp element for file scanning */}
            <div id="qr-reader-temp" className="hidden"></div>

            {!isScanning && (
              <div className="p-12 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#1c1811] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4">
                  <Camera className="w-10 h-10" />
                </div>
                <h3 className="text-white font-serif font-bold text-lg mb-1">Camera Scanner Ready</h3>
                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                  Point your camera at the table QR code to open event photographs instantly.
                </p>

                <button
                  onClick={startScanner}
                  className="px-8 py-4 rounded-full bg-gold-gradient text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Camera Scanner
                </button>
              </div>
            )}

            {isScanning && (
              <div className="text-center mt-4">
                <button
                  onClick={stopScanner}
                  className="px-6 py-2.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs uppercase font-semibold tracking-wider"
                >
                  Stop Camera
                </button>
              </div>
            )}
          </div>

          {/* Alternative File Upload Option */}
          <div className="pt-6 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-400 mb-3">Or upload a photo of the QR code from your gallery:</p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold uppercase tracking-wider hover:border-[#D4AF37] cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Upload QR Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
