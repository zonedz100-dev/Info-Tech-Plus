import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  Store, 
  Laptop,
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';
import { InfoTechLogo } from '../common/InfoTechLogo';

interface HeaderProps {
  onOpenCommand: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommand, onNavigateTab }) => {
  const { 
    lang, 
    setLang, 
    t, 
    currentUser, 
    switchUserRole, 
    activeLocation, 
    setActiveLocation, 
    locations,
    cashRegister,
    notifications,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const roles: { role: UserRole; title: string; badge: string; color: string }[] = [
    { role: 'owner', title: 'المالك والمدير العام (Owner)', badge: 'Full Access', color: 'from-amber-500/20 to-orange-500/20 text-amber-300' },
    { role: 'admin', title: 'مدير النظام (Admin)', badge: 'Admin', color: 'from-blue-500/20 to-indigo-500/20 text-blue-300' },
    { role: 'cashier', title: 'كاشير مبيعات (Cashier)', badge: 'POS Only', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300' },
    { role: 'technician', title: 'فني ورشة الصيانة (Technician)', badge: 'Workshop', color: 'from-purple-500/20 to-fuchsia-500/20 text-purple-300' },
    { role: 'warehouse', title: 'أمين المستودع (Warehouse)', badge: 'Inventory', color: 'from-cyan-500/20 to-sky-500/20 text-cyan-300' },
  ];

  return (
    <header className="h-14 border-b border-slate-800/80 bg-gradient-to-r from-[#070B14] via-[#0D1527] to-[#0A101D] px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-md shadow-black/20">
      {/* Zone 1: Brand Wordmark & Location */}
      <div className="flex items-center gap-3">
        <InfoTechLogo size="md" showText={true} />

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Location / Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors shadow-sm"
          >
            <Store className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">{lang === 'ar' ? activeLocation.nameAr : activeLocation.name}</span>
          </button>

          {showLocationMenu && (
            <div className="absolute top-full mt-1.5 start-0 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                <span>{lang === 'ar' ? 'اختر نقطة البيع أو المستودع' : 'Select Branch / Store'}</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveLocation(loc);
                    setShowLocationMenu(false);
                  }}
                  className={`w-full text-start px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-500/10 transition-colors ${
                    activeLocation.id === loc.id ? 'text-cyan-300 font-bold bg-cyan-500/15 border-e-2 border-cyan-400' : 'text-slate-300'
                  }`}
                >
                  <span>{lang === 'ar' ? loc.nameAr : loc.name}</span>
                  {loc.isMain && (
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded font-mono">الرئيسي</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Register Status Indicator */}
        <button
          onClick={() => onNavigateTab('cashRegister')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all shadow-sm ${
            cashRegister?.status === 'open'
              ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400'
              : 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-300 border border-amber-500/30 hover:border-amber-400'
          }`}
          title={cashRegister?.status === 'open' ? 'الصندوق مفتوح' : 'الصندوق مغلق'}
        >
          <span className={`w-2 h-2 rounded-full ${cashRegister?.status === 'open' ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-500/20' : 'bg-amber-400'}`} />
          <span className="font-semibold">{cashRegister?.status === 'open' ? t.openRegister : t.closedRegister}</span>
        </button>
      </div>

      {/* Zone 2: Fast Navigation & Global Search Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-400 hover:text-slate-200 transition-all w-56 md:w-72 justify-between group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">{t.searchPlaceholder.substring(0, 26)}...</span>
          </div>
          <kbd className="text-[10px] bg-slate-800 border border-slate-700/80 rounded px-1.5 py-0.5 text-cyan-300 font-mono shadow-sm">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Language, Notifications, Role Profile */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => setLang('ar')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              lang === 'ar' ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => setLang('fr')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              lang === 'fr' ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              lang === 'en' ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-[10px] flex items-center justify-center font-mono shadow-sm animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute top-full mt-2 end-0 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800">
                <span className="text-xs font-bold text-white">{t.notifications}</span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{notifications.length} تنبيهات</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">لا توجد تنبيهات حالية</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.linkTab) onNavigateTab(n.linkTab);
                        setShowNotifMenu(false);
                      }}
                      className="p-2.5 hover:bg-cyan-500/5 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-200">{n.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-colors shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-start hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wide">{currentUser.role}</div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute top-full mt-2 end-0 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 mb-1">
                تبديل صلاحية المستخدم (Simulate Role)
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchUserRole(r.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-start px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    currentUser.role === r.role ? 'text-cyan-300 font-bold bg-cyan-500/10' : 'text-slate-300'
                  }`}
                >
                  <span>{r.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-950 ${r.color}`}>
                    {r.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
