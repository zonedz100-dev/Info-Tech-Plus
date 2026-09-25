import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Receipt, 
  Palette, 
  Trash2, 
  Database, 
  Sliders, 
  Image as ImageIcon,
  Key,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { InfoTechLogo } from '../common/InfoTechLogo';
import { 
  uploadStoreLogoToSupabase, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  isSupabaseConfigured,
  SupabaseConfig 
} from '../../services/supabase';

interface LogoUploaderProps {
  onSuccess?: (newLogoUrl: string) => void;
  className?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ onSuccess, className = '' }) => {
  const { settings, updateSettings } = useApp();

  // Current values
  const currentLogoUrl = settings.logoUrl || '';
  const currentBadgeStyle = settings.logoBadgeStyle || 'glow';

  // Component state
  const [logoUrl, setLogoUrl] = useState<string>(currentLogoUrl);
  const [badgeStyle, setBadgeStyle] = useState<'glow' | 'badge' | 'minimal'>(currentBadgeStyle);
  const [previewMode, setPreviewMode] = useState<'header' | 'dark' | 'receipt'>('header');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Supabase Configuration drawer
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [supabaseConfigSaved, setSupabaseConfigSaved] = useState(false);

  // DOM Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep state in sync with context settings
  useEffect(() => {
    setLogoUrl(settings.logoUrl || '');
    setBadgeStyle(settings.logoBadgeStyle || 'glow');
  }, [settings.logoUrl, settings.logoBadgeStyle]);

  // Clean up camera stream on unmount or camera close
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success', duration = 4000) => {
    setStatusNotification({ type, text });
    setTimeout(() => {
      setStatusNotification(null);
    }, duration);
  };

  // -------------------------------------------------------------
  // Camera Handling (Live MediaDevices Stream)
  // -------------------------------------------------------------
  const startCameraStream = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('الكاميرا غير مدعومة في هذا المتصفح');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(err.message || 'تعذر الوصول إلى الكاميرا. تأكد من منح الصلاحيات.');
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const openCameraModal = async () => {
    setIsCameraOpen(true);
    setCapturedBlob(null);
    setCapturedPreview(null);
    setCameraError(null);
    setTimeout(() => {
      startCameraStream(cameraFacing);
    }, 100);
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedBlob(null);
    setCapturedPreview(null);
    setCameraError(null);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCameraStream(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const minDim = Math.min(width, height);

    // Make it a clean square crop for high-impact store logo
    canvas.width = minDim;
    canvas.height = minDim;

    const startX = (width - minDim) / 2;
    const startY = (height - minDim) / 2;

    context.drawImage(video, startX, startY, minDim, minDim, 0, 0, minDim, minDim);

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    setCapturedPreview(dataUrl);

    canvas.toBlob(blob => {
      if (blob) {
        setCapturedBlob(blob);
      }
    }, 'image/png', 0.95);

    stopCameraStream();
  };

  const retakePhoto = () => {
    setCapturedPreview(null);
    setCapturedBlob(null);
    startCameraStream(cameraFacing);
  };

  const confirmCapturedPhoto = async () => {
    if (!capturedBlob && !capturedPreview) return;

    const blobToUpload = capturedBlob || await (await fetch(capturedPreview!)).blob();
    closeCameraModal();
    await processAndUploadBlob(blobToUpload, 'camera-capture');
  };

  // -------------------------------------------------------------
  // File & Image Processing with Supabase Storage
  // -------------------------------------------------------------
  const processAndUploadBlob = async (blob: Blob, prefix: string = 'logo') => {
    setIsUploading(true);
    setUploadProgressMsg('جاري تحضير اللوغو ورفعه إلى Supabase Storage...');

    try {
      const result = await uploadStoreLogoToSupabase(blob, prefix);

      if (result.success) {
        setLogoUrl(result.url);

        // Update Store Configuration in context (Header & app state)
        updateSettings({
          ...settings,
          logoUrl: result.url,
          logoBadgeStyle: badgeStyle
        });

        if (onSuccess) {
          onSuccess(result.url);
        }

        const storageLabel = result.storageType === 'supabase' 
          ? 'سحابة Supabase Storage' 
          : 'التخزين المحلي الآمن';

        showNotification(`تم حفظ وتثبيت لوغو المتجر بنجاح عبر ${storageLabel}! يظهر الآن في الشريط العلوي (Header).`);
      } else {
        showNotification(result.message || 'حدث خطأ أثناء معالجة الشعار', 'error');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      showNotification(err.message || 'فشل رفع الشعار', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgressMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadBlob(file, 'upload');
    }
  };

  const handleNativeCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadBlob(file, 'mobile-camera');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadBlob(file, 'dropzone');
    }
  };

  const applyDirectUrl = (url: string) => {
    if (!url.trim()) return;
    setLogoUrl(url);
    updateSettings({
      ...settings,
      logoUrl: url,
      logoBadgeStyle: badgeStyle
    });
    if (onSuccess) onSuccess(url);
    showNotification('تم تطبيق وتثبيت رابط الشعار بنجاح في إعدادات المتجر والشريط العلوي.');
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    updateSettings({
      ...settings,
      logoUrl: '',
      logoBadgeStyle: badgeStyle
    });
    if (onSuccess) onSuccess('');
    showNotification('تمت إزالة الشعار المخصص واستعادة شارة النظام الافتراضية.');
  };

  const handleBadgeStyleChange = (style: 'glow' | 'badge' | 'minimal') => {
    setBadgeStyle(style);
    updateSettings({
      ...settings,
      logoUrl,
      logoBadgeStyle: style
    });
    showNotification('تم تحديث نمط وبروز الشعار في الشريط العلوي.');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig);
    setSupabaseConfigSaved(true);
    setTimeout(() => setSupabaseConfigSaved(false), 3000);
    showNotification('تم حفظ إعدادات Supabase Storage بنجاح!');
  };

  // Preset Logos (Fast 1-click test with crisp designs)
  const presets = [
    {
      name: 'شارة أنفوتيك الافتراضية',
      url: '',
      desc: 'أيقونة الشاشة الكوانتية الزرقاء الافتراضية',
    },
    {
      name: 'تيك دراغون للألعاب (Gaming Core)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ff0055"/><stop offset="100%" stop-color="%23ff5500"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="%2310111a" stroke="url(%23g)" stroke-width="4"/><polygon points="50,15 62,38 88,42 68,60 74,86 50,72 26,86 32,60 12,42 38,38" fill="url(%23g)"/><path d="M50 30 L55 45 L70 50 L58 60 L62 75 L50 66 L38 75 L42 60 L30 50 L45 45 Z" fill="%23ffffff"/></svg>',
      desc: 'تصميم رياضي فائق للحواسيب الاحترافية',
    },
    {
      name: 'كوانتم سايبر CPU (Cyber Quantum)',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="q" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2300f2fe"/><stop offset="100%" stop-color="%234facfe"/></linearGradient></defs><rect x="12" y="12" width="76" height="76" rx="16" fill="%23060c18" stroke="url(%23q)" stroke-width="4"/><rect x="28" y="28" width="44" height="44" rx="8" fill="url(%23q)" opacity="0.3"/><circle cx="50" cy="50" r="14" fill="%2300f2fe"/><line x1="50" y1="2" x2="50" y2="12" stroke="%2300f2fe" stroke-width="4"/><line x1="50" y1="88" x2="50" y2="98" stroke="%2300f2fe" stroke-width="4"/><line x1="2" y1="50" x2="12" y2="50" stroke="%2300f2fe" stroke-width="4"/><line x1="88" y1="50" x2="98" y2="50" stroke="%2300f2fe" stroke-width="4"/></svg>',
      desc: 'هوية تقنية حديثة عالية التباين',
    }
  ];

  const supabaseReady = isSupabaseConfigured();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notifications Banner */}
      {statusNotification && (
        <div 
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 font-bold shadow-xl animate-in fade-in zoom-in-95 ${
            statusNotification.type === 'success'
              ? 'bg-gradient-to-r from-cyan-950/80 via-emerald-950/60 to-slate-950/80 border-cyan-500/40 text-cyan-200 shadow-cyan-950/30'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{statusNotification.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-gradient-to-b from-[#0C172E] via-[#0E1B34] to-[#0A1224] border-2 border-cyan-500/40 rounded-3xl p-6 lg:p-7 shadow-2xl shadow-black/40 erp-card-glow relative overflow-hidden">
        {/* Luxury Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5 mb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>تحميل وتخصيص لوغو المتجر (LogoUploader)</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  بارز في الشريط العلوي (Header)
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                التقط صورة بالكاميرا أو ارفع ملفاً ليُحفظ في Supabase Storage ويظهر فوراً في شريط النظام العلوي والإيصالات والفواتير
              </p>
            </div>
          </div>

          {/* Supabase Status Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSupabaseConfig(!showSupabaseConfig)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                supabaseReady
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50'
              }`}
              title="انقر لتهيئة سحابة Supabase Storage"
            >
              <Database className={`w-3.5 h-3.5 ${supabaseReady ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span>{supabaseReady ? 'Supabase متصل' : 'تهيئة سحابة Supabase'}</span>
              {showSupabaseConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Optional Supabase Config Accordion */}
        {showSupabaseConfig && (
          <form 
            onSubmit={handleSaveSupabaseConfig}
            className="mb-6 p-4 rounded-2xl bg-[#060D1A]/95 border border-cyan-500/30 space-y-3 relative z-10 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>إعدادات الاتصال بـ Supabase Storage (اختياري / مدعوم تلقائياً)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                يتم الحفظ تلقائياً في التخزين المحلي إذا لم تتوفر مفاتيح سحابية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supabase Project URL:</label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseConfig.url}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                  className="w-full bg-[#040812] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supabase Anon Key:</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={supabaseConfig.anonKey}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                  className="w-full bg-[#040812] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Storage Bucket Name:</label>
                <input
                  type="text"
                  placeholder="store-logos"
                  value={supabaseConfig.bucket}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, bucket: e.target.value })}
                  className="w-full bg-[#040812] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                يمكنك أيضاً تمريرها عبر متغيرات البيئة <code>VITE_SUPABASE_URL</code> و <code>VITE_SUPABASE_ANON_KEY</code>.
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ بيانات Supabase</span>
              </button>
            </div>
            {supabaseConfigSaved && (
              <p className="text-xs text-emerald-400 font-bold">✓ تم حفظ الإعدادات بنجاح وتفعيل العميل السحابي.</p>
            )}
          </form>
        )}

        {/* 2-Column Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Left Column: Upload & Camera Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Action Buttons (Camera vs File) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Live Web Camera Capture */}
              <button
                type="button"
                onClick={openCameraModal}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-cyan-950/60 hover:from-indigo-900/80 hover:to-cyan-900/80 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all flex items-center gap-3.5 text-start group shadow-lg shadow-cyan-500/10"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-cyan-500/20">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-cyan-200">
                    التقاط بالكاميرا مباشرة
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    فتح كاميرا الجهاز، معاينة اللقطة، وقص الشعار وحفظه فوراً
                  </p>
                </div>
              </button>

              {/* Button 2: Native Device Camera / File Picker */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-[#070D18] hover:bg-[#0A1428] border border-slate-700 hover:border-cyan-500/60 transition-all flex items-center gap-3.5 text-start group shadow-md"
              >
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-blue-200">
                    كاميرا الجوال / الاستوديو
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    التقاط صورة مباشرة أو اختيار صورة من المعرض
                  </p>
                </div>
              </button>
            </div>

            {/* Drag and Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden group ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/20 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-cyan-400/70 bg-[#070E1C]/80 hover:bg-[#0A1428]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shadow-lg shadow-cyan-500/10">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="text-sm font-black text-white mb-1">
                اضغط لاختيار ملف لوغو المتجر أو اسحب وأفلت هنا
              </h3>
              <p className="text-xs text-slate-300 max-w-sm font-medium">
                يدعم <strong className="text-cyan-300">PNG الشفاف، SVG، JPG، WebP</strong>
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                يُرفع مباشرة إلى Supabase Storage ويُربط بهوية المتجر
              </p>
            </div>

            {/* Loading Indicator */}
            {isUploading && (
              <div className="p-3.5 bg-cyan-950/80 border border-cyan-500/50 rounded-xl flex items-center gap-3 text-cyan-200 text-xs font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>{uploadProgressMsg || 'جاري معالجة ورفع اللوغو...'}</span>
              </div>
            )}

            {/* Direct URL Input & Badge Style Selector */}
            <div className="bg-[#070E1C]/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">أو أدخل رابط لوغو خارجي مباشر (URL):</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/store-logo.png"
                  className="flex-1 bg-[#050A14] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => applyDirectUrl(logoUrl)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 shrink-0"
                >
                  تطبيق وتثبيت
                </button>
              </div>

              {/* Badge Glow & Frame Style Controls */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>بروز الشعار في الشريط العلوي:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'glow', label: 'توهج نيون أزرق (بارز)' },
                    { id: 'badge', label: 'درع ذهبي ملكي' },
                    { id: 'minimal', label: 'إطار ناعم كلاسيكي' }
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleBadgeStyleChange(style.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        badgeStyle === style.id
                          ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset/Remove Action */}
              {logoUrl && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">الشعار المخصص نشط حالياً</span>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إزالة الشعار واستعادة الافتراضي</span>
                  </button>
                </div>
              )}
            </div>

            {/* Ready-to-use Presets for Quick Testing */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>شعارات جاهزة للاختبار الفوري:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLogoUrl(preset.url);
                      updateSettings({
                        ...settings,
                        logoUrl: preset.url,
                        logoBadgeStyle: badgeStyle
                      });
                      if (onSuccess) onSuccess(preset.url);
                      showNotification(`تم تطبيق "${preset.name}" بنجاح!`);
                    }}
                    className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                      logoUrl === preset.url
                        ? 'bg-cyan-500/20 border-cyan-400/70 shadow-md shadow-cyan-500/10'
                        : 'bg-[#070E1C]/80 border-slate-700/70 hover:border-cyan-500/40 hover:bg-[#0A1428]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      <InfoTechLogo size="sm" showText={false} customLogoUrl={preset.url} badgeStyle={badgeStyle} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{preset.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Header & System Previews (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Preview Selector Header */}
            <div className="flex items-center justify-between bg-[#060C18]/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => setPreviewMode('header')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  previewMode === 'header'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>الشريط العلوي (Header)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('dark')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  previewMode === 'dark'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>شعار مكبّر</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('receipt')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  previewMode === 'receipt'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>إيصال حراري</span>
              </button>
            </div>

            {/* Preview Viewport */}
            {previewMode === 'header' && (
              <div className="bg-[#050B16] border border-cyan-500/30 rounded-2xl p-4 space-y-3 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono font-bold pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    معاينة حية ومباشرة للشريط العلوي (Header Live Preview)
                  </span>
                  <span>h-14 sticky header</span>
                </div>

                {/* Simulated Header Component */}
                <div className="h-14 border border-slate-700/80 rounded-xl bg-gradient-to-r from-[#070D19]/95 via-[#0B152A]/90 to-[#080E1D]/95 px-3 flex items-center justify-between shadow-lg">
                  {/* Brand Wordmark with Logo */}
                  <InfoTechLogo 
                    size="md" 
                    showText={true} 
                    customLogoUrl={logoUrl} 
                    badgeStyle={badgeStyle} 
                  />

                  {/* Header Simulated Tools */}
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700/60 text-[10px] text-cyan-300 font-mono hidden sm:block">
                      الفرع الرئيسي
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                      DZ
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  هكذا سيظهر الشعار لكل المستخدمين في أعلى الشاشة الرئيسية (Header) بجانب اسم المتجر، مع توهج ناعم يعكس الفخامة والاحترافية.
                </p>
              </div>
            )}

            {previewMode === 'dark' && (
              <div className="bg-[#050B16] border border-slate-700/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[220px]">
                <InfoTechLogo 
                  size="xl" 
                  showText={true} 
                  customLogoUrl={logoUrl} 
                  badgeStyle={badgeStyle} 
                />
                <div className="text-xs text-slate-400 max-w-xs font-mono">
                  {logoUrl ? 'شعار مخصص نشط بدقة عالية' : 'شعار أنفوتيك الافتراضي المدمج'}
                </div>
              </div>
            )}

            {previewMode === 'receipt' && (
              <div className="bg-slate-100 text-slate-900 p-5 rounded-2xl shadow-xl font-mono text-center space-y-2 border border-slate-300">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-300 pb-1">
                  80mm Thermal Receipt Preview
                </div>
                
                {/* Receipt Thermal Header with Monochrome Logo */}
                {logoUrl ? (
                  <div className="w-16 h-16 mx-auto my-2 rounded border border-slate-400 p-1 flex items-center justify-center bg-white">
                    <img 
                      src={logoUrl} 
                      alt="Store Logo" 
                      className="max-h-full max-w-full object-contain filter grayscale contrast-200" 
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 mx-auto my-2 rounded border-2 border-slate-800 flex items-center justify-center font-black text-slate-900 text-lg">
                    TP
                  </div>
                )}

                <div className="font-bold text-sm text-slate-900">{settings.storeNameAr}</div>
                <div className="text-[11px] text-slate-600">{settings.storeName}</div>
                <div className="text-[10px] text-slate-500">{settings.phone}</div>
                <div className="text-[9px] border-t border-dashed border-slate-400 pt-1 text-slate-400">
                  *** فاتورة مبيعات معتمدة ***
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>مواصفات الشعار المثالي:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>يُفضل استخدام صورة مربعة (1:1) بخلفية شفافة (PNG أو SVG).</li>
                <li>تتم المزامنة والتحديث الفوري في شريط الهيدر، الفواتير، ونقطة البيع.</li>
                <li>في حال تعذر الوصول إلى سحابة Supabase، يتم التخزين التلقائي محلياً لضمان عدم توقف العمل.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LIVE CAMERA CAPTURE MODAL (viewfinder with crop & snap)  */}
      {/* ========================================================= */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0B1528] border-2 border-cyan-500/50 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-[#080E1C]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>التقاط لوغو المتجر عبر الكاميرا</span>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewfinder Area */}
            <div className="relative bg-black flex items-center justify-center min-h-[360px] max-h-[420px] overflow-hidden">
              {/* Error state */}
              {cameraError ? (
                <div className="p-6 text-center text-rose-300 space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <p className="text-sm font-bold">{cameraError}</p>
                  <p className="text-xs text-slate-400">
                    يمكنك استخدام زر "كاميرا الجوال / الاستوديو" كبديل مباشر.
                  </p>
                  <button
                    type="button"
                    onClick={() => startCameraStream(cameraFacing)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : capturedPreview ? (
                /* Snapshot Captured Preview */
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                  <img
                    src={capturedPreview}
                    alt="Captured store logo"
                    className="max-h-[300px] max-w-[300px] object-contain rounded-2xl border-2 border-cyan-400 shadow-2xl"
                  />
                  <span className="text-xs text-cyan-300 font-bold mt-2">
                    معاينة اللقطة الملتقطة للشعار
                  </span>
                </div>
              ) : (
                /* Live Video Feed with Viewfinder Target Grid */
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Square target box */}
                  <div className="absolute w-64 h-64 border-2 border-dashed border-cyan-400/80 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-full">
                      ضع الشعار في هذا المربع
                    </span>
                  </div>
                </div>
              )}

              {/* Hidden canvas for snapshot rendering */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#080E1C] border-t border-slate-700 flex items-center justify-between gap-3">
              {capturedPreview ? (
                /* Post-Capture Confirmation Controls */
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة الالتقاط</span>
                  </button>
                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد وحفظ في Supabase</span>
                  </button>
                </>
              ) : (
                /* Live Capture Controls */
                <>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="تبديل الكاميرا (أمامية / خلفية)"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">تبديل الكاميرا</span>
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={Boolean(cameraError)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>التقاط الشعار الآن</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCameraModal}
                    className="px-3 py-2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    إلغاء
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
