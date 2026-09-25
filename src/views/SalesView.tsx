import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sale } from '../types';
import { 
  Receipt, 
  Search, 
  Printer, 
  Eye, 
  RotateCcw, 
  Calendar, 
  User, 
  DollarSign,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  X,
  CreditCard,
  Barcode
} from 'lucide-react';
import { InvoicePrintModal } from '../components/common/InvoicePrintModal';
import { PAYMENT_METHOD_THEMES } from '../utils/theme';

export const SalesView: React.FC = () => {
  const { sales, formatCurrency, t, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  const filteredSales = sales.filter(s => {
    const q = search.toLowerCase();
    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.items.some(i => i.productName.toLowerCase().includes(q) || (i.serialNumbers && i.serialNumbers.some(sn => sn.toLowerCase().includes(q))))
    );
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Header with Luxury Gradient & Glowing Brand Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-cyan-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-600/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>سجل المبيعات والفواتير</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Sales & Invoices
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                عرض وتدقيق فواتير البيع الصادرة، إعادة الطباعة الحرارية والرسمية، ومتابعة التحصيلات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-cyan-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم الفاتورة، العميل، أو السيريال..."
              className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl ps-10 pe-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner font-medium"
            />
          </div>
        </div>
      </div>

      {/* Sales Data Table with Expressive Badges */}
      <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl shadow-black/20 erp-card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#070D1A]/95 border-b border-slate-800/90 text-slate-300 font-bold">
                <th className="py-3.5 px-4 text-start">رقم الفاتورة</th>
                <th className="py-3.5 px-4 text-start">التاريخ والوقت</th>
                <th className="py-3.5 px-4 text-start">العميل</th>
                <th className="py-3.5 px-4 text-start">البنود والسيريالات</th>
                <th className="py-3.5 px-4 text-end">المبلغ الإجمالي</th>
                <th className="py-3.5 px-4 text-end">المدفوع</th>
                <th className="py-3.5 px-4 text-end">المتبقي (آجل)</th>
                <th className="py-3.5 px-4 text-center">طرق الدفع</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-xs font-medium">
                    لا توجد فواتير مطابقة لخيارات البحث
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  return (
                    <tr key={sale.id} className="hover:bg-cyan-500/[0.04] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {sale.date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        <div className="font-bold text-white">{sale.customerName}</div>
                        {sale.customerPhone && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sale.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="max-w-xs truncate text-[11px] font-medium">
                          {sale.items.map(i => i.productName).join(' + ')}
                        </div>
                        {sale.items.some(i => i.serialNumbers && i.serialNumbers.length > 0) && (
                          <div className="text-[10px] text-cyan-300 font-mono truncate flex items-center gap-1 mt-1">
                            <Barcode className="w-3 h-3 text-cyan-400" />
                            <span>SN: {sale.items.flatMap(i => i.serialNumbers || []).join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono font-black text-white text-sm">
                        {formatCurrency(sale.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono font-bold text-emerald-400">
                        {formatCurrency(sale.paidAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-end font-mono font-bold">
                        {sale.remainingDebt > 0 ? (
                          <span className="text-purple-300 bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 rounded-full font-mono font-black text-xs shadow-sm shadow-purple-500/20">
                            {formatCurrency(sale.remainingDebt)}
                          </span>
                        ) : (
                          <span className="text-emerald-400/90 font-bold">خالص ✓</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {sale.payments.map((p, idx) => {
                            const methodTheme = PAYMENT_METHOD_THEMES[p.method] || PAYMENT_METHOD_THEMES['cash'];
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold shadow-sm ${methodTheme.pillBg}`}
                              >
                                {methodTheme.nameAr.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedSaleDetail(sale)}
                            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white transition-all shadow-sm border border-slate-700/80 cursor-pointer"
                            title="عرض تفاصيل الفاتورة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedSaleForPrint(sale)}
                            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 transition-all shadow-sm shadow-cyan-500/10 cursor-pointer"
                            title="طباعة (حراري أو A4)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0C1424] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>تفاصيل الفاتورة:</span>
                  <span className="font-mono text-cyan-400">{selectedSaleDetail.invoiceNumber}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedSaleDetail.date}</p>
              </div>
              <button onClick={() => setSelectedSaleDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Cashier */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#070D18] border border-slate-800 text-xs">
              <div>
                <div className="text-slate-400">العميل:</div>
                <div className="font-bold text-white mt-0.5">{selectedSaleDetail.customerName}</div>
                {selectedSaleDetail.customerPhone && (
                  <div className="text-[11px] text-slate-400 font-mono">{selectedSaleDetail.customerPhone}</div>
                )}
              </div>
              <div className="text-end">
                <div className="text-slate-400">الكاشير:</div>
                <div className="font-bold text-slate-200 mt-0.5">{selectedSaleDetail.cashierName}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">البنود المباعة:</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pe-1">
                {selectedSaleDetail.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#070D18] border border-slate-800/80 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-200">{it.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {it.qty} × {formatCurrency(it.unitPrice)}
                        {it.serialNumbers && it.serialNumbers.length > 0 && (
                          <span className="text-cyan-400 ms-2">SN: {it.serialNumbers.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      {formatCurrency(it.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments breakdown */}
            <div className="p-3 rounded-xl bg-[#070D18] border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>المجموع الإجمالي:</span>
                <span className="font-bold text-white">{formatCurrency(selectedSaleDetail.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>المدفوع:</span>
                <span>{formatCurrency(selectedSaleDetail.paidAmount)}</span>
              </div>
              {selectedSaleDetail.remainingDebt > 0 && (
                <div className="flex justify-between text-purple-400 font-bold">
                  <span>المتبقي (دين / آجل):</span>
                  <span>{formatCurrency(selectedSaleDetail.remainingDebt)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  const s = selectedSaleDetail;
                  setSelectedSaleDetail(null);
                  setSelectedSaleForPrint(s);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الفاتورة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        sale={selectedSaleForPrint}
        onClose={() => setSelectedSaleForPrint(null)}
      />
    </div>
  );
};
