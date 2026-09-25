/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';

import { DashboardView } from './views/DashboardView';
import { POSView } from './views/POSView';
import { SalesView } from './views/SalesView';
import { ProductsView } from './views/ProductsView';
import { InventoryView } from './views/InventoryView';
import { SerialsView } from './views/SerialsView';
import { PurchasesView } from './views/PurchasesView';
import { CustomersView } from './views/CustomersView';
import { WarrantyView } from './views/WarrantyView';
import { RepairsView } from './views/RepairsView';
import { PCBuilderView } from './views/PCBuilderView';
import { QuotationsView } from './views/QuotationsView';
import { CashRegisterView } from './views/CashRegisterView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'pos':
        return <POSView onNavigate={setActiveTab} />;
      case 'sales':
        return <SalesView />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'serials':
        return <SerialsView />;
      case 'purchases':
        return <PurchasesView />;
      case 'customers':
        return <CustomersView />;
      case 'warranty':
        return <WarrantyView />;
      case 'repairs':
        return <RepairsView />;
      case 'pcBuilder':
        return <PCBuilderView onNavigate={setActiveTab} />;
      case 'quotations':
        return <QuotationsView onNavigate={setActiveTab} />;
      case 'cashRegister':
        return <CashRegisterView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen erp-bg-mesh text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        onOpenCommand={() => setIsCommandOpen(true)}
        onNavigateTab={setActiveTab}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto erp-bg-mesh relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
