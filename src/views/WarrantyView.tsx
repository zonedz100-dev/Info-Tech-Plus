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
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>نظام إدارة الضمان ومطالبات الزبائن (Warranty Tracking)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            التحقق الفوري من سريان الضمان بالرقم التسلسلي أو الفاتورة، وفتح مطالبات استبدال وصيانة
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          شهادات الضمان المسجلة: <strong className="text-teal-400">{warranties.length}</strong>
        </div>
      </div>

      {claimSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>تم تسجيل مطالبة الضمان وفتح تذكرة صيانة برقم تسلسلي في قسم الورشة بنجاح!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="امسح أو اكتب الرقم التسلسلي (SN) أو رقم الفاتورة..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'الضمانات السارية' },
            { id: 'expiring', label: 'توشك على الانتهاء (30 يوم)' },
            { id: 'expired', label: 'منتهية الضمان' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-teal-400 flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5" />
                      {w.serialNumber}
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isExpired 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : isExpiring 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isExpired ? 'منتهي' : isExpiring ? `باقي ${daysLeft} يوم` : `سارٍ (${daysLeft} يوم)`}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white leading-snug mb-1">
                    {w.productName}
                  </h4>

                  <div className="text-[11px] text-slate-400 space-y-0.5 mt-2">
                    <div className="flex justify-between">
                      <span>العميل:</span>
                      <strong className="text-slate-200">{w.customerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>الفاتورة:</span>
                      <span className="font-mono text-teal-300">{w.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>فترة الضمان:</span>
                      <span className="font-mono">{w.warrantyPeriodMonths} شهر</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px]">
                      <span>تاريخ الانتهاء:</span>
                      <span className="font-mono text-slate-300">{w.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenClaimModal(w)}
                    disabled={isExpired}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
