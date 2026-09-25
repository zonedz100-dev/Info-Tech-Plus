import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DatabaseService } from '../services/storage';
import { 
  Settings, 
  Store, 
  Download, 
  Upload, 
  History, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Camera,
  Eye,
  Palette,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { InfoTechLogo } from '../components/common/InfoTechLogo';

// High-Tech Ready-to-Use Vector Logo Presets
const LOGO_PRESETS = [
  {
    id: 'default',
    name: 'شعار أنفوتيك الافتراضي',
    subtitle: 'Cyber Monitor & Circuit',
    url: ''
  },
  {
    id: 'dragon-gaming',
    name: 'تنين الألعاب فائق الأداء',
    subtitle: 'Republic of Gaming Dragon',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" fill="%230F172A" stroke="%23EF4444" stroke-width="3"/><path d="M50 15L62 38L86 38L66 53L74 76L50 61L26 76L34 53L14 38L38 38Z" fill="%23DC2626" stroke="%23F87171" stroke-width="2"/><circle cx="50" cy="48" r="14" fill="%237F1D1D"/><path d="M42 45L50 35L58 45L50 56Z" fill="%23FEF08A"/><circle cx="50" cy="46" r="3" fill="%23DC2626"/></svg>`
  },
  {
    id: 'quantum-chip',
    name: 'معالج الكوانتم الذكي',
    subtitle: 'Quantum AI Microprocessor',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect x="12" y="12" width="76" height="76" rx="16" fill="%230A1128" stroke="%2306B6D4" stroke-width="3"/><rect x="28" y="28" width="44" height="44" rx="8" fill="%23083344" stroke="%2322D3EE" stroke-width="2"/><path d="M50 12V24M50 76V88M12 50H24M76 50H88M34 12V24M66 12V24M34 76V88M66 76V88M12 34H24M12 66H24M76 34H88M76 66H88" stroke="%2306B6D4" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="10" fill="%2306B6D4" fill-opacity="0.3" stroke="%2338BDF8" stroke-width="2"/><path d="M44 50H56M50 44V56" stroke="%23FFFFFF" stroke-width="2.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'hardware-shield',
    name: 'درع العتاد والمحطات الهندسية',
    subtitle: 'Golden Precision Engineering',
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 10L82 24V52C82 72 50 88 50 88C50 88 18 72 18 52V24L50 10Z" fill="%230B132B" stroke="%23F59E0B" stroke-width="3"/><path d="M50 20L74 32V50C74 65 50 78 50 78C50 78 26 65 26 50V32L50 20Z" fill="%231C1917" stroke="%23FBBF24" stroke-width="1.5"/><path d="M38 48L46 56L62 40" stroke="%2310B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="62" r="3" fill="%23F59E0B"/></svg>`
  }
];

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, auditLogs, t, currentUser, refreshAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'store' | 'backup' | 'audit'>('store');
  const [storeNameAr, setStoreNameAr] = useState(settings.storeNameAr);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [taxId, setTaxId] = useState(settings.taxId);
  const [commercialReg, setCommercialReg] = useState(settings.commercialReg);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || '');
  
  // Store Logo States
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || '');
  const [logoBadgeStyle, setLogoBadgeStyle] = useState<'glow' | 'badge' | 'minimal'>(settings.logoBadgeStyle || 'glow');
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState<'dark' | 'receipt'>('dark');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoSuccessMessage, setLogoSuccessMessage] = useState<string | null>(null);

  // Backup state
  const [restoreJson, setRestoreJson] = useState('');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compress & convert uploaded image to Base64 to keep storage clean and fast
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      // If SVG, save directly
      if (file.type.includes('svg')) {
        setLogoUrl(result);
        triggerQuickLogoSave(result);
        return;
      }

      // If bitmap, optimize and resize to max 512x512 via HTML5 Canvas
      const img = new Image();
      img.onload = () => {
        const maxDim = 512;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
          setLogoUrl(compressedDataUrl);
          triggerQuickLogoSave(compressedDataUrl);
        } else {
          setLogoUrl(result);
          triggerQuickLogoSave(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
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
      processImageFile(file);
    }
  };

  const triggerQuickLogoSave = (newLogoUrl: string) => {
    updateSettings({
      ...settings,
      logoUrl: newLogoUrl,
      logoBadgeStyle
    });
    setLogoSuccessMessage('تم تحميل وتثبيت لوغو المتجر بنجاح!');
    setTimeout(() => setLogoSuccessMessage(null), 3500);
  };

  const handleApplyPreset = (presetUrl: string) => {
    setLogoUrl(presetUrl);
    triggerQuickLogoSave(presetUrl);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    triggerQuickLogoSave('');
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      storeNameAr,
      storeName,
      phone,
      email,
      address,
      taxId,
      commercialReg,
      receiptHeader,
      receiptFooter,
      logoUrl,
      logoBadgeStyle
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = DatabaseService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techpulse_backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = () => {
    if (!restoreJson.trim()) return;
    const res = DatabaseService.importFullBackupJSON(restoreJson);
    if (res.success) {
      setBackupMessage('تمت استعادة البيانات بنجاح تام! تم تحديث كافة الجداول والمخزون.');
      setRestoreJson('');
      refreshAllData();
      setTimeout(() => setBackupMessage(null), 5000);
    } else {
      alert(res.error || 'فشلت استعادة النسخة الاحتياطية');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner with Luxury Gradient & Glowing Brand Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-cyan-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <InfoTechLogo size="lg" showText={false} customLogoUrl={logoUrl} badgeStyle={logoBadgeStyle} />
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>إدارة هوية المتجر واللوغو والإعدادات</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                Store Brand & Settings
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              تحميل لوغو المتجر، تخصيص الهوية والترويسة، الفواتير الحرارية، والنسخ الاحتياطي
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-[#070E1C]/90 p-1.5 rounded-xl border border-slate-700/80 relative z-10 shadow-inner">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3.5 py-2 text-xs rounded-lg transition-all font-bold cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'store' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>لوغو وبيانات المتجر</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 text-xs rounded-lg transition-all font-bold cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'backup' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>النسخ الاحتياطي (Backup)</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs rounded-lg transition-all font-bold cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل الرقابة (Audit)</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-md shadow-emerald-950/20 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>تم حفظ الإعدادات وهوية المتجر بنجاح! ستظهر التعديلات فوراً على كافة واجهات النظام والفواتير الحرارية.</span>
        </div>
      )}

      {logoSuccessMessage && (
        <div className="p-3.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/15 border border-cyan-500/40 text-cyan-200 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-md shadow-cyan-950/20 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{logoSuccessMessage}</span>
        </div>
      )}

      {/* Tab: Store Settings & Logo Upload */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          {/* ======================================================== */}
          {/* SECTION 1: PROMINENT STORE LOGO UPLOADER & VISUAL SUITE */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-b from-[#0C172E] via-[#0E1B34] to-[#0A1224] border-2 border-cyan-500/40 rounded-3xl p-6 lg:p-7 shadow-2xl shadow-black/40 erp-card-glow relative overflow-hidden">
            {/* Background luxury glow element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header of Logo Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4 mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>تحميل شعار ولوغو المتجر (Store Brand Logo)</span>
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                      بارز ومتوافق مع الطباعة
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
                    يظهر اللوغو بشكل بارز في شريط النظام العلوي، لوحة التحكم، ونقطة البيع، ويُطبع تلقائياً على الإيصالات الحرارية والفواتير الرسمية A4
                  </p>
                </div>
              </div>

              {/* Preview Toggle (Dark UI / Paper Thermal Receipt) */}
              <div className="flex items-center gap-1.5 bg-[#060C18]/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPreviewMode('dark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === 'dark'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة في النظام</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('receipt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === 'receipt'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>معاينة الإيصال الحراري</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Grid: Upload Dropzone on Left, Live Prominent Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* Left Column: Dropzone & Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[190px] relative overflow-hidden group ${
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

                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shadow-lg shadow-cyan-500/10">
                    <Upload className="w-8 h-8" />
                  </div>

                  <h3 className="text-sm font-black text-white mb-1">
                    اضغط هنا لاختيار لوغو أو اسحب وأفلت الملف
                  </h3>
                  <p className="text-xs text-slate-300 max-w-sm font-medium">
                    يدعم <strong className="text-cyan-300">PNG الشفاف، SVG، JPG، WebP</strong> (يُفضل صورة مربعة بدقة عالية)
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-2">
                    الحد الأقصى الموصى به: 2 ميغابايت · يتم التخزين والتحسين التلقائي
                  </p>
                </div>

                {/* Direct Image URL & Action Buttons */}
                <div className="bg-[#070E1C]/80 border border-slate-700/70 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">أو أدخل رابط صورة مباشر (URL):</span>
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
                      onClick={() => triggerQuickLogoSave(logoUrl)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 shrink-0"
                    >
                      تطبيق الرابط
                    </button>
                  </div>

                  {/* Visual Style Selector */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-cyan-400" />
                      <span>نمط التوهج والشارة:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'glow', label: 'توهج نيون أزرق (موصى به)' },
                        { id: 'badge', label: 'درع ذهبي فخم' },
                        { id: 'minimal', label: 'إطار ناعم كلاسيكي' }
                      ].map(style => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setLogoBadgeStyle(style.id as any);
                            updateSettings({ ...settings, logoUrl, logoBadgeStyle: style.id as any });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            logoBadgeStyle === style.id
                              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-sm'
                              : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Clear / Reset buttons */}
                  {logoUrl && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">هل ترغب في مسح الشعار المخصص؟</span>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>إزالة اللوغو والعودة للافتراضي</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Ready Presets Gallery */}
                <div className="bg-[#070E1C]/80 border border-slate-700/70 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-black text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>نماذج شعارات رقمية جاهزة للاختيار بنقرة واحدة:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">انقر لتطبيق اللوغو فوراً</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {LOGO_PRESETS.map(preset => {
                      const isSelected = (preset.url === '' && !logoUrl) || (preset.url !== '' && logoUrl === preset.url);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.url)}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            {preset.url ? (
                              <img src={preset.url} alt={preset.name} className="max-h-8 max-w-8 object-contain" />
                            ) : (
                              <InfoTechLogo size="sm" showText={false} customLogoUrl="" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-white leading-tight truncate w-full">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Prominent Dual Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {previewMode === 'dark' ? (
                  /* Dark Mode Live Simulation */
                  <div className="bg-gradient-to-b from-[#080F1E] to-[#040812] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="absolute top-2 end-3 text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                      معاينة حية في النظام (Dark UI)
                    </div>

                    {/* Ambient Glow */}
                    <div className="w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl absolute pointer-events-none" />

                    {/* Prominent Logo Preview */}
                    <div className="my-4">
                      <InfoTechLogo
                        size="2xl"
                        showText={false}
                        customLogoUrl={logoUrl}
                        badgeStyle={logoBadgeStyle}
                      />
                    </div>

                    <div className="mt-2 space-y-1 relative z-10">
                      <h4 className="text-base font-black text-white drop-shadow">
                        {storeNameAr || 'أنفوتيك لتكنولوجيا الحواسيب'}
                      </h4>
                      <p className="text-xs font-mono text-cyan-300 font-semibold">
                        {storeName || 'InfoTech Computer Systems'}
                      </p>
                      <div className="pt-2 text-[11px] text-slate-400 font-medium">
                        يظهر الشعار بهذا التوهج والوضوح في الهيدر والداشبورد وكاشير POS
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Thermal Receipt Simulation */
                  <div className="bg-white text-slate-900 border-2 border-slate-300 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center font-mono text-xs min-h-[300px]">
                    <div className="text-[10px] font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full mb-3">
                      محاكاة الطباعة على الورق الحراري (Thermal 80mm)
                    </div>

                    {/* Monochrome Print Logo */}
                    {logoUrl ? (
                      <div className="w-24 h-24 mb-2 p-1 border border-dashed border-slate-400 rounded-lg flex items-center justify-center bg-slate-50">
                        <img
                          src={logoUrl}
                          alt="Thermal Preview"
                          className="max-h-20 max-w-20 object-contain filter grayscale contrast-150"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-black px-3 py-1 font-black text-sm tracking-wider mb-2">
                        INFOTECH
                      </div>
                    )}

                    <div className="font-bold text-sm text-black border-b border-dashed border-slate-400 pb-2 w-full">
                      {storeNameAr}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {address || '14 Rue Didouche Mourad, Alger'}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      هاتف: {phone || '0550 12 34 56'}
                    </div>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                      فاتورة رقم: INV-2026-0001 · خالص ✓
                    </div>
                  </div>
                )}

                {/* Save & Confirm Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-200 font-bold">
                      تم ربط الشعار بنجاح مع الفواتير والواجهات!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerQuickLogoSave(logoUrl)}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-teal-500/20 transition-all shrink-0 cursor-pointer"
                  >
                    تثبيت الشعار الآن
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: STORE LEGAL INFO & RECEIPT PRINT SETTINGS      */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl p-6 lg:p-7 shadow-xl shadow-black/20 erp-card-glow">
            <h3 className="text-sm font-black text-white border-b border-slate-800/90 pb-3 mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-cyan-400" />
              <span>بيانات المتجر القانونية والترويسة والضمان</span>
            </h3>

            <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">اسم المتجر (بالعربية):</label>
                  <input
                    type="text"
                    value={storeNameAr}
                    onChange={e => setStoreNameAr(e.target.value)}
                    required
                    className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">اسم المتجر (بالفرنسية / اللاتينية):</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">العنوان الجغرافي للمحل الرئيسي:</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">الرقم التعريفي الجبائي (NIF):</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">السجل التجاري (RC):</label>
                  <input
                    type="text"
                    value={commercialReg}
                    onChange={e => setCommercialReg(e.target.value)}
                    className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">ترويسة الإيصال الحراري 80mm (Header):</label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={e => setReceiptHeader(e.target.value)}
                  className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">تذييل الإيصال وسياسة الضمان (Footer):</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={e => setReceiptFooter(e.target.value)}
                  className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20"
                >
                  حفظ كافة بيانات وهوية المتجر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl p-6 max-w-xl mx-auto space-y-6 shadow-xl shadow-black/20 erp-card-glow">
          <div className="space-y-2">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>تصدير نسخة احتياطية كاملة (JSON Export)</span>
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              تنزيل ملف يحتوي على كافة المنتجات، السيريالات، الفواتير، ديون العملاء، وسجلات الضمان بما فيها الشعار
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملف النسخة الاحتياطية (.JSON)</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/90 pt-5 space-y-2.5">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>استعادة نسخة احتياطية سابقة (Restore)</span>
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              ألصق محتوى ملف النسخة الاحتياطية هنا لاستعادة كافة البيانات:
            </p>

            {backupMessage && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20">
                {backupMessage}
              </div>
            )}

            <textarea
              rows={4}
              value={restoreJson}
              onChange={e => setRestoreJson(e.target.value)}
              placeholder="ألصق محتوى كود JSON هنا..."
              className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 shadow-inner font-medium"
            />

            <button
              type="button"
              onClick={handleImportBackup}
              disabled={!restoreJson.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 disabled:opacity-40 text-cyan-300 text-xs font-bold border border-slate-700/80 flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>بدء استيراد واستعادة البيانات</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl shadow-black/20 erp-card-glow">
          <div className="p-4 bg-[#070D1A]/95 border-b border-slate-800/90 flex justify-between items-center text-xs">
            <span className="font-bold text-white">سجل العمليات والرقابة الأمنية (Audit Trail Ledger)</span>
            <span className="text-cyan-400 font-mono font-bold">{auditLogs.length} حركة مسجلة</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-[#070D1A]/60 border-b border-slate-800/80 text-slate-300 font-bold">
                  <th className="py-3 px-4 text-start">التوقيت والتاريخ</th>
                  <th className="py-3 px-4 text-start">المستخدم</th>
                  <th className="py-3 px-4 text-start">الإجراء (Action)</th>
                  <th className="py-3 px-4 text-start">التفاصيل الكاملة</th>
                  <th className="py-3 px-4 text-start">نوع الكيان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-cyan-500/[0.04] transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 uppercase font-bold">
                      {log.entityType || 'SYSTEM'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
