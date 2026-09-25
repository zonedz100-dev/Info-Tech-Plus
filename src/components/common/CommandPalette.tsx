import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Users, 
  Receipt, 
  Barcode, 
  Wrench, 
  ArrowRight,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { products, customers, sales, serials, t, formatCurrency } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  // Search Results
  const matchedProducts = products.filter(p => 
    p.name.toLowerCase().includes(cleanQ) || 
    p.nameAr.includes(cleanQ) || 
    p.barcode.includes(cleanQ) || 
    p.sku.toLowerCase().includes(cleanQ)
  ).slice(0, 4);

  const matchedSerials = serials.filter(s => 
    s.serialNumber.toLowerCase().includes(cleanQ) || 
    (s.imei && s.imei.includes(cleanQ))
  ).slice(0, 3);

  const matchedCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(cleanQ) || 
    c.phone.includes(cleanQ)
  ).slice(0, 3);

  const matchedSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(cleanQ) || 
    s.customerName.toLowerCase().includes(cleanQ)
  ).slice(0, 3);

  const quickShortcuts = [
    { label: 'فتح نقطة البيع (POS)', tab: 'pos', icon: ShoppingCart },
    { label: 'إضافة منتج جديد للمخزن', tab: 'products', icon: Package },
    { label: 'فحص الضمان بالأرقام التسلسلية', tab: 'warranty', icon: Barcode },
    { label: 'فتح تذكرة صيانة جديدة', tab: 'repairs', icon: Wrench },
    { label: 'إدارة الصندوق والوردية', tab: 'cashRegister', icon: Receipt },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-teal-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث عن منتج، رقم تسلسلي (SN)، عميل، فاتورة، أو اختر أمراً..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {cleanQ.length === 0 ? (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">إجراءات سريعة</div>
              <div className="space-y-1 mt-1">
                {quickShortcuts.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(s.tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-teal-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-teal-400" />
                        <span>{s.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Matched Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-teal-400">المنتجات</div>
                  <div className="space-y-1 mt-1">
                    {matchedProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigate('products');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-start transition-colors"
                      >
                        <div>
                          <div className="font-medium text-white">{p.nameAr || p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            SKU: {p.sku} · باركود: {p.barcode} · المخزون: {p.currentStock}
                          </div>
                        </div>
                        <div className="font-mono text-teal-400 font-semibold">{formatCurrency(p.sellingPrice)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Serials */}
              {matchedSerials.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-teal-400">الأرقام التسلسلية (Serials)</div>
                  <div className="space-y-1 mt-1">
                    {matchedSerials.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onNavigate('serials');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-start transition-colors"
                      >
                        <div>
                          <div className="font-mono text-white font-bold">{s.serialNumber}</div>
                          <div className="text-[11px] text-slate-400">{s.productName}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          s.status === 'in_stock' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {s.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-teal-400">العملاء والديون</div>
                  <div className="space-y-1 mt-1">
                    {matchedCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate('customers');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-start transition-colors"
                      >
                        <div>
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                        </div>
                        {c.outstandingDebt > 0 && (
                          <span className="text-[11px] text-rose-400 font-mono">
                            دين: {formatCurrency(c.outstandingDebt)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Invoices */}
              {matchedSales.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-semibold text-teal-400">الفواتير</div>
                  <div className="space-y-1 mt-1">
                    {matchedSales.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onNavigate('sales');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 text-start transition-colors"
                      >
                        <div>
                          <div className="font-mono text-white font-bold">{s.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-400">{s.customerName} · {s.date.substring(0, 10)}</div>
                        </div>
                        <div className="font-mono text-teal-400">{formatCurrency(s.grandTotal)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedProducts.length === 0 && matchedSerials.length === 0 && matchedCustomers.length === 0 && matchedSales.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  لم يتم العثور على أي نتائج مطابقة لـ "{query}"
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-3 bg-slate-950">
          <span>اضغط ESC للإغلاق</span>
          <span className="font-mono">TechPulse Global Search</span>
        </div>
      </div>
    </div>
  );
};
