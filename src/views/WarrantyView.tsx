import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WarrantyRecord } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Barcode, 
  Calendar, 
  User, 
  Wrench, 
  CheckCircle, 
  Clock,
  X
} from 'lucide-react';

export const WarrantyView: React.FC = () => {
  const { warranties, createRepair, t } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [claimingWarranty, setClaimingWarranty] = useState<WarrantyRecord | null>(null);
  const [claimIssue, setClaimIssue] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const now = new Date();

  const getWarrantyDaysRemaining = (endDateStr: string): number => {
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filtered = warranties.filter(w => {
    const days = getWarrantyDaysRemaining(w.endDate);
    const isExpired = days < 0;
    const isExpiring = days >= 0 && days <= 30;

    if (filter === 'active' && isExpired) return false;
    if (filter === 'expiring' && !isExpiring) return false;
    if (filter === 'expired' && !isExpired) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.serialNumber.toLowerCase().includes(q) ||
        w.invoiceNumber.toLowerCase().includes(q) ||
        w.customerName.toLowerCase().includes(q) ||
        w.productName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenClaimModal = (w: WarrantyRecord) => {
    setClaimingWarranty(w);
    setClaimIssue('عطل مفاجئ مشمول بضمان الجهاز');
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingWarranty) return;

    // Create a repair ticket under warranty
    createRepair({
      customerId: claimingWarranty.customerId,
      customerName: claimingWarranty.customerName,
      customerPhone: claimingWarranty.customerPhone || '0550000000',
      deviceType: 'Hardware Device',
      brand: 'Under Warranty',
      model: claimingWarranty.productName,
      serialNumber: claimingWarranty.serialNumber,
      problemDescription: `مطالبة ضمان (فاتورة ${claimingWarranty.invoiceNumber}): ${claimIssue}`,
      isWarranty: true,
      laborCost: 0,
      estimatedCost: 0,
      notes: `جهاز تحت الضمان حتى ${claimingWarranty.endDate}`
    });

    setClaimSuccess(true);
    setClaimingWarranty(null);
    setTimeout(() => setClaimSuccess(false), 4000);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner with Luxury Gradient & Glowing Brand Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-cyan-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/25 to-emerald-600/30 text-teal-300 border border-teal-500/40 flex items-center justify-center shadow-md shadow-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>نظام إدارة الضمان ومطالبات الزبائن</span>
                <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                  Warranty Tracking
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                التحقق الفوري من سريان الضمان بالرقم التسلسلي أو الفاتورة، وفتح مطالبات استبدال وصيانة
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-[#070E1C]/90 px-4 py-2 rounded-xl border border-slate-700/80 relative z-10 shadow-inner font-medium">
          شهادات الضمان المسجلة: <strong className="text-teal-400 text-sm font-black">{warranties.length}</strong>
        </div>
      </div>

      {claimSuccess && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-md shadow-emerald-950/20 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>تم تسجيل مطالبة الضمان وفتح تذكرة صيانة برقم تسلسلي في قسم الورشة بنجاح!</span>
        </div>
      )}

      {/* Filter and Search Bar with Luxury Gradient */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#0C1527]/90 via-[#0E1B32]/80 to-[#0A1324]/90 p-4 rounded-2xl border border-slate-800/90 shadow-md">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-cyan-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="امسح أو اكتب الرقم التسلسلي (SN) أو رقم الفاتورة..."
            className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl ps-10 pe-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 font-mono shadow-inner font-bold"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'الضمانات السارية' },
            { id: 'expiring', label: 'توشك على الانتهاء (30 يوم)' },
            { id: 'expired', label: 'منتهية الضمان' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-2 text-xs rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25 ring-1 ring-white/20'
                  : 'bg-[#070E1C]/90 text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs font-medium">
            لا توجد سجلات ضمان مطابقة لخيارات البحث
          </div>
        ) : (
          filtered.map(w => {
            const daysLeft = getWarrantyDaysRemaining(w.endDate);
            const isExpired = daysLeft < 0;
            const isExpiring = daysLeft >= 0 && daysLeft <= 30;

            return (
              <div
                key={w.id}
                className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-lg shadow-black/20 erp-card-glow hover:border-teal-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-xs font-black text-cyan-300 flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                      <Barcode className="w-3.5 h-3.5 text-cyan-400" />
                      {w.serialNumber}
                    </span>

                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow-sm ${
                      isExpired 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                        : isExpiring 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {isExpired ? 'منتهي' : isExpiring ? `باقي ${daysLeft} يوم` : `سارٍ (${daysLeft} يوم)`}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug mb-1">
                    {w.productName}
                  </h4>

                  <div className="text-[11px] text-slate-300 space-y-1.5 mt-3 bg-[#070E1C]/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">العميل:</span>
                      <strong className="text-slate-100">{w.customerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الفاتورة:</span>
                      <span className="font-mono text-teal-300 font-bold">{w.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">فترة الضمان:</span>
                      <span className="font-mono font-bold">{w.warrantyPeriodMonths} شهر</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-800 text-[10px]">
                      <span className="text-slate-400">تاريخ الانتهاء:</span>
                      <span className="font-mono text-slate-200 font-bold">{w.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenClaimModal(w)}
                    disabled={isExpired}
                    className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 disabled:opacity-40 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700/80 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>فتح مطالبة ضمان (RMA Claim)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Warranty Claim Modal */}
      {claimingWarranty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-400" />
                <span>فتح مطالبة ضمان للجهاز</span>
              </h3>
              <button onClick={() => setClaimingWarranty(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">الجهاز: <strong className="text-white">{claimingWarranty.productName}</strong></div>
              <div className="text-slate-400">الرقم التسلسلي: <strong className="text-teal-300 font-mono">{claimingWarranty.serialNumber}</strong></div>
              <div className="text-slate-400">صاحب الجهاز: <strong className="text-slate-200">{claimingWarranty.customerName}</strong></div>
              <div className="text-slate-400">نهاية الضمان: <strong className="text-emerald-400 font-mono">{claimingWarranty.endDate}</strong></div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">وصف العطل أو المشكلة المصنعية المبلغ عنها:</label>
                <textarea
                  rows={3}
                  value={claimIssue}
                  onChange={e => setClaimIssue(e.target.value)}
                  required
                  placeholder="مثال: الشاشة لا تضيء، أو الجهاز يتوقف عن العمل تلقائياً..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimingWarranty(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  تأكيد وإحالة لقسم الصيانة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
