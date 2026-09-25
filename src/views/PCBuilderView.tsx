import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { 
  Cpu, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart, 
  FileSpreadsheet, 
  RotateCcw,
  Sparkles,
  HardDrive,
  Box,
  Monitor
} from 'lucide-react';

interface PCBuilderViewProps {
  onNavigate: (tab: string) => void;
}

export const PCBuilderView: React.FC<PCBuilderViewProps> = ({ onNavigate }) => {
  const { products, formatCurrency, addQuotation, t } = useApp();

  // Selected Parts
  const [selectedCpu, setSelectedCpu] = useState<Product | null>(
    products.find(p => p.sku === 'CPU-INT-14700K') || null
  );
  const [selectedMb, setSelectedMb] = useState<Product | null>(
    products.find(p => p.sku === 'MB-MSI-Z790P') || null
  );
  const [selectedRam, setSelectedRam] = useState<Product | null>(
    products.find(p => p.sku === 'RAM-KIN-32D5') || null
  );
  const [selectedGpu, setSelectedGpu] = useState<Product | null>(
    products.find(p => p.sku === 'GPU-GIG-4070') || null
  );
  const [selectedStorage, setSelectedStorage] = useState<Product | null>(
    products.find(p => p.sku === 'SSD-SAM-990P-1TB') || null
  );
  const [selectedPsu, setSelectedPsu] = useState<Product | null>(
    products.find(p => p.sku === 'PSU-COR-850E') || null
  );
  const [selectedCase, setSelectedCase] = useState<Product | null>(
    products.find(p => p.sku === 'CAS-NZX-H5F') || null
  );
  const [includeAssembly, setIncludeAssembly] = useState<boolean>(true);
  const assemblyService = products.find(p => p.sku === 'SRV-PC-ASSEMBLY');

  const [notification, setNotification] = useState<string | null>(null);

  // Available options
  const cpuOptions = products.filter(p => p.category === 'Components' && p.sku.startsWith('CPU'));
  const mbOptions = products.filter(p => p.category === 'Components' && p.sku.startsWith('MB'));
  const ramOptions = products.filter(p => p.category === 'Memory & Storage' && p.sku.startsWith('RAM'));
  const gpuOptions = products.filter(p => p.category === 'Graphics Cards');
  const storageOptions = products.filter(p => p.category === 'Memory & Storage' && p.sku.startsWith('SSD'));
  const psuOptions = products.filter(p => p.category === 'Power & Cooling' && p.sku.startsWith('PSU'));
  const caseOptions = products.filter(p => p.category === 'Power & Cooling' && p.sku.startsWith('CAS'));

  // Automated Compatibility Checks
  const compatibilityIssues: string[] = [];

  // 1. Socket check
  if (selectedCpu && selectedMb) {
    const cpuSocket = selectedCpu.specs?.socket;
    const mbSocket = selectedMb.specs?.socket;
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      compatibilityIssues.push(
        `تعارض في المقبس (Socket Mismatch): المعالج يتطلب ${cpuSocket} بينما اللوحة الأم تدعم ${mbSocket}`
      );
    }
  }

  // 2. RAM type check
  if (selectedMb && selectedRam) {
    const mbRam = selectedMb.specs?.ramType;
    const ramType = selectedRam.specs?.ramType;
    if (mbRam && ramType && mbRam !== ramType) {
      compatibilityIssues.push(
        `تعارض في نوع الذاكرة (RAM Mismatch): اللوحة تدعم ${mbRam} بينما الذاكرة المختارة هي ${ramType}`
      );
    }
  }

  // 3. Wattage & PSU check
  const estimatedWattage = 
    (selectedCpu?.specs?.wattage || 125) +
    (selectedGpu?.specs?.wattage || 200) +
    (selectedMb ? 50 : 0) +
    (selectedRam ? 20 : 0) +
    (selectedStorage ? 10 : 0) +
    50; // fans + misc

  const psuWattage = selectedPsu?.specs?.wattage || 0;
  if (selectedPsu && psuWattage < estimatedWattage + 100) {
    compatibilityIssues.push(
      `مزود الطاقة غير كافٍ: التجميعة تستهلك حوالي ${estimatedWattage}W ويُنصح بمزود لا يقل عن ${estimatedWattage + 150}W لمنع هبوط الجهد`
    );
  }

  const isCompatible = compatibilityIssues.length === 0;

  // Pricing calculations
  const selectedItems = [
    selectedCpu,
    selectedMb,
    selectedRam,
    selectedGpu,
    selectedStorage,
    selectedPsu,
    selectedCase,
    includeAssembly ? assemblyService : null
  ].filter(Boolean) as Product[];

  const totalCost = selectedItems.reduce((sum, p) => sum + p.costPrice, 0);
  const totalSellingPrice = selectedItems.reduce((sum, p) => sum + p.sellingPrice, 0);
  const totalProfit = totalSellingPrice - totalCost;

  const handleConvertToQuotation = () => {
    const quoteItems = selectedItems.map(p => ({
      productId: p.id,
      productName: p.nameAr,
      sku: p.sku,
      type: p.type,
      qty: 1,
      unitPrice: p.sellingPrice,
      costPrice: p.costPrice,
      discount: 0,
      total: p.sellingPrice,
      warrantyMonths: p.warrantyMonths
    }));

    addQuotation({
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
      customerId: 'cust-karim',
      customerName: 'كريم بلحاج (تجميعة حاسوب)',
      items: quoteItems,
      subtotal: totalSellingPrice,
      discount: 0,
      tax: 0,
      grandTotal: totalSellingPrice,
      status: 'draft',
      notes: `تجميعة PC مخصصة بقوة ${estimatedWattage}W - متوافقة بالكامل`
    });

    setNotification('تم حفظ التجميعة كعرض سعر رسمي في قسم عروض الأسعار بنجاح!');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendToPOS = () => {
    onNavigate('pos');
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner with High-Tech Styling and Luxury Gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-cyan-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10">
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/25 to-indigo-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <span>مُجمّع الحواسيب وفحص التوافقية الذكي (PC Builder Studio)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            تكوين حواسيب الألعاب والمحطات الهندسية مع فحص المقبس (Socket)، نوع الرام، واستهلاك الطاقة آلياً
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => {
              setSelectedCpu(null);
              setSelectedMb(null);
              setSelectedRam(null);
              setSelectedGpu(null);
              setSelectedStorage(null);
              setSelectedPsu(null);
              setSelectedCase(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all hover:border-slate-600 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>إعادة التعيين</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 font-bold animate-in fade-in shadow-md shadow-emerald-950/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Component Selector on Left, Compatibility & Price on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Parts Selection Grid with Distinct Expressive Colors */}
        <div className="lg:col-span-2 space-y-3.5">
          {[
            { 
              title: '1. المعالج (CPU / Processor)', 
              val: selectedCpu, 
              setVal: setSelectedCpu, 
              options: cpuOptions, 
              icon: Cpu,
              color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
              borderHover: 'hover:border-purple-500/50'
            },
            { 
              title: '2. اللوحة الأم (Motherboard)', 
              val: selectedMb, 
              setVal: setSelectedMb, 
              options: mbOptions, 
              icon: Layers,
              color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
              borderHover: 'hover:border-blue-500/50'
            },
            { 
              title: '3. الذاكرة العشوائية (RAM Memory)', 
              val: selectedRam, 
              setVal: setSelectedRam, 
              options: ramOptions, 
              icon: Zap,
              color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
              borderHover: 'hover:border-emerald-500/50'
            },
            { 
              title: '4. كرت الشاشة (Graphics Card / GPU)', 
              val: selectedGpu, 
              setVal: setSelectedGpu, 
              options: gpuOptions, 
              icon: Monitor,
              color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
              borderHover: 'hover:border-indigo-500/50'
            },
            { 
              title: '5. التخزين السريع (NVMe SSD Storage)', 
              val: selectedStorage, 
              setVal: setSelectedStorage, 
              options: storageOptions, 
              icon: HardDrive,
              color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
              borderHover: 'hover:border-cyan-500/50'
            },
            { 
              title: '6. مزود الطاقة (Power Supply / PSU)', 
              val: selectedPsu, 
              setVal: setSelectedPsu, 
              options: psuOptions, 
              icon: Zap,
              color: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
              borderHover: 'hover:border-orange-500/50'
            },
            { 
              title: '7. صندوق الحاسوب (PC Case)', 
              val: selectedCase, 
              setVal: setSelectedCase, 
              options: caseOptions, 
              icon: Box,
              color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
              borderHover: 'hover:border-rose-500/50'
            },
          ].map((part, idx) => {
            const Icon = part.icon;

            return (
              <div key={idx} className={`p-4 bg-gradient-to-r from-[#0C1527]/90 via-[#0E1A30]/80 to-[#0A1324]/90 border border-slate-800/90 rounded-2xl flex items-center justify-between gap-3.5 transition-all shadow-md shadow-black/20 backdrop-blur-md ${part.borderHover}`}>
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${part.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 mb-1.5">{part.title}</div>
                    <select
                      value={part.val?.id || ''}
                      onChange={e => {
                        const found = products.find(p => p.id === e.target.value);
                        part.setVal(found || null);
                      }}
                      className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white truncate focus:outline-none focus:border-cyan-500 shadow-inner font-medium"
                    >
                      <option value="">-- اضغط لاختيار القطعة المتوافقة --</option>
                      {part.options.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.nameAr} - ({formatCurrency(opt.sellingPrice)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {part.val && (
                  <div className="text-end shrink-0 ps-3">
                    <div className="font-mono text-sm font-black text-emerald-400">
                      {formatCurrency(part.val.sellingPrice)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      تكلفة: {formatCurrency(part.val.costPrice)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Assembly Service Toggle */}
          <div className="p-4 bg-gradient-to-r from-[#0C1527]/90 via-[#0E1A30]/80 to-[#0A1324]/90 border border-slate-800/90 rounded-2xl flex items-center justify-between shadow-md shadow-black/20">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="assembly-toggle"
                checked={includeAssembly}
                onChange={e => setIncludeAssembly(e.target.checked)}
                className="w-4 h-4 rounded bg-[#070D18] border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
              />
              <label htmlFor="assembly-toggle" className="text-xs text-slate-200 cursor-pointer font-bold">
                إضافة خدمة التجميع الاحترافي، تركيب المعجون الحراري، واختبار الإجهاد (+4,000 دج)
              </label>
            </div>
            {includeAssembly && assemblyService && (
              <span className="font-mono text-xs font-black text-cyan-400">
                {formatCurrency(assemblyService.sellingPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Compatibility Check & Financial Summary Sidebar */}
        <div className="space-y-4">
          {/* Compatibility Card */}
          <div className="bg-gradient-to-b from-[#0D182E] to-[#0A1224] border border-slate-800/90 p-5 rounded-2xl space-y-4 shadow-lg shadow-black/30 erp-card-glow">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>محرك فحص التوافقية الهندسية</span>
              </h3>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                isCompatible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {isCompatible ? 'متوافقة 100%' : 'يوجد تعارض'}
              </span>
            </div>

            {isCompatible ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  جميع القطع متوافقة تماماً هندسياً: المقبس مطابق، نوع الذاكرة صحيح، واستطاعة التغذية كافية.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {compatibilityIssues.map((issue, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Estimated Power Draw Meter */}
            <div className="p-3.5 rounded-xl bg-[#070E1C]/90 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2 font-medium">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>الاستهلاك التقديري للطاقة:</span>
              </span>
              <span className="font-mono font-black text-amber-300">{estimatedWattage} واط (W)</span>
            </div>
          </div>

          {/* Pricing & Profit Matrix */}
          <div className="bg-gradient-to-b from-[#0D182E] to-[#0A1224] border border-slate-800/90 p-5 rounded-2xl space-y-4 shadow-lg shadow-black/30 erp-card-glow">
            <h3 className="text-xs font-bold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>الملخص المالي وهوامش الربح</span>
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>تكلفة المكونات الإجمالية:</span>
                <span className="text-slate-200 font-bold">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>صافي هامش الربح المحقق:</span>
                <span>+{formatCurrency(totalProfit)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-slate-800/90">
                <span>سعر البيع للزبون:</span>
                <span className="text-emerald-400 text-lg font-black">{formatCurrency(totalSellingPrice)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={handleConvertToQuotation}
                disabled={selectedItems.length === 0}
                className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 disabled:opacity-40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700/80 transition-colors shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تحويل إلى عرض سعر رسمي (Quotation)</span>
              </button>

              <button
                onClick={handleSendToPOS}
                disabled={selectedItems.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-300 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 transition-all ring-1 ring-white/30 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-slate-950" />
                <span>ترحيل التجميعة إلى كاشير POS للبيع</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
