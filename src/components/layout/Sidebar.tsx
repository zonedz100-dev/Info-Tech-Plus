import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Layers,
  Barcode,
  ShoppingBag,
  Users,
  ShieldAlert,
  Wrench,
  Cpu,
  FileSpreadsheet,
  Coins,
  TrendingDown,
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: number;
  alert?: number;
  colorClass: string;
  activeBg: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t, currentUser, repairs, products, sales, cashRegister } = useApp();

  const lowStockCount = products.filter(p => p.currentStock <= p.minStock && p.active).length;
  const activeRepairsCount = repairs.filter(r => r.status === 'received' || r.status === 'repairing').length;

  const isRoleAllowed = (tabId: string): boolean => {
    if (currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'manager') {
      return true;
    }
    if (currentUser.role === 'cashier') {
      return ['pos', 'sales', 'warranty', 'cashRegister'].includes(tabId);
    }
    if (currentUser.role === 'technician') {
      return ['repairs', 'warranty', 'pcBuilder', 'products'].includes(tabId);
    }
    if (currentUser.role === 'warehouse') {
      return ['products', 'inventory', 'serials', 'purchases'].includes(tabId);
    }
    return true;
  };

  const navGroups: NavGroup[] = [
    {
      title: 'نقطة البيع والعمليات',
      items: [
        { 
          id: 'dashboard', 
          label: t.dashboard, 
          icon: LayoutDashboard,
          colorClass: 'text-cyan-400',
          activeBg: 'bg-cyan-500/15 text-cyan-300 border-s-2 border-cyan-400'
        },
        { 
          id: 'pos', 
          label: t.pos, 
          icon: ShoppingCart, 
          highlight: true,
          colorClass: 'text-white',
          activeBg: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-teal-500/25 ring-1 ring-teal-400'
        },
        { 
          id: 'sales', 
          label: t.sales, 
          icon: Receipt, 
          badge: sales.length,
          colorClass: 'text-emerald-400',
          activeBg: 'bg-emerald-500/15 text-emerald-300 border-s-2 border-emerald-400'
        },
      ]
    },
    {
      title: 'المخزون والمنتجات',
      items: [
        { 
          id: 'products', 
          label: t.products, 
          icon: Package, 
          badge: products.length,
          colorClass: 'text-blue-400',
          activeBg: 'bg-blue-500/15 text-blue-300 border-s-2 border-blue-400'
        },
        { 
          id: 'inventory', 
          label: t.inventory, 
          icon: Layers, 
          alert: lowStockCount > 0 ? lowStockCount : undefined,
          colorClass: 'text-amber-400',
          activeBg: 'bg-amber-500/15 text-amber-300 border-s-2 border-amber-400'
        },
        { 
          id: 'serials', 
          label: t.serials, 
          icon: Barcode,
          colorClass: 'text-purple-400',
          activeBg: 'bg-purple-500/15 text-purple-300 border-s-2 border-purple-400'
        },
        { 
          id: 'purchases', 
          label: t.purchases, 
          icon: ShoppingBag,
          colorClass: 'text-sky-400',
          activeBg: 'bg-sky-500/15 text-sky-300 border-s-2 border-sky-400'
        },
      ]
    },
    {
      title: 'الزبائن وورشة الصيانة',
      items: [
        { 
          id: 'customers', 
          label: t.customers, 
          icon: Users,
          colorClass: 'text-amber-400',
          activeBg: 'bg-amber-500/15 text-amber-300 border-s-2 border-amber-400'
        },
        { 
          id: 'warranty', 
          label: t.warranty, 
          icon: ShieldAlert,
          colorClass: 'text-teal-400',
          activeBg: 'bg-teal-500/15 text-teal-300 border-s-2 border-teal-400'
        },
        { 
          id: 'repairs', 
          label: t.repairs, 
          icon: Wrench, 
          badge: activeRepairsCount > 0 ? activeRepairsCount : undefined,
          colorClass: 'text-orange-400',
          activeBg: 'bg-orange-500/15 text-orange-300 border-s-2 border-orange-400'
        },
        { 
          id: 'pcBuilder', 
          label: t.pcBuilder, 
          icon: Cpu,
          colorClass: 'text-fuchsia-400',
          activeBg: 'bg-fuchsia-500/15 text-fuchsia-300 border-s-2 border-fuchsia-400'
        },
        { 
          id: 'quotations', 
          label: t.quotations, 
          icon: FileSpreadsheet,
          colorClass: 'text-indigo-400',
          activeBg: 'bg-indigo-500/15 text-indigo-300 border-s-2 border-indigo-400'
        },
      ]
    },
    {
      title: 'المالية والإعدادات',
      items: [
        { 
          id: 'cashRegister', 
          label: t.cashRegister, 
          icon: Coins,
          colorClass: 'text-emerald-400',
          activeBg: 'bg-emerald-500/15 text-emerald-300 border-s-2 border-emerald-400'
        },
        { 
          id: 'expenses', 
          label: t.expenses, 
          icon: TrendingDown,
          colorClass: 'text-rose-400',
          activeBg: 'bg-rose-500/15 text-rose-300 border-s-2 border-rose-400'
        },
        { 
          id: 'reports', 
          label: t.reports, 
          icon: BarChart3,
          colorClass: 'text-indigo-400',
          activeBg: 'bg-indigo-500/15 text-indigo-300 border-s-2 border-indigo-400'
        },
        { 
          id: 'settings', 
          label: t.settings, 
          icon: Settings,
          colorClass: 'text-slate-400',
          activeBg: 'bg-slate-800 text-white border-s-2 border-slate-400'
        },
      ]
    }
  ];

  return (
    <aside className="w-60 bg-[#090E18] border-e border-slate-800/80 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-2.5 space-y-4">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => isRoleAllowed(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? item.activeBg
                          : item.highlight
                          ? 'text-teal-300 hover:bg-teal-500/10 bg-teal-500/5 border border-teal-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon 
                          className={`w-4 h-4 transition-colors ${
                            isActive && item.highlight 
                              ? 'text-slate-950' 
                              : isActive 
                              ? item.colorClass 
                              : `${item.colorClass} opacity-70 group-hover:opacity-100`
                          }`} 
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.alert ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono animate-pulse">
                          {item.alert}
                        </span>
                      ) : item.badge !== undefined && item.badge > 0 ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive && item.highlight 
                            ? 'bg-slate-900 text-teal-300' 
                            : 'text-slate-400 bg-slate-900/90 border border-slate-800'
                        }`}>
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">حالة النظام:</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/20" />
            متصل (InfoTech ACID)
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
          <span>InfoTech Store Suite</span>
          <span className="text-cyan-400">v2.5 · Algiers</span>
        </div>
      </div>
    </aside>
  );
};
