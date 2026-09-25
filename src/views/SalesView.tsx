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
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Header with High-Tech Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527] via-[#0E1A34] to-[#0A1224] border border-cyan-500/30 p-4 lg:p-5 rounded-2xl shadow-xl shadow-black/30">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <span>سجل المبيعات والفواتير (Sales & Invoices)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            عرض وتدقيق فواتير البيع الصادرة، إعادة الطباعة الحرارية والرسمية، ومتابعة التحصيلات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث برقم الفاتورة، العميل، أو السيريال..."
              className="bg-[#070D18] border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-72"
            />
          </div>
        </div>
      </div>

      {/* Sales Data Table with Expressive Badges */}
      <div className="bg-[#0B1322] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#070D18] border-b border-slate-800/80 text-slate-400 font-semibold">
                <th className="py-3 px-3.5 text-start">رقم الفاتورة</th>
                <th className="py-3 px-3.5 text-start">التاريخ والوقت</th>
                <th className="py-3 px-3.5 text-start">العميل</th>
                <th className="py-3 px-3.5 text-start">البنود والسيريالات</th>
                <th className="py-3 px-3.5 text-end">المبلغ الإجمالي</th>
                <th className="py-3 px-3.5 text-end">المدفوع</th>
                <th className="py-3 px-3.5 text-end">المتبقي (آجل)</th>
                <th className="py-3 px-3.5 text-center">طرق الدفع</th>
                <th className="py-3 px-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    لا توجد فواتير مطابقة لخيارات البحث
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-cyan-400">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-400 text-[11px]">
                        {sale.date}
                      </td>
                      <td className="py-3 px-3.5 text-slate-200">
                        <div className="font-bold">{sale.customerName}</div>
                        {sale.customerPhone && (
                          <div className="text-[10px] text-slate-500 font-mono">{sale.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-slate-300">
                        <div className="max-w-xs truncate text-[11px] font-medium">
                          {sale.items.map(i => i.productName).join(' + ')}
                        </div>
                        {sale.items.some(i => i.serialNumbers && i.serialNumbers.length > 0) && (
                          <div className="text-[10px] text-cyan-400 font-mono truncate flex items-center gap-1 mt-0.5">
                            <Barcode className="w-3 h-3" />
                            <span>SN: {sale.items.flatMap(i => i.serialNumbers || []).join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono font-black text-white">
                        {formatCurrency(sale.grandTotal)}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono font-bold text-emerald-400">
                        {formatCurrency(sale.paidAmount)}
                      </td>
                      <td className="py-3 px-3.5 text-end font-mono font-bold">
                        {sale.remainingDebt > 0 ? (
                          <span className="text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                            {formatCurrency(sale.remainingDebt)}
                          </span>
                        ) : (
                          <span className="text-emerald-500/80 font-normal">خالص ✓</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {sale.payments.map((p, idx) => {
                            const methodTheme = PAYMENT_METHOD_THEMES[p.method] || PAYMENT_METHOD_THEMES['cash'];
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${methodTheme.pillBg}`}
                              >
                                {methodTheme.nameAr.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSaleDetail(sale)}
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="عرض تفاصيل الفاتورة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedSaleForPrint(sale)}
                            className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition-colors"
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
