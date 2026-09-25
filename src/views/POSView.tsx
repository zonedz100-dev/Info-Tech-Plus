import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Customer, SaleItem, SplitPayment, PaymentMethod } from '../types';
import { 
  Search, 
  Barcode, 
  User, 
  Plus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Printer, 
  PauseCircle, 
  PlayCircle, 
  CheckCircle, 
  AlertCircle,
  Tag,
  Shield,
  Laptop,
  Layers,
  X,
  ArrowRight,
  Sparkles,
  Coins,
  Building,
  Clock,
  Check
} from 'lucide-react';
import { InvoicePrintModal } from '../components/common/InvoicePrintModal';
import { getCategoryTheme, PAYMENT_METHOD_THEMES } from '../utils/theme';
import { InfoTechLogo } from '../components/common/InfoTechLogo';

interface POSViewProps {
  onNavigate: (tab: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({ onNavigate }) => {
  const { 
    products, 
    serials, 
    customers, 
    processPOSSale, 
    formatCurrency, 
    t, 
    currentUser,
    activeLocation,
    addCustomer
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Held Sales State (F5)
  const [heldSales, setHeldSales] = useState<{ id: string; customer: Customer | null; items: SaleItem[]; timestamp: string }[]>([]);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payments, setPayments] = useState<SplitPayment[]>([
    { method: 'cash', amount: 0, reference: '' }
  ]);
  const [creditDueDate, setCreditDueDate] = useState<string>('');

  // Fast Add Customer Modal
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Print Modal
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // Error Alert
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Category & Brand lists
  const rawCategories = Array.from(new Set(products.map(p => p.category)));
  const categories = ['all', ...rawCategories];
  const brands = ['all', ...Array.from(new Set(products.map(p => p.brand)))];

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty - item.discount), 0);
  const grandTotal = Math.max(0, subtotal - invoiceDiscount);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remainingCredit = Math.max(0, grandTotal - totalPaid);

  // Focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard Shortcuts (F1 - F8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        clearCart();
      } else if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowCustomerModal(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleHoldSale();
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (cart.length > 0) openPaymentModal();
      } else if (e.key === 'Escape') {
        if (showPaymentModal) setShowPaymentModal(false);
        if (showCustomerModal) setShowCustomerModal(false);
        if (errorMessage) setErrorMessage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showPaymentModal, showCustomerModal, errorMessage]);

  // Barcode enter handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      // 1. Direct barcode match
      const matchedByBarcode = products.find(p => p.barcode.toLowerCase() === q);
      if (matchedByBarcode) {
        addToCart(matchedByBarcode);
        setSearchQuery('');
        return;
      }

      // 2. Direct Serial Number match
      const matchedSerial = serials.find(s => s.serialNumber.toLowerCase() === q && s.status === 'in_stock');
      if (matchedSerial) {
        const prod = products.find(p => p.id === matchedSerial.productId);
        if (prod) {
          addToCart(prod, matchedSerial.serialNumber);
          setSearchQuery('');
          return;
        }
      }

      // 3. Fallback: First matched product
      const matched = filteredProducts[0];
      if (matched) {
        addToCart(matched);
        setSearchQuery('');
      }
    }
  };

  // Filter products by category, brand, and query
  const filteredProducts = products.filter(p => {
    if (!p.active) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q) || (p.nameAr && p.nameAr.toLowerCase().includes(q));
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBarcode = p.barcode.toLowerCase().includes(q);
      const matchModel = p.model?.toLowerCase().includes(q);
      return matchName || matchSku || matchBarcode || matchModel;
    }

    return true;
  });

  // Cart operations
  const addToCart = (product: Product, specificSerial?: string) => {
    if (product.currentStock <= 0) {
      setErrorMessage(`المنتج ${product.nameAr || product.name} نفد من المخزون!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === product.id);

      if (existing) {
        if (existing.qty >= product.currentStock) {
          setErrorMessage(`لا يمكن تجاوز المخزون المتوفر (${product.currentStock})`);
          return prevCart;
        }

        const newQty = existing.qty + 1;
        let newSerials = existing.serialNumbers ? [...existing.serialNumbers] : [];
        if (specificSerial && !newSerials.includes(specificSerial)) {
          newSerials.push(specificSerial);
        }

        return prevCart.map(item =>
          item.productId === product.id
            ? {
                ...item,
                qty: newQty,
                serialNumbers: newSerials,
                total: item.unitPrice * newQty - item.discount
              }
            : item
        );
      } else {
        const initialSerials = specificSerial ? [specificSerial] : [];
        return [
          ...prevCart,
          {
            productId: product.id,
            productName: product.nameAr || product.name,
            sku: product.sku,
            barcode: product.barcode,
            type: product.type,
            qty: 1,
            unitPrice: product.sellingPrice,
            costPrice: product.costPrice,
            discount: 0,
            total: product.sellingPrice,
            warrantyMonths: product.warrantyMonths,
            serialNumbers: initialSerials
          }
        ];
      }
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.productId === productId) {
            const targetQty = item.qty + delta;
            if (targetQty <= 0) return null;
            if (targetQty > prod.currentStock) {
              setErrorMessage(`الكمية القصوى المتوفرة في المخزن هي: ${prod.currentStock}`);
              return item;
            }
            let updatedSerials = item.serialNumbers ? [...item.serialNumbers] : [];
            if (updatedSerials.length > targetQty) {
              updatedSerials = updatedSerials.slice(0, targetQty);
            }
            return {
              ...item,
              qty: targetQty,
              serialNumbers: updatedSerials,
              total: item.unitPrice * targetQty - item.discount
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[];
    });
  };

  const updateItemSerial = (productId: string, serialIndex: number, serialVal: string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const serialsCopy = item.serialNumbers ? [...item.serialNumbers] : [];
          serialsCopy[serialIndex] = serialVal;
          return { ...item, serialNumbers: serialsCopy };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setInvoiceDiscount(0);
    setNotes('');
  };

  // Hold & Recall
  const handleHoldSale = () => {
    if (cart.length === 0) return;
    setHeldSales(prev => [
      ...prev,
      {
        id: `HOLD-${Date.now()}`,
        customer: selectedCustomer,
        items: cart,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    clearCart();
  };

  const handleRecallSale = (held: typeof heldSales[0]) => {
    setCart(held.items);
    if (held.customer) setSelectedCustomer(held.customer);
    setHeldSales(prev => prev.filter(h => h.id !== held.id));
  };

  // Open Payment
  const openPaymentModal = () => {
    for (const item of cart) {
      if (item.type === 'serial') {
        if (!item.serialNumbers || item.serialNumbers.length !== item.qty) {
          setErrorMessage(`يرجى اختيار الرقم التسلسلي (Serial Number) لكل جهاز من: ${item.productName}`);
          return;
        }
      }
    }

    setPayments([{ method: 'cash', amount: grandTotal, reference: '' }]);
    setShowPaymentModal(true);
  };

  const setQuickCash = (amount: number) => {
    setPayments([{ method: 'cash', amount, reference: '' }]);
  };

  const setSinglePaymentMethod = (method: PaymentMethod) => {
    setPayments([{ method, amount: grandTotal, reference: '' }]);
  };

  // Submit Sale Transaction
  const handleSubmitSale = () => {
    if (!selectedCustomer) {
      setErrorMessage('يرجى اختيار العميل لإتمام العملية وإصدار الفاتورة');
      return;
    }

    const cleanPayments = payments.filter(p => Number(p.amount) > 0);
    if (remainingCredit > 0) {
      cleanPayments.push({
        method: 'credit',
        amount: remainingCredit,
        reference: `CREDIT-${Date.now()}`
      });
    }

    const saleResult = processPOSSale({
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      items: cart,
      subtotal,
      discount: invoiceDiscount,
      tax: 0,
      grandTotal,
      paidAmount: totalPaid,
      remainingDebt: remainingCredit,
      payments: cleanPayments,
      dueDate: remainingCredit > 0 ? creditDueDate : undefined,
      warrantyStart: new Date().toISOString().substring(0, 10),
      status: 'completed',
      notes,
      locationId: activeLocation.id
    });

    if (saleResult.success && saleResult.sale) {
      setCompletedSale(saleResult.sale);
      setShowPaymentModal(false);
      clearCart();
    } else {
      setErrorMessage(saleResult.error || 'فشلت معالجة الفاتورة');
    }
  };

  const handleCreateCustomer = () => {
    if (!newCustName.trim()) return;
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '0550000000',
    });
    setSelectedCustomer(created);
    setShowCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden select-none erp-bg-mesh">
      {/* Error Floating Alert */}
      {errorMessage && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-rose-400/50 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ms-3 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Left: Product Grid, Category Strip & Barcode Search */}
      <div className="flex-1 flex flex-col border-e border-slate-800/80 overflow-hidden">
        {/* Top Search Bar & Category Scroller */}
        <div className="p-3 bg-gradient-to-r from-[#0A1324]/90 via-[#0D1932]/85 to-[#091122]/90 border-b border-slate-800/80 flex flex-col sm:flex-row items-center gap-2.5 shrink-0 backdrop-blur-md">
          {/* Prominent Store Brand Logo Badge */}
          <div 
            onClick={() => onNavigate('settings')} 
            className="shrink-0 cursor-pointer hidden md:flex items-center gap-2 p-0.5 rounded-xl hover:bg-slate-800/60 transition-all group" 
            title="شعار المتجر (اضغط لتعديل الإعدادات واللوغو)"
          >
            <InfoTechLogo size="sm" showText={false} interactive />
          </div>

          {/* Barcode / Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="امسح الباركود، أو ابحث بالاسم، SKU، أو السيريال..."
              className="w-full bg-[#060C18]/90 border border-slate-700/60 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl ps-9 pe-20 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold">
                ENTER
              </span>
            </div>
          </div>

          {/* Quick Brand Selector */}
          <div className="w-full sm:w-44">
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full bg-[#060C18]/90 border border-slate-700/60 rounded-xl px-2.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-medium"
            >
              <option value="all">كل الماركات (All Brands)</option>
              {brands.filter(b => b !== 'all').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expressive Category Tabs (Aronium inspired with colorful themed buttons) */}
        <div className="px-3 py-2 bg-gradient-to-r from-[#080E1C] via-[#091124] to-[#070D18] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {categories.map(cat => {
            const theme = getCategoryTheme(cat);
            const Icon = theme.icon;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isSelected
                    ? `${theme.activeTabBg} ${theme.activeTabText} shadow-lg ring-1 ring-white/20 scale-[1.02]`
                    : 'bg-gradient-to-b from-[#0E172A]/90 to-[#0A1222]/90 border border-slate-700/60 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
                style={isSelected ? { boxShadow: `0 4px 14px ${theme.glowColor}` } : {}}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? '' : theme.badgeText}`} />
                <span>{theme.nameAr}</span>
              </button>
            );
          })}
        </div>

        {/* Product Catalog Grid with Vivid Colors & Touch Friendly Cards */}
        <div className="flex-1 p-3 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <Laptop className="w-12 h-12 text-slate-600 mb-2 stroke-1" />
              <span>لا توجد منتجات مطابقة في هذا التصنيف</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map(p => {
                const inCart = cart.find(i => i.productId === p.id);
                const isOutOfStock = p.currentStock <= 0;
                const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStock;
                const theme = getCategoryTheme(p.category);

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`group relative p-3 rounded-2xl border text-start flex flex-col justify-between transition-all duration-150 cursor-pointer overflow-hidden shadow-md ${
                      isOutOfStock
                        ? 'opacity-40 bg-[#070D18] border-slate-900 cursor-not-allowed'
                        : inCart
                        ? 'bg-gradient-to-b from-[#10203D] to-[#0A1428] border-cyan-400 shadow-lg shadow-cyan-500/15 scale-[1.01]'
                        : 'bg-gradient-to-b from-[#0F1C34]/85 to-[#091122]/90 border-slate-700/60 hover:border-cyan-500/50 hover:bg-[#12203A]'
                    }`}
                  >
                    {/* Top Category Accent Line */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 transition-opacity" 
                      style={{ backgroundColor: theme.barColor }}
                    />

                    <div>
                      {/* Brand & Stock Status */}
                      <div className="flex items-center justify-between text-[11px] mb-1.5 mt-0.5">
                        <span className="font-mono text-slate-400 font-semibold">{p.brand}</span>
                        
                        {/* Expressive Stock Indicator */}
                        {isOutOfStock ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            نفد
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold">
                            قليل ({p.currentStock})
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                            متوفر: {p.currentStock}
                          </span>
                        )}
                      </div>

                      {/* Product Title */}
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug mb-1 group-hover:text-cyan-300 transition-colors">
                        {p.nameAr || p.name}
                      </h4>

                      {/* Category & Serial Pill */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                          {theme.nameAr}
                        </span>

                        {p.type === 'serial' && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono font-semibold">
                            <Barcode className="w-3 h-3 text-cyan-400" />
                            <span>سيريال</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & In-Cart Counter */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">السعر:</div>
                        <div className="font-mono text-sm font-black text-emerald-400 tracking-tight">
                          {formatCurrency(p.sellingPrice)}
                        </div>
                      </div>

                      {inCart ? (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/40">
                          {inCart.qty}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-slate-800/90 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all shadow-sm">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Fast Action Bar with Tangible Hotkeys */}
        <div className="p-2.5 bg-gradient-to-r from-[#070D18] via-[#091122] to-[#070D18] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={clearCart} 
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-rose-500/40 text-slate-200 transition-colors shadow-sm"
            >
              <kbd className="font-mono font-bold text-rose-400 text-[10px] bg-slate-800 px-1 rounded">F1</kbd>
              <span>بيع جديد</span>
            </button>

            <button 
              onClick={() => searchInputRef.current?.focus()} 
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 transition-colors shadow-sm"
            >
              <kbd className="font-mono font-bold text-cyan-400 text-[10px] bg-slate-800 px-1 rounded">F2</kbd>
              <span>البحث</span>
            </button>

            <button 
              onClick={() => setShowCustomerModal(true)} 
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-amber-500/40 text-slate-200 transition-colors shadow-sm"
            >
              <kbd className="font-mono font-bold text-amber-400 text-[10px] bg-slate-800 px-1 rounded">F3</kbd>
              <span>عميل جديد</span>
            </button>

            <button 
              onClick={handleHoldSale} 
              disabled={cart.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-yellow-500/40 text-slate-200 disabled:opacity-40 transition-colors shadow-sm"
            >
              <kbd className="font-mono font-bold text-yellow-400 text-[10px] bg-slate-800 px-1 rounded">F5</kbd>
              <span>تعليق الفاتورة</span>
            </button>
          </div>

          {heldSales.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs font-semibold">فواتير معلقة:</span>
              {heldSales.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => handleRecallSale(h)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono font-semibold"
                >
                  #{idx + 1} ({h.items.length} بنود - {h.timestamp})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Right: Cart, Customer Selector, Totals & Pay */}
      <div className="w-full lg:w-96 bg-gradient-to-b from-[#0C152B]/95 via-[#0E1A34]/90 to-[#080E1C]/95 flex flex-col justify-between shrink-0 overflow-hidden border-s border-slate-800/80 backdrop-blur-xl">
        {/* Customer Select Bar with Credit Warning */}
        <div className="p-3 border-b border-slate-800/80 bg-gradient-to-r from-[#0E182E] to-[#0A1224] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <select
              value={selectedCustomer?.id || ''}
              onChange={e => {
                const c = customers.find(item => item.id === e.target.value);
                setSelectedCustomer(c || null);
              }}
              className="w-full bg-[#060C18] border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-white truncate focus:outline-none focus:border-cyan-500/50 font-medium"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.outstandingDebt > 0 ? `(دين: ${c.outstandingDebt.toLocaleString()} دج)` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCustomerModal(true)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 transition-colors shrink-0 shadow-sm"
            title="إضافة عميل جديد (F3)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Balance Reminder if outstanding debt exists */}
        {selectedCustomer && selectedCustomer.outstandingDebt > 0 && (
          <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-semibold shrink-0">
            <span>رصيد ديون سابق على العميل:</span>
            <span className="font-mono font-bold text-amber-400">{formatCurrency(selectedCustomer.outstandingDebt)}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-500 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-300">سلة المبيعات فارغة</span>
              <span className="text-[11px] text-slate-500">امسح الباركود أو انقر على أي منتج لإضافته</span>
            </div>
          ) : (
            cart.map(item => {
              const availableSerials = serials.filter(s => s.productId === item.productId && s.status === 'in_stock');
              const theme = getCategoryTheme(item.sku.split('-')[0]);

              return (
                <div key={item.productId} className="p-3 rounded-xl bg-gradient-to-r from-[#0F1C34]/90 to-[#0A1428]/90 border border-slate-700/70 space-y-2.5 shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white leading-tight truncate">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span className="text-cyan-400 font-semibold">{formatCurrency(item.unitPrice)}</span>
                        {item.warrantyMonths > 0 && (
                          <span className="text-[10px] text-teal-300 bg-teal-500/15 px-1.5 py-0.2 rounded border border-teal-500/30 font-semibold">
                            ضمان {item.warrantyMonths} شهر
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls & Item Total */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 bg-[#060C18] rounded-lg border border-slate-700/70 p-0.5 shadow-inner">
                      <button
                        onClick={() => updateCartQty(item.productId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-slate-800 font-bold"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs text-white">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.productId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white rounded hover:bg-slate-800 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-mono font-bold text-xs text-emerald-400">
                      {formatCurrency(item.total)}
                    </div>
                  </div>

                  {/* Serial Number Picker if serial-controlled */}
                  {item.type === 'serial' && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 bg-[#060C18]/60 -mx-3 -mb-3 p-2.5 rounded-b-xl">
                      <div className="text-[11px] font-semibold text-cyan-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5" />
                          <span>الرقم التسلسلي (SN) لكل قطعة:</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.serialNumbers?.length || 0} من {item.qty}
                        </span>
                      </div>

                      {Array.from({ length: item.qty }).map((_, sIdx) => {
                        const currentVal = item.serialNumbers?.[sIdx] || '';

                        return (
                          <select
                            key={sIdx}
                            value={currentVal}
                            onChange={e => updateItemSerial(item.productId, sIdx, e.target.value)}
                            className={`w-full bg-[#070D18] border rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none transition-colors ${
                              currentVal 
                                ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/5' 
                                : 'border-rose-500/60 text-rose-300 bg-rose-500/5'
                            }`}
                          >
                            <option value="">-- اختر الرقم التسلسلي للقطعة #{sIdx + 1} --</option>
                            {availableSerials.map(sn => (
                              <option key={sn.id} value={sn.serialNumber}>
                                {sn.serialNumber} (جاهز في المخزن)
                              </option>
                            ))}
                          </select>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Invoice Summary & Checkout Section */}
        <div className="p-3.5 bg-gradient-to-t from-[#080E1C] to-[#0B152A] border-t border-slate-800/90 space-y-2.5 shrink-0 shadow-lg">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>المجموع الفرعي:</span>
              <span className="font-mono text-white font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-400" />
                <span>خصم على الفاتورة:</span>
              </span>
              <input
                type="number"
                value={invoiceDiscount || ''}
                onChange={e => setInvoiceDiscount(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-24 text-end bg-[#060C18] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span className="text-sm">المجموع الإجمالي:</span>
              <span className="font-mono text-xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Quick Pay Action Button (F6) */}
          <button
            onClick={openPaymentModal}
            disabled={cart.length === 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 disabled:opacity-40 text-slate-950 text-sm font-black shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-2 group ring-1 ring-white/20 active:scale-[0.99]"
          >
            <CreditCard className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>إتمام الدفع واختيار القنوات (F6)</span>
            <span className="font-mono font-normal opacity-75">· {formatCurrency(grandTotal)}</span>
          </button>
        </div>
      </div>

      {/* Payment & Split Tender Modal with Authentic Colors */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0C1424] border border-slate-700/80 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">إتمام الدفع وتوزيع المبالغ (Split Payment)</h3>
                  <p className="text-[11px] text-slate-400">اختر طريقة أو أكثر من قنوات الدفع المدعومة</p>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Due Banner with Glowing Gradient */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-[#0F1C33] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-cyan-300 font-semibold">المبلغ الإجمالي المطلوب سداده:</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{formatCurrency(grandTotal)}</div>
              </div>
              <div className="text-end">
                <div className="text-[11px] text-slate-400">العميل المستفيد:</div>
                <div className="text-xs font-bold text-white mt-0.5">{selectedCustomer?.name}</div>
              </div>
            </div>

            {/* Quick 1-Click Payment Method Buttons */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-2">الدفع السريع بكامل المبلغ:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSinglePaymentMethod('cash')}
                  className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>نقداً كاش</span>
                </button>
                <button
                  onClick={() => setSinglePaymentMethod('baridimob')}
                  className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>بريدي موب</span>
                </button>
                <button
                  onClick={() => setSinglePaymentMethod('card')}
                  className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>بطاقة ذهبية/CIB</span>
                </button>
              </div>
            </div>

            {/* Quick Cash Amounts */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">مبالغ نقدية شائعة (Quick Cash DZD):</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1000, 2000, 5000, 10000, 20000, 50000, 100000, grandTotal].map((amt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuickCash(amt)}
                    className="py-1.5 px-2 rounded-lg bg-[#070D18] hover:bg-slate-800 text-slate-200 font-mono text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    {amt.toLocaleString()} دج
                  </button>
                ))}
              </div>
            </div>

            {/* Split Tender entries */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400">توزيع قنوات الدفع (Split Payment):</div>
              {payments.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={p.method}
                    onChange={e => {
                      const updated = [...payments];
                      updated[idx].method = e.target.value as PaymentMethod;
                      setPayments(updated);
                    }}
                    className="bg-[#070D18] border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none w-48 font-semibold"
                  >
                    <option value="cash">💵 نقداً (Cash)</option>
                    <option value="baridimob">📱 بريدي موب (BaridiMob)</option>
                    <option value="ccp">🏛️ حوالة بريدية (CCP)</option>
                    <option value="card">💳 بطاقة بنكية (CIB/Edahabia)</option>
                    <option value="transfer">🏦 تحويل بنكي (Virement)</option>
                    <option value="cheque">📝 شيك بنكي (Cheque)</option>
                  </select>

                  <input
                    type="number"
                    value={p.amount || ''}
                    onChange={e => {
                      const updated = [...payments];
                      updated[idx].amount = Number(e.target.value) || 0;
                      setPayments(updated);
                    }}
                    placeholder="المبلغ المدفوع دج"
                    className="flex-1 bg-[#070D18] border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-2 text-xs text-white font-mono font-bold focus:outline-none"
                  />

                  {payments.length > 1 && (
                    <button
                      onClick={() => setPayments(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => setPayments(prev => [...prev, { method: 'baridimob', amount: 0 }])}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة طريقة دفع إضافية (تجزئة)</span>
              </button>
            </div>

            {/* Remaining Credit Notice */}
            {remainingCredit > 0 && (
              <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>المبلغ المتبقي يُسجل كدين مؤجل (Credit):</span>
                  </span>
                  <span className="font-mono text-sm font-black text-purple-200">{formatCurrency(remainingCredit)}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300">
                  <span>تاريخ الاستحقاق المتفق عليه:</span>
                  <input
                    type="date"
                    value={creditDueDate}
                    onChange={e => setCreditDueDate(e.target.value)}
                    className="bg-[#070D18] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                رجوع
              </button>
              <button
                onClick={handleSubmitSale}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 ring-1 ring-white/20"
              >
                تأكيد وطباعة الفاتورة والضمان
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fast Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0C1424] border border-slate-700/80 rounded-2xl p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                <span>إضافة عميل جديد سريع</span>
              </h4>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم العميل:</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="مثال: يوسف بلقاسم"
                  className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="0550 12 34 56"
                  className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-1.5 text-xs rounded-xl bg-cyan-500 font-bold text-slate-950 shadow-md shadow-cyan-500/20"
              >
                إضافة العميل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
      />
    </div>
  );
};
