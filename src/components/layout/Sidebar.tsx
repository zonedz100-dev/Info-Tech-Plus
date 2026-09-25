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
import { InfoTechLogo } from '../common/InfoTechLogo';

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
  const { t, currentUser, repairs, products, sales, cashRegister, settings } = useApp();

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
          activeBg: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-200 border-s-[3px] border-cyan-400 font-bold shadow-sm shadow-cyan-500/10'
        },
        { 
          id: 'pos', 
          label: t.pos, 
          icon: ShoppingCart, 
          highlight: true,
          colorClass: 'text-slate-950',
          activeBg: 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-1 ring-white/30'
        },
        { 
          id: 'sales', 
          label: t.sales, 
          icon: Receipt, 
          badge: sales.length,
          colorClass: 'text-emerald-400',
          activeBg: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-200 border-s-[3px] border-emerald-400 font-bold shadow-sm'
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
          activeBg: 'bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-transparent text-blue-200 border-s-[3px] border-blue-400 font-bold shadow-sm'
        },
        { 
          id: 'inventory', 
          label: t.inventory, 
          icon: Layers, 
          alert: lowStockCount > 0 ? lowStockCount : undefined,
          colorClass: 'text-amber-400',
          activeBg: 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent text-amber-200 border-s-[3px] border-amber-400 font-bold shadow-sm'
        },
        { 
          id: 'serials', 
          label: t.serials, 
          icon: Barcode,
          colorClass: 'text-purple-400',
          activeBg: 'bg-gradient-to-r from-purple-500/20 via-violet-500/10 to-transparent text-purple-200 border-s-[3px] border-purple-400 font-bold shadow-sm'
        },
        { 
          id: 'purchases', 
          label: t.purchases, 
          icon: ShoppingBag,
          colorClass: 'text-sky-400',
          activeBg: 'bg-gradient-to-r from-sky-500/20 via-blue-500/10 to-transparent text-sky-200 border-s-[3px] border-sky-400 font-bold shadow-sm'
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
          activeBg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent text-amber-200 border-s-[3px] border-amber-400 font-bold shadow-sm'
        },
        { 
          id: 'warranty', 
          label: t.warranty, 
          icon: ShieldAlert,
          colorClass: 'text-teal-400',
          activeBg: 'bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-transparent text-teal-200 border-s-[3px] border-teal-400 font-bold shadow-sm'
        },
        { 
          id: 'repairs', 
          label: t.repairs, 
          icon: Wrench, 
          badge: activeRepairsCount > 0 ? activeRepairsCount : undefined,
          colorClass: 'text-orange-400',
          activeBg: 'bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent text-orange-200 border-s-[3px] border-orange-400 font-bold shadow-sm'
        },
        { 
          id: 'pcBuilder', 
          label: t.pcBuilder, 
          icon: Cpu,
          colorClass: 'text-fuchsia-400',
          activeBg: 'bg-gradient-to-r from-fuchsia-500/20 via-purple-500/10 to-transparent text-fuchsia-200 border-s-[3px] border-fuchsia-400 font-bold shadow-sm'
        },
        { 
          id: 'quotations', 
          label: t.quotations, 
          icon: FileSpreadsheet,
          colorClass: 'text-indigo-400',
          activeBg: 'bg-gradient-to-r from-indigo-500/20 via-blue-500/10 to-transparent text-indigo-200 border-s-[3px] border-indigo-400 font-bold shadow-sm'
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
          activeBg: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-200 border-s-[3px] border-emerald-400 font-bold shadow-sm'
        },
        { 
          id: 'expenses', 
          label: t.expenses, 
          icon: TrendingDown,
          colorClass: 'text-rose-400',
          activeBg: 'bg-gradient-to-r from-rose-500/20 via-red-500/10 to-transparent text-rose-200 border-s-[3px] border-rose-400 font-bold shadow-sm'
        },
        { 
          id: 'reports', 
          label: t.reports, 
          icon: BarChart3,
          colorClass: 'text-indigo-400',
          activeBg: 'bg-gradient-to-r from-indigo-500/20 via-blue-500/10 to-transparent text-indigo-200 border-s-[3px] border-indigo-400 font-bold shadow-sm'
        },
        { 
          id: 'settings', 
          label: t.settings, 
          icon: Settings,
          colorClass: 'text-slate-400',
          activeBg: 'bg-gradient-to-r from-slate-700/40 to-transparent text-white border-s-[3px] border-slate-300 font-bold shadow-sm'
        },
      ]
    }
  ];

  return (
    <aside className="w-60 bg-gradient-to-b from-[#080D1A] via-[#091122] to-[#070B16] border-e border-slate-800/80 flex flex-col justify-between shrink-0 select-none overflow-y-auto erp-card-glow">
      <div className="p-2.5 space-y-4">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => isRoleAllowed(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? item.activeBg
                          : item.highlight
                          ? 'text-teal-300 hover:bg-teal-500/10 bg-teal-500/5 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon 
                          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isActive && item.highlight 
                              ? 'text-slate-950' 
                              : isActive 
                              ? item.colorClass 
                              : `${item.colorClass} opacity-85 group-hover:opacity-100`
                          }`} 
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.alert ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono animate-pulse font-bold">
                          {item.alert}
                        </span>
                      ) : item.badge !== undefined && item.badge > 0 ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive && item.highlight 
                            ? 'bg-slate-900 text-teal-300 font-bold' 
                            : 'text-slate-300 bg-slate-900/90 border border-slate-700/60 font-semibold'
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

      {/* Footer Info with Store Logo */}
      <div 
        onClick={() => setActiveTab('settings')}
        className="p-3 border-t border-slate-800/80 bg-gradient-to-r from-slate-950/80 to-[#0A1224]/80 text-[11px] text-slate-300 space-y-2 backdrop-blur-md cursor-pointer group hover:bg-slate-900/60 transition-colors"
        title="انقر لتعديل هوية وشعار المتجر"
      >
        <div className="flex items-center gap-2.5">
          <InfoTechLogo size="sm" showText={false} interactive />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
              {settings.storeNameAr || 'متجر أنفوتيك'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {settings.storeName || 'InfoTech Systems'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
          <span className="text-slate-400">حالة النظام:</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/20" />
            متصل (ACID)
          </span>
        </div>
      </div>
    </aside>
  );
};
