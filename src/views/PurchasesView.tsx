import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Supplier, PurchaseItem } from '../types';
import { DatabaseService } from '../services/storage';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Building, 
  Barcode, 
  CheckCircle, 
  Truck, 
  DollarSign,
  Trash2,
  X
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { suppliers, products, addSupplier, formatCurrency, activeLocation, currentUser, refreshAllData } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New Supplier Form
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supTaxId, setSupTaxId] = useState('');

  // Purchase Order Form
  const [orderSupplierId, setOrderSupplierId] = useState(suppliers[0]?.id || '');
  const [orderItems, setOrderItems] = useState<{ productId: string; qty: number; unitCost: number; serials: string }[]>([
    { productId: products[0]?.id || '', qty: 1, unitCost: products[0]?.costPrice || 0, serials: '' }
  ]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    addSupplier({
      name: supName.trim(),
      company: supCompany.trim(),
      phone: supPhone.trim(),
      email: supEmail.trim() || undefined,
      taxId: supTaxId.trim() || undefined,
    });
    setShowAddSupplierModal(false);
    setSupName('');
    setSupCompany('');
    setSupPhone('');
    setSupEmail('');
    setSupTaxId('');
  };

  const handleAddItemToOrder = () => {
    setOrderItems(prev => [
      ...prev,
      { productId: products[0]?.id || '', qty: 1, unitCost: products[0]?.costPrice || 0, serials: '' }
    ]);
  };

  const handleSubmitPurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === orderSupplierId);
    if (!sup) return;

    const formattedItems = orderItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const serialList = item.serials
        ? item.serials.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0)
        : [];

      return {
        productId: item.productId,
        productName: prod?.nameAr || prod?.name || 'منتج',
        qty: item.qty,
        unitCost: item.unitCost,
        serialNumbers: serialList.length > 0 ? serialList : undefined
      };
    });

    const res = DatabaseService.receivePurchaseOrder(
      sup.id,
      sup.name,
      formattedItems,
      paidAmount,
      activeLocation.id,
      currentUser.id,
      currentUser.name
    );

    if (res.success) {
      setOrderSuccessMessage(`تم استلام الشحنة وإصدار أمر الشراء ${res.orderNumber} وإضافة البضاعة والسيريالات للمخزون بنجاح!`);
      setShowNewOrderModal(false);
      refreshAllData();
      setTimeout(() => setOrderSuccessMessage(null), 5000);
    } else {
      alert(res.error || 'حدث خطأ أثناء استلام أمر الشراء');
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner with Luxury Gradient & Glowing Brand Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-cyan-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>المشتريات والموردون</span>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  Purchases & Suppliers
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                استلام بضاعة جديدة، إدخال الأرقام التسلسلية، وإدارة حسابات الموردين
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all hover:border-slate-600 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>مورد جديد</span>
          </button>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Truck className="w-4 h-4" />
            <span>استلام شحنة مشتريات (Stock In)</span>
          </button>
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-md shadow-emerald-950/20 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{orderSuccessMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/90 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          أوامر الشراء والاستلام
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'suppliers' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          دليل الموردين ({suppliers.length})
        </button>
      </div>

      {/* Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl shadow-black/20 erp-card-glow">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#070D1A]/95 border-b border-slate-800/90 text-slate-300 font-bold">
                <th className="py-3.5 px-4 text-start">اسم المورد والشركة</th>
                <th className="py-3.5 px-4 text-start">بيانات الاتصال</th>
                <th className="py-3.5 px-4 text-start">NIF / الحساب البنكي</th>
                <th className="py-3.5 px-4 text-end">إجمالي المشتريات</th>
                <th className="py-3.5 px-4 text-end">إجمالي المدفوع</th>
                <th className="py-3.5 px-4 text-end">المستحقات المتبقية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-cyan-500/[0.04] transition-colors">
                  <td className="py-3.5 px-4 text-slate-200">
                    <div className="font-bold text-white text-sm">{s.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.company}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="font-mono text-cyan-300 font-bold">{s.phone}</div>
                    {s.email && <div className="text-[11px] text-slate-400 mt-0.5">{s.email}</div>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                    {s.taxId ? `NIF: ${s.taxId}` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono font-bold text-slate-200">
                    {formatCurrency(s.totalPurchased)}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono font-bold text-emerald-400">
                    {formatCurrency(s.totalPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono font-black">
                    {s.outstandingDebt > 0 ? (
                      <span className="text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full font-mono font-black shadow-sm">
                        {formatCurrency(s.outstandingDebt)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">خالص ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl p-8 text-center space-y-4 shadow-xl shadow-black/20 erp-card-glow max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Truck className="w-8 h-8 stroke-1.5" />
          </div>
          <h3 className="text-base font-black text-white">إدخال واستلام شحنة مشتريات جديدة مع السيريالات</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto font-medium leading-relaxed">
            يمكنك تسجيل فواتير الشراء الواردة من الموردين، وتوليد أرقام تسلسلية فورية لكل جهاز كمبيوتر، وتحديث أسعار التكلفة آلياً
          </p>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black inline-flex items-center gap-2 shadow-xl shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>فتح استلام شحنة جديدة الآن</span>
          </button>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>استلام شحنة بضاعة من المورد (Purchase Receiving)</span>
              </h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchaseOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر المورد:</label>
                <select
                  value={orderSupplierId}
                  onChange={e => setOrderSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white">المنتجات المستلمة:</div>
                {orderItems.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);

                  return (
                    <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-500 text-[10px] mb-0.5">المنتج:</label>
                          <select
                            value={item.productId}
                            onChange={e => {
                              const updated = [...orderItems];
                              updated[idx].productId = e.target.value;
                              const p = products.find(pr => pr.id === e.target.value);
                              if (p) updated[idx].unitCost = p.costPrice;
                              setOrderItems(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs focus:outline-none"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.nameAr} ({p.sku})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[10px] mb-0.5">الكمية:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => {
                              const updated = [...orderItems];
                              updated[idx].qty = Math.max(1, Number(e.target.value));
                              setOrderItems(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-500 text-[10px] mb-0.5">سعر التكلفة للوحدة (دج):</label>
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={e => {
                              const updated = [...orderItems];
                              updated[idx].unitCost = Number(e.target.value);
                              setOrderItems(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs font-mono"
                          />
                        </div>

                        {prod?.type === 'serial' && (
                          <div>
                            <label className="block text-teal-400 text-[10px] mb-0.5 font-bold">
                              الأرقام التسلسلية (مفصولة بفواصل أو أسطر):
                            </label>
                            <input
                              type="text"
                              value={item.serials}
                              onChange={e => {
                                const updated = [...orderItems];
                                updated[idx].serials = e.target.value;
                                setOrderItems(updated);
                              }}
                              placeholder="مثال: SN123456, SN123457..."
                              className="w-full bg-slate-900 border border-teal-500/50 rounded px-2 py-1 text-teal-300 text-xs font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddItemToOrder}
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة بند آخر للشحنة</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">المبلغ المسدد للمورد حالياً (دج):</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  تأكيد الاستلام وإضافة السيريالات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">إضافة مورد جديد</h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم المورد:</label>
                <input
                  type="text"
                  value={supName}
                  onChange={e => setSupName(e.target.value)}
                  required
                  placeholder="مثال: TechDistro DZ"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">اسم الشركة / المؤسسة:</label>
                <input
                  type="text"
                  value={supCompany}
                  onChange={e => setSupCompany(e.target.value)}
                  placeholder="SARL TechDistro Algérie"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={e => setSupPhone(e.target.value)}
                  required
                  placeholder="021 65 43 21"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الرقم الجبائي (NIF):</label>
                <input
                  type="text"
                  value={supTaxId}
                  onChange={e => setSupTaxId(e.target.value)}
                  placeholder="001516098765432"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
