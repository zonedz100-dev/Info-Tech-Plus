import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  History, 
  CheckCircle,
  X
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, sales, addCustomer, recordCustomerPayment, formatCurrency, t } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // New Customer Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nationalId, setNationalId] = useState('');

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      nationalId: nationalId.trim() || undefined,
    });
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNationalId('');
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment || paymentAmount <= 0) return;
    recordCustomerPayment(selectedCustomerForPayment.id, paymentAmount, paymentMethod);
    setSelectedCustomerForPayment(null);
    setPaymentAmount(0);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner with Luxury Gradient & Glowing Brand Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-cyan-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>إدارة العملاء وحسابات الديون</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  Customer CRM & Receivables
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                متابعة سجل مشتريات الزبائن، مستحقات البيع بالآجل، وتحصيل الدفعات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Search Bar with Luxury Gradient */}
      <div className="bg-gradient-to-r from-[#0C1527]/90 via-[#0E1B32]/80 to-[#0A1324]/90 p-4 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-black/20">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-cyan-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl ps-10 pe-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner font-medium"
          />
        </div>
        <div className="text-xs text-slate-300 font-mono font-medium">
          إجمالي المسجلين: <strong className="text-cyan-400 text-sm font-black">{filtered.length}</strong> عميل
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl shadow-black/20 erp-card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#070D1A]/95 border-b border-slate-800/90 text-slate-300 font-bold">
                <th className="py-3.5 px-4 text-start">اسم العميل</th>
                <th className="py-3.5 px-4 text-start">بيانات الاتصال</th>
                <th className="py-3.5 px-4 text-start">العنوان</th>
                <th className="py-3.5 px-4 text-end">إجمالي المشتريات</th>
                <th className="py-3.5 px-4 text-end">إجمالي المدفوع</th>
                <th className="py-3.5 px-4 text-end">الديون المستحقة (الآجل)</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-cyan-500/[0.04] transition-colors">
                  <td className="py-3.5 px-4 text-white font-bold text-sm">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="font-mono text-cyan-300 font-bold">{c.phone}</div>
                    {c.email && <div className="text-[10px] text-slate-400 mt-0.5">{c.email}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                    {c.address || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono font-bold text-slate-200">
                    {formatCurrency(c.totalPurchases)}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono font-bold text-emerald-400">
                    {formatCurrency(c.totalPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono font-black">
                    {c.outstandingDebt > 0 ? (
                      <span className="text-purple-300 bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 rounded-full font-mono font-black text-xs shadow-sm shadow-purple-500/20">
                        {formatCurrency(c.outstandingDebt)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">خالص ✓</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {c.outstandingDebt > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCustomerForPayment(c);
                            setPaymentAmount(c.outstandingDebt);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 text-teal-300 font-bold text-xs border border-teal-500/40 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>تحصيل دفعة</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCustomerHistory(c)}
                        className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white transition-all shadow-sm border border-slate-700/80 cursor-pointer"
                        title="سجل المشتريات"
                      >
                        <History className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Collection Modal */}
      {selectedCustomerForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-400" />
                <span>تسجيل دفعة سداد دين عميل</span>
              </h3>
              <button onClick={() => setSelectedCustomerForPayment(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">العميل: <strong className="text-white">{selectedCustomerForPayment.name}</strong></div>
              <div className="text-slate-400">إجمالي الدين الحالي: <strong className="text-rose-400 font-mono">{formatCurrency(selectedCustomerForPayment.outstandingDebt)}</strong></div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">المبلغ المراد تحصيله (دج):</label>
                <input
                  type="number"
                  max={selectedCustomerForPayment.outstandingDebt}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">طريقة الدفع:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                >
                  <option value="cash">نقداً (Cash)</option>
                  <option value="baridimob">بريدي موب (BaridiMob)</option>
                  <option value="ccp">حوالة بريدية (CCP)</option>
                  <option value="cheque">شيك بنكي (Cheque)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPayment(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  تأكيد التحصيل وتخفيض الدين
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                سجل فواتير العميل: <span className="text-teal-400">{selectedCustomerHistory.name}</span>
              </h3>
              <button onClick={() => setSelectedCustomerHistory(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {sales.filter(s => s.customerId === selectedCustomerHistory.id).length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">لا توجد فواتير سابقة لهذا العميل</div>
              ) : (
                sales.filter(s => s.customerId === selectedCustomerHistory.id).map(s => (
                  <div key={s.id} className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-mono font-bold text-teal-400">{s.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-500">{s.date}</div>
                    </div>
                    <div className="text-end">
                      <div className="font-mono font-bold text-white">{formatCurrency(s.grandTotal)}</div>
                      <div className="text-[10px] text-emerald-400">مدفوع: {formatCurrency(s.paidAmount)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم العميل / الشركة:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="مثال: أحمد منصوري"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="0550 12 34 56"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">البريد الإلكتروني (اختياري):</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">العنوان:</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="الجزائر العاصمة"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
