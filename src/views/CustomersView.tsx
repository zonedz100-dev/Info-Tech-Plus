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
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <span>إدارة العملاء وحسابات الديون (Customer CRM & Receivables)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            متابعة سجل مشتريات الزبائن، مستحقات البيع بالآجل، وتحصيل الدفعات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          إجمالي المسجلين: <strong className="text-teal-400">{filtered.length}</strong> عميل
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 text-start">اسم العميل</th>
                <th className="py-3 px-3 text-start">بيانات الاتصال</th>
                <th className="py-3 px-3 text-start">العنوان</th>
                <th className="py-3 px-3 text-end">إجمالي المشتريات</th>
                <th className="py-3 px-3 text-end">إجمالي المدفوع</th>
                <th className="py-3 px-3 text-end">الديون المستحقة (الآجل)</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    <div>{c.phone}</div>
                    {c.email && <div className="text-[10px] text-slate-500">{c.email}</div>}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {c.address || '-'}
                  </td>
                  <td className="py-3 px-3 text-end font-mono text-slate-300">
                    {formatCurrency(c.totalPurchases)}
                  </td>
                  <td className="py-3 px-3 text-end font-mono text-emerald-400">
                    {formatCurrency(c.totalPaid)}
                  </td>
                  <td className="py-3 px-3 text-end font-mono font-bold">
                    {c.outstandingDebt > 0 ? (
                      <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {formatCurrency(c.outstandingDebt)}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-normal">0 دج</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {c.outstandingDebt > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCustomerForPayment(c);
                            setPaymentAmount(c.outstandingDebt);
                          }}
                          className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-[10px] border border-teal-500/30 flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>تحصيل دفعة</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCustomerHistory(c)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="سجل المشتريات"
                      >
                        <History className="w-3.5 h-3.5" />
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
