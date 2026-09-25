import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar, 
  Download, 
  Layers, 
  PieChart, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, products, customers, suppliers, expenses, formatCurrency, t } = useApp();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  // Revenue & Profit calculations
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);

  let totalGrossProfit = 0;
  sales.forEach(s => {
    s.items.forEach(item => {
      const itemProfit = (item.unitPrice - (item.costPrice || 0)) * item.qty - (item.discount || 0);
      totalGrossProfit += itemProfit;
    });
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalGrossProfit - totalExpenses;

  // Stock
  const stockCost = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
  const stockRetail = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
  const projectedStockProfit = stockRetail - stockCost;

  // Receivables
  const totalReceivables = customers.reduce((sum, c) => sum + c.outstandingDebt, 0);
  const totalPayables = suppliers.reduce((sum, s) => sum + s.outstandingDebt, 0);

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <span>التقارير المالية والأرباح المحققة (Financial & P&L Reports)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            حساب دقيق لهوامش الربح الحقيقية، قيمة الأصول المخزنية، والميزانية العمومية الخفيفة
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>طباعة تقرير الإدارة</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">إجمالي المبيعات المحققة</span>
          <div className="text-xl font-bold font-mono text-white">{formatCurrency(totalSalesRevenue)}</div>
          <div className="text-[11px] text-slate-500 font-mono">من {sales.length} فاتورة مسجلة</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">الربح التجاري الإجمالي (Gross Profit)</span>
          <div className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalGrossProfit)}</div>
          <div className="text-[11px] text-slate-500">سعر البيع - سعر الشراء الحقيقي</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">المصاريف التشغيلية (Expenses)</span>
          <div className="text-xl font-bold font-mono text-rose-400">-{formatCurrency(totalExpenses)}</div>
          <div className="text-[11px] text-slate-500">إيجار، كهرباء، رواتب، إنترنت</div>
        </div>

        <div className="bg-slate-900 border border-teal-500/30 p-4 rounded-xl space-y-1 bg-teal-500/5">
          <span className="text-xs text-teal-300 font-bold">صافي الربح الحقيقي (Net Profit)</span>
          <div className="text-xl font-bold font-mono text-teal-400">{formatCurrency(netProfit)}</div>
          <div className="text-[11px] text-teal-300/80">المبلغ الصافي القابل للتوزيع</div>
        </div>
      </div>

      {/* Stock Valuation & Working Capital Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Asset Valuation */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
            <Package className="w-4 h-4 text-teal-400" />
            <span>تقييم الأصول المخزنية (Stock Valuation)</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">رأس المال المجمد في البضاعة (بسعر التكلفة):</span>
              <strong className="text-white">{formatCurrency(stockCost)}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">القيمة السوقية للبضاعة (بسعر البيع القطاعي):</span>
              <strong className="text-teal-400">{formatCurrency(stockRetail)}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
              <span>الأرباح الكامنة في المخزون الحالي:</span>
              <span>+{formatCurrency(projectedStockProfit)}</span>
            </div>
          </div>
        </div>

        {/* Receivables vs Payables (Working Capital) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
            <Users className="w-4 h-4 text-teal-400" />
            <span>موقف السيولة والذمم المالية (Working Capital)</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">ديون العملاء المستحقة للمحل (Receivables):</span>
              <strong className="text-rose-400">{formatCurrency(totalReceivables)}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">مستحقات الموردين الواجبة السداد (Payables):</span>
              <strong className="text-amber-400">{formatCurrency(totalPayables)}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">صافي الفرق في الديون:</span>
              <span className="text-white font-bold">{formatCurrency(totalReceivables - totalPayables)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
