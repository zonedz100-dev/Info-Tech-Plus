import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RepairTicket, RepairStatus } from '../types';
import { DatabaseService } from '../services/storage';
import { 
  Wrench, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Layers, 
  DollarSign, 
  Tag,
  AlertCircle,
  X
} from 'lucide-react';

export const RepairsView: React.FC = () => {
  const { 
    repairs, 
    products, 
    customers, 
    createRepair, 
    updateRepairStatus, 
    formatCurrency, 
    activeLocation, 
    currentUser, 
    refreshAllData 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicketForParts, setSelectedTicketForParts] = useState<RepairTicket | null>(null);

  // New Ticket Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [brand, setBrand] = useState('ASUS');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [accessories, setAccessories] = useState('الشاحن الأصلي');
  const [estimatedCost, setEstimatedCost] = useState<number>(3000);
  const [isWarranty, setIsWarranty] = useState<boolean>(false);

  // Part Usage Form
  const [selectedPartId, setSelectedPartId] = useState(products[0]?.id || '');
  const [partQty, setPartQty] = useState(1);

  const statuses: { id: RepairStatus; label: string; color: string }[] = [
    { id: 'received', label: 'تم الاستلام', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    { id: 'diagnosing', label: 'قيد الفحص والتشخيص', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
    { id: 'waiting_customer', label: 'بانتظار موافقة الزبون', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    { id: 'waiting_parts', label: 'بانتظار قطع الغيار', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
    { id: 'repairing', label: 'قيد الإصلاح الفعلي', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    { id: 'ready', label: 'جاهز للتسليم', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    { id: 'delivered', label: 'تم التسليم للعميل', color: 'bg-slate-800 text-slate-400 border-slate-700' },
  ];

  const filtered = repairs.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.ticketNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.model.toLowerCase().includes(q) ||
        (r.serialNumber && r.serialNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !model.trim()) return;

    createRepair({
      customerId: `cust-temp-${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deviceType,
      brand,
      model: model.trim(),
      serialNumber: serialNumber.trim() || undefined,
      problemDescription: problemDescription.trim(),
      accessoriesReceived: accessories.trim(),
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      isWarranty,
      laborCost: estimatedCost,
      estimatedCost
    });

    setShowNewTicketModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setModel('');
    setSerialNumber('');
    setProblemDescription('');
  };

  const handleAttachPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForParts) return;

    const prod = products.find(p => p.id === selectedPartId);
    if (!prod || prod.currentStock < partQty) {
      alert('القطعة غير متوفرة بالكمية المطلوبة في المخزن!');
      return;
    }

    // Deduct from storage
    const storedProducts = DatabaseService.getProducts();
    const storedMovements = DatabaseService.getMovements();
    const storedRepairs = DatabaseService.getRepairs();

    const pIdx = storedProducts.findIndex(p => p.id === prod.id);
    if (pIdx >= 0) {
      storedProducts[pIdx].currentStock -= partQty;
      storedMovements.unshift({
        id: `mov-rep-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: currentUser.id,
        userName: currentUser.name,
        productId: prod.id,
        productName: prod.nameAr,
        locationId: activeLocation.id,
        type: 'repair_use',
        prevQty: prod.currentStock,
        changeQty: -partQty,
        newQty: prod.currentStock - partQty,
        unitCost: prod.costPrice,
        referenceDoc: selectedTicketForParts.ticketNumber,
        notes: `استهلاك قطعة غيار لصيانة جهاز ${selectedTicketForParts.brand} ${selectedTicketForParts.model}`
      });
    }

    const rIdx = storedRepairs.findIndex(r => r.id === selectedTicketForParts.id);
    if (rIdx >= 0) {
      storedRepairs[rIdx].partsUsed.push({
        productId: prod.id,
        productName: prod.nameAr,
        qty: partQty,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice
      });
      // Recalc final cost = laborCost + parts.sellingPrice
      const partsTotal = storedRepairs[rIdx].partsUsed.reduce((sum, p) => sum + (p.sellingPrice * p.qty), 0);
      storedRepairs[rIdx].finalCost = storedRepairs[rIdx].laborCost + partsTotal;
    }

    DatabaseService.saveProducts(storedProducts);
    localStorage.setItem('tp_movements_v2', JSON.stringify(storedMovements));
    DatabaseService.saveRepairs(storedRepairs);

    setSelectedTicketForParts(null);
    refreshAllData();
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-400" />
            <span>ورشة الصيانة والدعم الفني (RMA & Repairs)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            استلام أجهزة الزبائن، فحص الأعطال، استهلاك قطع الغيار من المخزن، ومتابعة مراحل التصليح
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>فتح تذكرة صيانة جديدة</span>
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
            placeholder="ابحث برقم التذكرة، العميل، الهاتف، أو الموديل..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg ps-9 pe-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto py-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            كافة الحالات
          </button>
          {statuses.map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                statusFilter === s.id ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Repairs Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            لا توجد تذاكر صيانة مطابقة
          </div>
        ) : (
          filtered.map(r => {
            const statusObj = statuses.find(s => s.id === r.status) || statuses[0];

            return (
              <div
                key={r.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-teal-400">
                      {r.ticketNumber}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${statusObj.color}`}>
                      {statusObj.label}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">
                    {r.brand} {r.model}
                  </h4>

                  <div className="text-[11px] text-slate-400 space-y-1 mt-2">
                    <div>
                      <span>العميل: </span>
                      <strong className="text-slate-200">{r.customerName}</strong>
                      <span className="font-mono text-[10px] text-slate-500 ms-1">({r.customerPhone})</span>
                    </div>

                    {r.serialNumber && (
                      <div className="font-mono text-[10px] text-teal-400">
                        SN: {r.serialNumber}
                      </div>
                    )}

                    <div className="p-2 bg-slate-950 rounded text-slate-300 border border-slate-800/80 leading-relaxed text-[11px]">
                      {r.problemDescription}
                    </div>

                    {/* Parts Used */}
                    {r.partsUsed.length > 0 && (
                      <div className="pt-1 text-[10px] text-teal-400">
                        قطع مستهلكة: {r.partsUsed.map(p => `${p.productName} (x${p.qty})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">التكلفة الإجمالية:</span>
                    <strong className="font-mono text-teal-300">{formatCurrency(r.finalCost || r.estimatedCost)}</strong>
                  </div>

                  {/* Stage Switcher Controls */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={r.status}
                      onChange={e => updateRepairStatus(r.id, e.target.value as RepairStatus)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[11px] focus:outline-none"
                    >
                      {statuses.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setSelectedTicketForParts(r)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] whitespace-nowrap"
                      title="استهلاك قطعة غيار من المخزن"
                    >
                      + قطعة غيار
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Attach Part from Stock Modal */}
      {selectedTicketForParts && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>خصم واستهلاك قطعة غيار من المخزون</span>
              </h3>
              <button onClick={() => setSelectedTicketForParts(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
              <div>تذكرة: <strong className="font-mono text-teal-400">{selectedTicketForParts.ticketNumber}</strong></div>
              <div>الجهاز: <strong className="text-white">{selectedTicketForParts.brand} {selectedTicketForParts.model}</strong></div>
            </div>

            <form onSubmit={handleAttachPart} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر قطعة الغيار من المخزون:</label>
                <select
                  value={selectedPartId}
                  onChange={e => setSelectedPartId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr} (سعر: {p.sellingPrice.toLocaleString()} دج · متوفر: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الكمية المستهلكة:</label>
                <input
                  type="number"
                  min="1"
                  value={partQty}
                  onChange={e => setPartQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForParts(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  صرف القطعة وربطها بالتذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-400" />
                <span>فتح تذكرة صيانة جديدة (RMA Ticket)</span>
              </h3>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                    placeholder="مثال: يوسف بوعكاز"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                    placeholder="0661 00 00 00"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع الجهاز:</label>
                  <select
                    value={deviceType}
                    onChange={e => setDeviceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none"
                  >
                    <option value="Laptop">Laptop (محمول)</option>
                    <option value="Desktop">Desktop (مكتبي)</option>
                    <option value="Monitor">Monitor (شاشة)</option>
                    <option value="Printer">Printer (طابعة)</option>
                    <option value="GPU">GPU (كرت شاشة)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">العلامة (Brand):</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الموديل (Model):</label>
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    required
                    placeholder="ROG Strix G16"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الرقم التسلسلي للجهاز (S/N):</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                  placeholder="اختياري - للربط بالضمان"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">وصف العطل والمشكلة بدقة:</label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  required
                  placeholder="مثال: الجهاز ينطفئ بعد 10 دقائق من تشغيل الألعاب، صوت مروحة عالي..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الملحقات المستلمة:</label>
                  <input
                    type="text"
                    value={accessories}
                    onChange={e => setAccessories(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">التكلفة التقديرية المبدئية (دج):</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={e => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-war"
                  checked={isWarranty}
                  onChange={e => setIsWarranty(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-teal-500"
                />
                <label htmlFor="chk-war" className="text-slate-300 cursor-pointer">
                  صيانة مجانية تحت الضمان التجاري (Warranty Repair)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  إصدار تذكرة الصيانة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
