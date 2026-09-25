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
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <span>المشتريات والموردون (Purchases & Suppliers)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            استلام بضاعة جديدة، إدخال الأرقام التسلسلية، وإدارة حسابات الموردين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مورد جديد</span>
          </button>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>استلام شحنة مشتريات (Stock In)</span>
          </button>
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>{orderSuccessMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'orders' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          أوامر الشراء والاستلام
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'suppliers' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          دليل الموردين ({suppliers.length})
        </button>
      </div>

      {/* Suppliers Table */}
      {activeTab === 'suppliers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 text-start">اسم المورد والشركة</th>
                <th className="py-3 px-3 text-start">بيانات الاتصال</th>
                <th className="py-3 px-3 text-start">NIF / الحساب البنكي</th>
                <th className="py-3 px-3 text-end">إجمالي المشتريات</th>
                <th className="py-3 px-3 text-end">إجمالي المدفوع</th>
                <th className="py-3 px-3 text-end">المستحقات المتبقية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{s.company}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    <div>{s.phone}</div>
                    {s.email && <div className="text-[10px] text-slate-500">{s.email}</div>}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[10px] font-mono">
                    {s.taxId ? `NIF: ${s.taxId}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-end font-mono text-slate-300">
                    {formatCurrency(s.totalPurchased)}
                  </td>
                  <td className="py-3 px-3 text-end font-mono text-emerald-400">
                    {formatCurrency(s.totalPaid)}
                  </td>
                  <td className="py-3 px-3 text-end font-mono font-bold">
                    {s.outstandingDebt > 0 ? (
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {formatCurrency(s.outstandingDebt)}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-normal">0 دج</span>
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
          <Truck className="w-12 h-12 text-teal-400 mx-auto stroke-1" />
          <h3 className="text-sm font-bold text-white">إدخال واستلام شحنة مشتريات جديدة مع السيريالات</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            يمكنك تسجيل فواتير الشراء الواردة من الموردين، وتوليد أرقام تسلسلية فورية لكل جهاز كمبيوتر، وتحديث أسعار التكلفة آلياً
          </p>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-teal-500/20"
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
