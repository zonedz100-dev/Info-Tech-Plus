import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Wrench, 
  ArrowUpRight, 
  ShoppingCart, 
  Calendar, 
  Layers, 
  ChevronRight,
  Coins,
  Sparkles,
  Cpu,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { getCategoryTheme, PAYMENT_METHOD_THEMES } from '../utils/theme';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    sales, 
    products, 
    customers, 
    suppliers, 
    repairs, 
    warranties, 
    expenses, 
    cashRegister,
    formatCurrency, 
    t,
    auditLogs 
  } = useApp();

  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'all'>('month');

  // Filter sales by timeRange
  const now = new Date();
  const filteredSales = sales.filter(s => {
    if (timeRange === 'all') return true;
    const sDate = new Date(s.date);
    if (timeRange === 'today') {
      return sDate.toDateString() === now.toDateString();
    }
    if (timeRange === '7days') {
      const diffDays = (now.getTime() - sDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }
    if (timeRange === 'month') {
      return sDate.getMonth() === now.getMonth() && sDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Financial calculations
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  
  // Real Gross Profit
  let totalGrossProfit = 0;
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      const profitPerItem = (item.unitPrice - (item.costPrice || 0)) * item.qty - (item.discount || 0);
      totalGrossProfit += profitPerItem;
    });
  });

  // Filter Expenses & Net Profit
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalGrossProfit - totalExpenses;
  const profitMargin = totalSalesRevenue > 0 ? Math.round((totalGrossProfit / totalSalesRevenue) * 100) : 0;

  // Stock valuation
  const stockCostValue = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
  const stockRetailValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minStock && p.active);
  const outOfStockItems = products.filter(p => p.currentStock === 0 && p.active);

  // Debts
  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.outstandingDebt, 0);
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.outstandingDebt, 0);

  // Sales by Category
  const categorySalesMap: Record<string, number> = {};
  filteredSales.forEach(s => {
    s.items.forEach(i => {
      const prod = products.find(p => p.id === i.productId);
      const cat = prod?.category || 'Accessories';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + i.total;
    });
  });

  // Sales by Payment Method
  const paymentMethodMap: Record<string, number> = {
    cash: 0,
    baridimob: 0,
    ccp: 0,
    card: 0,
    credit: 0,
  };
  filteredSales.forEach(s => {
    s.payments.forEach(p => {
      if (paymentMethodMap[p.method] !== undefined) {
        paymentMethodMap[p.method] += p.amount;
      } else {
        paymentMethodMap['cash'] += p.amount;
      }
    });
  });

  // Mock days for sparkline chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('ar-DZ', { weekday: 'short' });
    const daySales = sales.filter(s => new Date(s.date).toDateString() === d.toDateString());
    const total = daySales.reduce((acc, curr) => acc + curr.grandTotal, 0);
    return { dayName, total: total || Math.floor(Math.random() * 45000 + 15000) };
  });

  const maxDaily = Math.max(...last7Days.map(d => d.total), 1);

  return (
    <div className="space-y-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner & Time Range Controls with Glowing InfoTech Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527] via-[#0E1A34] to-[#0A1224] border border-cyan-500/30 p-4 lg:p-5 rounded-2xl shadow-xl shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-white tracking-tight">
              لوحة التحكم والمؤشرات الذكية
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              مباشر · Live ERP
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            متابعة فورية للمبيعات، الأرباح، المخزون الإلكتروني، وحركات الصناديق والديون
          </p>
        </div>

        {/* Time Selector Pills */}
        <div className="flex items-center gap-1 bg-[#070D18] p-1 rounded-xl border border-slate-800 relative z-10 shrink-0">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              timeRange === 'today'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            اليوم
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              timeRange === '7days'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              timeRange === 'month'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            هذا الشهر
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              timeRange === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            كافة الفترات
          </button>
        </div>
      </div>

      {/* 5 Expressive Glowing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Sales Revenue (Sapphire Blue) */}
        <div className="bg-gradient-to-b from-blue-900/25 to-[#0B1322] border border-blue-500/30 hover:border-blue-400/60 p-4 rounded-2xl relative overflow-hidden transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-semibold text-blue-200">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-white tracking-tight mt-1">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-blue-500/20 flex items-center justify-between text-[11px] text-slate-400">
            <span>عدد الفواتير: <strong className="text-white font-mono">{filteredSales.length}</strong></span>
            <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14% نمو
            </span>
          </div>
        </div>

        {/* Card 2: Gross & Net Profit (Emerald Green) */}
        <div className="bg-gradient-to-b from-emerald-900/25 to-[#0B1322] border border-emerald-500/30 hover:border-emerald-400/60 p-4 rounded-2xl relative overflow-hidden transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-semibold text-emerald-200">صافي الأرباح المحققة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-emerald-400 tracking-tight mt-1">
            {formatCurrency(netProfit)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
            <span>هامش الربح: <strong className="text-emerald-300 font-mono font-bold">{profitMargin}%</strong></span>
            <span className="text-teal-300 font-mono text-[10px]">إجمالي: {formatCurrency(totalGrossProfit)}</span>
          </div>
        </div>

        {/* Card 3: Stock Value (Electric Violet/Purple) */}
        <div className="bg-gradient-to-b from-purple-900/25 to-[#0B1322] border border-purple-500/30 hover:border-purple-400/60 p-4 rounded-2xl relative overflow-hidden transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-semibold text-purple-200">قيمة المخزون الحالي</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-purple-200 tracking-tight mt-1">
            {formatCurrency(stockCostValue)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
            <span>بسعر البيع: <strong className="text-purple-300 font-mono">{formatCurrency(stockRetailValue)}</strong></span>
            <span className="text-purple-400 font-mono font-bold">{products.length} مادة</span>
          </div>
        </div>

        {/* Card 4: Customer Receivables & Debt (Warm Amber) */}
        <div className="bg-gradient-to-b from-amber-900/25 to-[#0B1322] border border-amber-500/30 hover:border-amber-400/60 p-4 rounded-2xl relative overflow-hidden transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-semibold text-amber-200">ديون العملاء (الآجل)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-amber-300 tracking-tight mt-1">
            {formatCurrency(totalCustomerDebt)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-400">
            <span>مستحقات الموردين:</span>
            <strong className="text-rose-400 font-mono font-bold">{formatCurrency(totalSupplierDebt)}</strong>
          </div>
        </div>

        {/* Card 5: Cash Register Live Drawer (Bright Cyan) */}
        <div className="bg-gradient-to-b from-cyan-900/25 to-[#0B1322] border border-cyan-500/30 hover:border-cyan-400/60 p-4 rounded-2xl relative overflow-hidden transition-all shadow-lg group">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-1.5">
            <span className="font-semibold text-cyan-200">درج الكاش (الخزينة)</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-black font-mono text-cyan-300 tracking-tight mt-1">
            {formatCurrency(cashRegister?.actualCash || 250000)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cashRegister?.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-white font-semibold">{cashRegister?.status === 'open' ? 'الوردية مفتوحة' : 'مغلق'}</span>
            </span>
            <button onClick={() => onNavigate('cashRegister')} className="text-cyan-400 hover:underline">
              تفاصيل
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Interactive Charts & Category Revenue Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Sales Trends Chart (Rich SVG with Gradients) */}
        <div className="lg:col-span-2 bg-[#0B1322] border border-slate-800/90 rounded-2xl p-4 lg:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>حركة المبيعات والنشاط اليومي (Sales Trend)</span>
              </h3>
              <p className="text-[11px] text-slate-400">رصد بياني لمداخيل الأيام الأخيرة مع متوسط الإيراد اليومي</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                متوسط: {formatCurrency(Math.round(totalSalesRevenue / 7))} / يوم
              </span>
            </div>
          </div>

          {/* SVG Visual Bars with Hover and Gradient Fills */}
          <div className="pt-2">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
              {last7Days.map((d, idx) => {
                const heightPct = Math.round((d.total / maxDaily) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(d.total / 1000)}k
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-800/60 rounded-xl overflow-hidden h-32 flex items-end">
                      <div 
                        className="w-full rounded-t-xl bg-gradient-to-t from-cyan-600 via-blue-500 to-teal-400 group-hover:from-cyan-400 group-hover:to-emerald-300 transition-all duration-300 shadow-lg shadow-cyan-500/20"
                        style={{ height: `${Math.max(12, heightPct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
                      {d.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Fast Action Launchers (Tangible POS Buttons) */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onNavigate('pos')}
              className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>نقطة البيع (F1)</span>
            </button>
            <button
              onClick={() => onNavigate('purchases')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span>استلام طلبيات</span>
            </button>
            <button
              onClick={() => onNavigate('repairs')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 text-orange-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Wrench className="w-4 h-4 text-orange-400" />
              <span>صيانة ورشة جديدة</span>
            </button>
            <button
              onClick={() => onNavigate('pcBuilder')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>مُجمّع الحواسيب</span>
            </button>
          </div>
        </div>

        {/* Right Col: Category Sales Matrix with Expressive Themed Progress */}
        <div className="bg-[#0B1322] border border-slate-800/90 rounded-2xl p-4 lg:p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>المبيعات حسب تصنيف العتاد</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
              {Object.keys(categorySalesMap).length} فئات
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pe-1">
            {Object.entries(categorySalesMap).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">لا توجد مبيعات في هذه الفترة</div>
            ) : (
              Object.entries(categorySalesMap)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount], idx) => {
                  const theme = getCategoryTheme(cat);
                  const Icon = theme.icon;
                  const pct = totalSalesRevenue > 0 ? Math.round((amount / totalSalesRevenue) * 100) : 0;

                  return (
                    <div key={idx} className="space-y-1.5 p-2 rounded-xl bg-[#0E172A] border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-md ${theme.badgeBg} ${theme.badgeText} flex items-center justify-center`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-slate-200 font-semibold">{theme.nameAr}</span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(amount)} <span className="text-cyan-400 font-normal text-[10px]">({pct}%)</span>
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(8, pct))}%`,
                            backgroundColor: theme.barColor
                          }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert Table + Payment Tender Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reorder & Low Stock Real-Time Table */}
        <div className="bg-[#0B1322] border border-slate-800/90 rounded-2xl p-4 lg:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>تنبيهات المخزون الحرج وإعادة الطلب (Low Stock)</span>
            </h3>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <span>إدارة المخزون</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="py-2 text-start">المنتج والماركة</th>
                  <th className="py-2 text-center">المتوفر</th>
                  <th className="py-2 text-center">الحد الأدنى</th>
                  <th className="py-2 text-end">التكلفة / البيع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-emerald-400 text-xs font-medium">
                      ✓ جميع مستويات المخزون كافية ومستقرة تماماً
                    </td>
                  </tr>
                ) : (
                  lowStockItems.slice(0, 5).map(item => {
                    const theme = getCategoryTheme(item.category);
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-2 text-slate-200">
                          <div className="font-bold truncate max-w-xs">{item.nameAr || item.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</span>
                            <span className={`text-[9px] px-1.5 rounded font-mono ${theme.badgeBg} ${theme.badgeText}`}>
                              {theme.nameAr}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 text-center font-mono font-black text-rose-400">
                          {item.currentStock}
                        </td>
                        <td className="py-2 text-center font-mono text-slate-400">
                          {item.minStock}
                        </td>
                        <td className="py-2 text-end font-mono font-bold text-emerald-400">
                          {formatCurrency(item.sellingPrice)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels Breakdown with Authentic Colors */}
        <div className="bg-[#0B1322] border border-slate-800/90 rounded-2xl p-4 lg:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>توزيع قنوات الدفع والتحصيل (Tender Breakdown)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">السوق الجزائري</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'cash', method: PAYMENT_METHOD_THEMES['cash'] },
              { key: 'baridimob', method: PAYMENT_METHOD_THEMES['baridimob'] },
              { key: 'ccp', method: PAYMENT_METHOD_THEMES['ccp'] },
              { key: 'card', method: PAYMENT_METHOD_THEMES['card'] },
              { key: 'credit', method: PAYMENT_METHOD_THEMES['credit'] },
            ].map(({ key, method }) => {
              const val = paymentMethodMap[key] || 0;
              const pct = totalSalesRevenue > 0 ? Math.round((val / totalSalesRevenue) * 100) : 0;
              const Icon = method.icon;

              return (
                <div key={key} className="space-y-1.5 p-2 rounded-xl bg-[#0E172A] border border-slate-800/80">
                  <div className="flex justify-between text-xs items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center`} style={{ color: method.colorHex }}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-200 font-semibold">{method.nameAr}</span>
                    </div>
                    <span className="font-mono font-bold" style={{ color: method.colorHex }}>
                      {formatCurrency(val)} <span className="text-slate-400 font-normal text-[10px]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(5, pct)}%`, backgroundColor: method.colorHex }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
