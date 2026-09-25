import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SerialNumber, SerialStatus } from '../types';
import { 
  Barcode, 
  Search, 
  ShieldCheck, 
  Calendar, 
  User, 
  Tag, 
  Filter, 
  Plus, 
  ExternalLink,
  Laptop,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

export const SerialsView: React.FC = () => {
  const { serials, products, suppliers, customers, formatCurrency, t } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSerialDetail, setSelectedSerialDetail] = useState<SerialNumber | null>(null);

  const filtered = serials.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.serialNumber.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        (s.imei && s.imei.includes(q)) ||
        (s.saleId && s.saleId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: SerialStatus) => {
    switch (status) {
      case 'in_stock':
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">في المخزن (In Stock)</span>;
      case 'sold':
        return <span className="bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">مباع للعميل (Sold)</span>;
      case 'under_repair':
        return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono">قيد الصيانة</span>;
      case 'returned':
        return <span className="bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-mono">مرتجع</span>;
      case 'damaged':
        return <span className="bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-mono">تالف</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono">{status}</span>;
    }
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Barcode className="w-5 h-5 text-teal-400" />
            <span>إدارة وتتبع الأرقام التسلسلية (Serial Numbers & IMEI)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            تتبع دورة حياة كل جهاز منفرد: الشراء من المورد ← المخزن ← البيع للزبون ← سريان الضمان والصيانة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            إجمالي السيريالات: <strong className="text-teal-400">{serials.length}</strong> جهاز
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث برقم السيريال (SN)، IMEI، أو اسم الجهاز..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'in_stock', label: 'في المخزن' },
            { id: 'sold', label: 'مباع' },
            { id: 'under_repair', label: 'في الصيانة' },
            { id: 'returned', label: 'مرتجع' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Serials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 text-start">الرقم التسلسلي (S/N)</th>
                <th className="py-3 px-3 text-start">الجهاز / المنتج</th>
                <th className="py-3 px-3 text-center">الحالة</th>
                <th className="py-3 px-3 text-start">العميل المرتبط</th>
                <th className="py-3 px-3 text-start">تاريخ الشراء / البيع</th>
                <th className="py-3 px-3 text-center">الضمان</th>
                <th className="py-3 px-3 text-end">سعر البيع</th>
                <th className="py-3 px-3 text-center">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد أجهزة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filtered.map(s => {
                  const cust = customers.find(c => c.id === s.customerId);

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-white flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{s.serialNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        <div className="font-medium truncate max-w-xs">{s.productName}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(s.status)}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {cust ? (
                          <div>
                            <div className="font-semibold text-white">{cust.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{cust.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        <div>شراء: {s.purchaseDate}</div>
                        {s.saleDate && <div className="text-teal-400">بيع: {s.saleDate.substring(0, 10)}</div>}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        {s.warrantyEnd ? (
                          <span className="text-emerald-400">حتى {s.warrantyEnd}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-teal-300">
                        {formatCurrency(s.sellingPrice)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedSerialDetail(s)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          عرض البطاقة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Serial Card Detail Modal */}
      {selectedSerialDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">
                  بطاقة تعريف الجهاز: <span className="font-mono text-teal-400">{selectedSerialDetail.serialNumber}</span>
                </h3>
              </div>
              <button onClick={() => setSelectedSerialDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">المنتج:</span>
                <span className="font-bold text-white">{selectedSerialDetail.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الرقم التسلسلي:</span>
                <span className="font-mono font-bold text-teal-300">{selectedSerialDetail.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الحالة الراهنة:</span>
                <div>{getStatusBadge(selectedSerialDetail.status)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سعر التكلفة:</span>
                <span className="font-mono text-slate-300">{formatCurrency(selectedSerialDetail.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سعر البيع:</span>
                <span className="font-mono font-bold text-teal-400">{formatCurrency(selectedSerialDetail.sellingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ الشراء من المورد:</span>
                <span className="font-mono text-slate-300">{selectedSerialDetail.purchaseDate}</span>
              </div>

              {selectedSerialDetail.saleDate && (
                <>
                  <div className="border-t border-slate-800 pt-2 flex justify-between">
                    <span className="text-slate-400">تاريخ البيع:</span>
                    <span className="font-mono text-teal-300">{selectedSerialDetail.saleDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">فترة الضمان:</span>
                    <span className="font-mono text-emerald-400">
                      من {selectedSerialDetail.warrantyStart} إلى {selectedSerialDetail.warrantyEnd}
                    </span>
                  </div>
                </>
              )}

              {selectedSerialDetail.notes && (
                <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">ملاحظات: </span>
                  {selectedSerialDetail.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSerialDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
