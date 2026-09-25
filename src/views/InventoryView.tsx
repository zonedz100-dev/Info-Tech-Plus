import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StockMovement, StockTransfer } from '../types';
import { 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  FileText,
  Warehouse,
  RotateCcw,
  X
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { 
    products, 
    movements, 
    locations, 
    activeLocation, 
    currentUser, 
    formatCurrency, 
    t,
    refreshAllData 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'movements' | 'transfer' | 'stocktake'>('movements');
  const [movementSearch, setMovementSearch] = useState('');

  // Transfer Form State
  const [sourceLoc, setSourceLoc] = useState(locations[0]?.id || 'loc-1');
  const [targetLoc, setTargetLoc] = useState(locations[1]?.id || 'loc-2');
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState(1);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Stocktake Form State
  const [stocktakeCounts, setStocktakeCounts] = useState<Record<string, number>>({});
  const [stocktakeSuccess, setStocktakeSuccess] = useState(false);

  // Filtered movements
  const filteredMovements = movements.filter(m => {
    const q = movementSearch.toLowerCase();
    return (
      m.productName.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      (m.referenceDoc && m.referenceDoc.toLowerCase().includes(q)) ||
      m.userName.toLowerCase().includes(q)
    );
  });

  const getMovementTypeBadge = (type: StockMovement['type']) => {
    switch (type) {
      case 'purchase':
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono">شراء (+استلام)</span>;
      case 'sale':
        return <span className="bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono">بيع (-صرف)</span>;
      case 'transfer_in':
        return <span className="bg-teal-500/15 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-[10px] font-mono">تحويل وارد (+)</span>;
      case 'transfer_out':
        return <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono">تحويل صادر (-)</span>;
      case 'repair_use':
        return <span className="bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-mono">استهلاك صيانة (-)</span>;
      case 'stocktake_adjustment':
        return <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-mono">تسوية جرد</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono">{type}</span>;
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceLoc === targetLoc) {
      alert('يجب اختيار موقعين مختلفين للتحويل!');
      return;
    }

    const prod = products.find(p => p.id === transferProductId);
    if (!prod || prod.currentStock < transferQty) {
      alert('الكمية المطلوبة غير متوفرة في الرصيد!');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const docNumber = `TRF-${Date.now().toString().slice(-6)}`;
    const storedMovements = JSON.parse(localStorage.getItem('tp_movements_v2') || '[]');

    // 1. Transfer Out
    storedMovements.unshift({
      id: `mov-trf-out-${Date.now()}`,
      date: nowStr,
      userId: currentUser.id,
      userName: currentUser.name,
      productId: prod.id,
      productName: prod.nameAr,
      locationId: sourceLoc,
      type: 'transfer_out',
      prevQty: prod.currentStock,
      changeQty: -transferQty,
      newQty: prod.currentStock - transferQty,
      unitCost: prod.costPrice,
      referenceDoc: docNumber,
      notes: `تحويل بضاعة إلى ${locations.find(l => l.id === targetLoc)?.nameAr}`
    });

    // 2. Transfer In
    storedMovements.unshift({
      id: `mov-trf-in-${Date.now()}`,
      date: nowStr,
      userId: currentUser.id,
      userName: currentUser.name,
      productId: prod.id,
      productName: prod.nameAr,
      locationId: targetLoc,
      type: 'transfer_in',
      prevQty: 0,
      changeQty: transferQty,
      newQty: transferQty,
      unitCost: prod.costPrice,
      referenceDoc: docNumber,
      notes: `استلام بضاعة محولة من ${locations.find(l => l.id === sourceLoc)?.nameAr}`
    });

    localStorage.setItem('tp_movements_v2', JSON.stringify(storedMovements));
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 3000);
    refreshAllData();
  };

  const handleApplyStocktake = () => {
    const storedMovements = JSON.parse(localStorage.getItem('tp_movements_v2') || '[]');
    const storedProducts = JSON.parse(localStorage.getItem('tp_products_v2') || '[]');
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const countNumber = `STK-${Date.now().toString().slice(-6)}`;

    let adjustmentsCount = 0;

    Object.entries(stocktakeCounts).forEach(([prodId, countedQty]) => {
      const pIdx = storedProducts.findIndex((p: any) => p.id === prodId);
      if (pIdx >= 0) {
        const prevQty = storedProducts[pIdx].currentStock;
        const diff = countedQty - prevQty;
        if (diff !== 0) {
          storedProducts[pIdx].currentStock = countedQty;
          storedMovements.unshift({
            id: `mov-stk-${Date.now()}-${pIdx}`,
            date: nowStr,
            userId: currentUser.id,
            userName: currentUser.name,
            productId: prodId,
            productName: storedProducts[pIdx].nameAr,
            locationId: activeLocation.id,
            type: 'stocktake_adjustment',
            prevQty,
            changeQty: diff,
            newQty: countedQty,
            unitCost: storedProducts[pIdx].costPrice,
            referenceDoc: countNumber,
            notes: `تسوية جرد فعلي (الفارق: ${diff > 0 ? '+' : ''}${diff})`
          });
          adjustmentsCount++;
        }
      }
    });

    localStorage.setItem('tp_products_v2', JSON.stringify(storedProducts));
    localStorage.setItem('tp_movements_v2', JSON.stringify(storedMovements));
    setStocktakeSuccess(true);
    setTimeout(() => setStocktakeSuccess(false), 3000);
    refreshAllData();
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner with Luxury Gradient & Glowing Brand Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-teal-500/25 p-5 rounded-2xl shadow-xl shadow-black/30 erp-card-glow relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-32 bg-teal-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/25 to-emerald-600/30 text-teal-300 border border-teal-500/40 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>إدارة المخزون وحركات المستودع</span>
                <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                  Inventory & Ledger
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                سجل حركة كل قطعة بدقة، التحويل بين الفروع، والتسوية بعد الجرد الفعلي
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-[#070E1C]/90 p-1.5 rounded-xl border border-slate-700/80 relative z-10 shadow-inner">
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-2 text-xs rounded-lg transition-all font-bold cursor-pointer ${
              activeTab === 'movements' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            دفتر الحركات (Ledger)
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-3.5 py-2 text-xs rounded-lg transition-all font-bold cursor-pointer ${
              activeTab === 'transfer' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            تحويل بين الفروع
          </button>
          <button
            onClick={() => setActiveTab('stocktake')}
            className={`px-3.5 py-2 text-xs rounded-lg transition-all font-bold cursor-pointer ${
              activeTab === 'stocktake' ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            الجرد الفعلي والتسوية
          </button>
        </div>
      </div>

      {activeTab === 'movements' && (
        <div className="space-y-4">
          {/* Search bar with Luxury Gradient */}
          <div className="bg-gradient-to-r from-[#0C1527]/90 via-[#0E1B32]/80 to-[#0A1324]/90 p-4 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-black/20">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-cyan-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={movementSearch}
                onChange={e => setMovementSearch(e.target.value)}
                placeholder="ابحث بالمنتج، نوع الحركة، أو رقم الوثيقة..."
                className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl ps-10 pe-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-inner font-medium"
              />
            </div>
            <div className="text-xs text-slate-300 font-mono font-medium">
              إجمالي الحركات المسجلة: <strong className="text-teal-400 text-sm font-black">{filteredMovements.length}</strong> حركة
            </div>
          </div>

          {/* Movements Ledger Table */}
          <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl shadow-black/20 erp-card-glow">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="bg-[#070D1A]/95 border-b border-slate-800/90 text-slate-300 font-bold">
                    <th className="py-3.5 px-4 text-start">التاريخ والوقت</th>
                    <th className="py-3.5 px-4 text-start">المنتج</th>
                    <th className="py-3.5 px-4 text-center">نوع الحركة</th>
                    <th className="py-3.5 px-4 text-center">الرصيد السابق</th>
                    <th className="py-3.5 px-4 text-center">التغيير</th>
                    <th className="py-3.5 px-4 text-center">الرصيد الجديد</th>
                    <th className="py-3.5 px-4 text-start">المستند المرجعي</th>
                    <th className="py-3.5 px-4 text-start">المستخدم المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredMovements.map(m => (
                    <tr key={m.id} className="hover:bg-cyan-500/[0.04] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {m.date}
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">
                        {m.productName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getMovementTypeBadge(m.type)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {m.prevQty}
                      </td>
                      <td className={`py-3.5 px-4 text-center font-mono font-black ${
                        m.changeQty > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-white">
                        {m.newQty}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-teal-400 text-[11px] font-bold">
                        {m.referenceDoc || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        {m.userName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl p-6 max-w-xl mx-auto space-y-4 shadow-xl shadow-black/30 erp-card-glow">
          <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">تحويل بضاعة بين الفروع والمستودعات</h3>
          </div>

          {transferSuccess && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-md shadow-emerald-950/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم تسجيل حركة التحويل وتحديث الأرصدة بنجاح!</span>
            </div>
          )}

          <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">الموقع المصدر (من):</label>
                <select
                  value={sourceLoc}
                  onChange={e => setSourceLoc(e.target.value)}
                  className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.nameAr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">الموقع الهدف (إلى):</label>
                <select
                  value={targetLoc}
                  onChange={e => setTargetLoc(e.target.value)}
                  className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">المنتج المراد نقله:</label>
              <select
                value={transferProductId}
                onChange={e => setTransferProductId(e.target.value)}
                className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr} (المخزون المتوفر: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">الكمية المراد نقلها:</label>
              <input
                type="number"
                min="1"
                value={transferQty}
                onChange={e => setTransferQty(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500 font-bold text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>تنفيذ التحويل وتوليد السند</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'stocktake' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#0C1527]/95 via-[#111F38]/90 to-[#0A1224]/95 border border-slate-800/90 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-black/20 erp-card-glow">
            <div>
              <h3 className="text-sm font-black text-white">جلسة جرد المستودع الفعلي (Physical Stocktake)</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                أدخل الكميات المحصية فعلياً على الرفوف؛ سيقوم النظام باحتساب الفارق وتسوية الأرصدة آلياً
              </p>
            </div>
            <button
              onClick={handleApplyStocktake}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer ring-1 ring-white/20 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الجرد وتسوية الفوارق</span>
            </button>
          </div>

          {stocktakeSuccess && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-md shadow-emerald-950/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم اعتماد الجرد وتسجيل قيود التسوية في دفتر الحركات بنجاح!</span>
            </div>
          )}

          <div className="bg-gradient-to-b from-[#0C1527] to-[#0A1224] border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl shadow-black/20 erp-card-glow">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-[#070D1A]/95 border-b border-slate-800/90 text-slate-300 font-bold">
                  <th className="py-3.5 px-4 text-start">المنتج</th>
                  <th className="py-3.5 px-4 text-center">رصيد النظام الحالي</th>
                  <th className="py-3.5 px-4 text-center">الرصيد الفعلي المعدود</th>
                  <th className="py-3.5 px-4 text-center">الفارق (Variance)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map(p => {
                  const counted = stocktakeCounts[p.id] !== undefined ? stocktakeCounts[p.id] : p.currentStock;
                  const variance = counted - p.currentStock;

                  return (
                    <tr key={p.id} className="hover:bg-cyan-500/[0.04] transition-colors">
                      <td className="py-3 px-4 text-white font-medium">
                        <div className="font-bold">{p.nameAr}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-slate-200 text-sm">
                        {p.currentStock}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          value={counted}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setStocktakeCounts(prev => ({ ...prev, [p.id]: val }));
                          }}
                          className="w-24 text-center bg-[#070E1C]/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-teal-500 shadow-inner"
                        />
                      </td>
                      <td className={`py-3 px-4 text-center font-mono font-black text-sm ${
                        variance === 0 ? 'text-slate-500' : variance > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {variance > 0 ? `+${variance}` : variance}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
