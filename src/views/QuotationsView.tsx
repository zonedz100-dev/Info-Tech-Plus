import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Quotation } from '../types';
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  ArrowRight, 
  Printer, 
  CheckCircle, 
  ShoppingCart,
  Calendar,
  User,
  X
} from 'lucide-react';

interface QuotationsViewProps {
  onNavigate: (tab: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({ onNavigate }) => {
  const { quotations, formatCurrency, t } = useApp();
  const [search, setSearch] = useState('');

  const filtered = quotations.filter(q => {
    const s = search.toLowerCase();
    return q.quoteNumber.toLowerCase().includes(s) || q.customerName.toLowerCase().includes(s);
  });

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-400" />
            <span>عروض الأسعار والفواتير الأولية (Quotations & Proforma)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            إصدار عروض أسعار رسمية للشركات والزبائن، والتحويل المباشر إلى مبيعات وفواتير نهائية
          </p>
        </div>

        <button
          onClick={() => onNavigate('pcBuilder')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء عرض سعر عبر PC Builder</span>
        </button>
      </div>

      {/* Quotations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 text-start">رقم العرض</th>
                <th className="py-3 px-3 text-start">تاريخ الإصدار</th>
                <th className="py-3 px-3 text-start">صالح لغاية</th>
                <th className="py-3 px-3 text-start">العميل</th>
                <th className="py-3 px-3 text-start">البنود</th>
                <th className="py-3 px-3 text-end">المبلغ الإجمالي</th>
                <th className="py-3 px-3 text-center">الحالة</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد عروض أسعار مسجلة حالياً
                  </td>
                </tr>
              ) : (
                filtered.map(q => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-teal-400">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {q.date}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {q.validUntil}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {q.customerName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div className="max-w-xs truncate">
                        {q.items.map(i => i.productName).join(' + ')}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-end font-mono font-bold text-white">
                      {formatCurrency(q.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onNavigate('pos')}
                        className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold flex items-center gap-1 mx-auto"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>تحويل لبيع</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
