import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { 
  TrendingDown, 
  Search, 
  Plus, 
  Calendar, 
  Tag, 
  DollarSign, 
  Receipt,
  X
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, formatCurrency, t } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('rent');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'rent', label: 'إيجار المحل' },
    { id: 'salaries', label: 'رواتب الموظفين' },
    { id: 'electricity', label: 'كهرباء وغاز' },
    { id: 'internet', label: 'إنترنت وهاتف' },
    { id: 'transport', label: 'نقل وشحن' },
    { id: 'maintenance', label: 'صيانة ونظافة' },
    { id: 'marketing', label: 'تسويق وإعلانات' },
    { id: 'taxes', label: 'ضرائب ورسوم' },
    { id: 'other', label: 'مصاريف أخرى' },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filtered = expenses.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.description.toLowerCase().includes(q) || (e.reference && e.reference.toLowerCase().includes(q));
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    addExpense({
      date: new Date().toISOString().substring(0, 10),
      category,
      amount,
      paymentMethod,
      description: description.trim(),
      reference: reference.trim() || undefined
    });

    setShowAddModal(false);
    setAmount(0);
    setDescription('');
    setReference('');
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <span>المصاريف التشغيلية (Operating Expenses)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            تسجيل النفقات الإدارية، الإيجار، الرواتب، واشتراكات الإنترنت لحساب صافي الربح الحقيقي
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            إجمالي المصاريف: <strong className="text-rose-400">{formatCurrency(totalExpenses)}</strong>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
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
            placeholder="ابحث بالبيان أو رقم الوصل..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
              categoryFilter === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            كافة المصاريف
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                categoryFilter === c.id ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 text-start">التاريخ</th>
                <th className="py-3 px-3 text-start">البند / الفئة</th>
                <th className="py-3 px-3 text-start">البيان والتفاصيل</th>
                <th className="py-3 px-3 text-center">طريقة الدفع</th>
                <th className="py-3 px-3 text-end">المبلغ</th>
                <th className="py-3 px-3 text-start">المسؤول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {exp.date}
                  </td>
                  <td className="py-3 px-3 text-teal-300 font-semibold">
                    {categories.find(c => c.id === exp.category)?.label || exp.category}
                  </td>
                  <td className="py-3 px-3 text-white">
                    <div>{exp.description}</div>
                    {exp.reference && (
                      <div className="text-[10px] text-slate-500 font-mono">مرجع: {exp.reference}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 uppercase">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-end font-mono font-bold text-rose-400">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {exp.recordedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>تسجيل مصروف تشغيلي جديد</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">فئة المصروف:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المبلغ (دج):</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">طريقة السداد:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                >
                  <option value="cash">نقداً من الصندوق (Cash)</option>
                  <option value="baridimob">بريدي موب (BaridiMob)</option>
                  <option value="ccp">حوالة بريدية (CCP)</option>
                  <option value="cheque">شيك بنكي (Cheque)</option>
                  <option value="transfer">تحويل بنكي (Transfer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">بيان المصروف وتفاصيله:</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  placeholder="مثال: فاتورة كهرباء المحل لشهر فيفري..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">رقم الوصل أو الشيك (اختياري):</label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="مثال: REC-9921 / CHQ-102"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
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
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
