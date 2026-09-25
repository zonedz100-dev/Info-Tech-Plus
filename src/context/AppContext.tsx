import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  SerialNumber,
  Customer,
  Supplier,
  Sale,
  PurchaseOrder,
  Quotation,
  WarrantyRecord,
  RepairTicket,
  StockMovement,
  Expense,
  AuditLog,
  CashRegisterSession,
  StoreLocation,
  StoreSettings,
  User,
  UserRole,
  SplitPayment
} from '../types';
import { DatabaseService, defaultSettings } from '../services/storage';
import { translations, Language } from '../i18n/translations';

interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  message: string;
  timestamp: string;
  linkTab?: string;
}

interface AppContextType {
  // Localization & Theme
  lang: Language;
  setLang: (l: Language) => void;
  t: (typeof translations)['ar'];
  dir: 'rtl' | 'ltr';
  formatCurrency: (amount: number) => string;

  // Active User & Permissions
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
  activeLocation: StoreLocation;
  setActiveLocation: (loc: StoreLocation) => void;
  locations: StoreLocation[];

  // Entities
  products: Product[];
  serials: SerialNumber[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: PurchaseOrder[];
  quotations: Quotation[];
  warranties: WarrantyRecord[];
  repairs: RepairTicket[];
  movements: StockMovement[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  cashRegister: CashRegisterSession | null;
  settings: StoreSettings;
  notifications: NotificationItem[];

  // Actions
  refreshAllData: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;
  addCustomer: (cust: Omit<Customer, 'id' | 'totalPurchases' | 'totalPaid' | 'outstandingDebt' | 'createdAt'>) => Customer;
  addSupplier: (sup: Omit<Supplier, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingDebt' | 'createdAt'>) => Supplier;
  processPOSSale: (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date'>) => { success: boolean; sale?: Sale; error?: string };
  recordCustomerPayment: (customerId: string, amount: number, method: string) => void;
  createRepair: (data: Omit<RepairTicket, 'id' | 'ticketNumber' | 'receivedDate' | 'status' | 'partsUsed' | 'finalCost'>) => void;
  updateRepairStatus: (ticketId: string, status: RepairTicket['status']) => void;
  openCashSession: (startingCash: number) => void;
  closeCashSession: (actualCash: number, notes?: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'recordedBy'>) => void;
  updateSettings: (settings: StoreSettings) => void;
  addQuotation: (quote: Omit<Quotation, 'id' | 'quoteNumber' | 'date'>) => Quotation;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Init DB
  useEffect(() => {
    DatabaseService.init();
    refreshAllData();
  }, []);

  const [lang, setLang] = useState<Language>('ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang];

  // Set document dir & lang
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  // Current User with Role Switcher
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1',
    name: 'أمين براهيمي',
    username: 'amine_pos',
    email: 'amine@techpulse-dz.com',
    role: 'owner', // Default full access for master owner
    storeId: 'loc-1',
    active: true
  });

  const [locations, setLocations] = useState<StoreLocation[]>(DatabaseService.getLocations());
  const [activeLocation, setActiveLocation] = useState<StoreLocation>(locations[0] || DatabaseService.getLocations()[0]);

  // State Collections
  const [products, setProducts] = useState<Product[]>([]);
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [warranties, setWarranties] = useState<WarrantyRecord[]>([]);
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegisterSession | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshAllData = () => {
    const prods = DatabaseService.getProducts();
    const sers = DatabaseService.getSerials();
    const custs = DatabaseService.getCustomers();
    const sups = DatabaseService.getSuppliers();
    const sls = DatabaseService.getSales();
    const purs = DatabaseService.getPurchases();
    const quotes = DatabaseService.getQuotations();
    const wars = DatabaseService.getWarranties();
    const reps = DatabaseService.getRepairs();
    const movs = DatabaseService.getMovements();
    const exps = DatabaseService.getExpenses();
    const logs = DatabaseService.getAuditLogs();
    const reg = DatabaseService.getCashRegister();
    const sets = DatabaseService.getSettings();
    const locs = DatabaseService.getLocations();

    setProducts(prods);
    setSerials(sers);
    setCustomers(custs);
    setSuppliers(sups);
    setSales(sls);
    setPurchases(purs);
    setQuotations(quotes);
    setWarranties(wars);
    setRepairs(reps);
    setMovements(movs);
    setExpenses(exps);
    setAuditLogs(logs);
    setCashRegister(reg);
    setSettings(sets);
    setLocations(locs);

    // Compute live notifications
    const notes: NotificationItem[] = [];

    // Low stock
    const lowStock = prods.filter(p => p.currentStock <= p.minStock && p.active);
    if (lowStock.length > 0) {
      notes.push({
        id: 'notif-low-stock',
        type: 'warning',
        title: lang === 'ar' ? 'تنبيه نقص المخزون' : 'Low Stock Alert',
        message: lang === 'ar' 
          ? `يوجد ${lowStock.length} منتجات وصلت للحد الأدنى (مثل ${lowStock[0].nameAr})`
          : `${lowStock.length} items reached minimum reorder level`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        linkTab: 'inventory'
      });
    }

    // Customer Debts
    const indebted = custs.filter(c => c.outstandingDebt > 0);
    if (indebted.length > 0) {
      const totalDebt = indebted.reduce((s, c) => s + c.outstandingDebt, 0);
      notes.push({
        id: 'notif-customer-debts',
        type: 'danger',
        title: lang === 'ar' ? 'ديون مستحقة للتحصيل' : 'Outstanding Debts',
        message: lang === 'ar'
          ? `إجمالي الديون المستحقة على ${indebted.length} عملاء: ${totalDebt.toLocaleString()} دج`
          : `Total overdue receivables: ${totalDebt.toLocaleString()} DZD`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        linkTab: 'customers'
      });
    }

    // Repairs Ready
    const readyRepairs = reps.filter(r => r.status === 'ready');
    if (readyRepairs.length > 0) {
      notes.push({
        id: 'notif-repairs-ready',
        type: 'success',
        title: lang === 'ar' ? 'أجهزة جاهزة للتسليم' : 'Repairs Ready for Pickup',
        message: lang === 'ar'
          ? `يوجد ${readyRepairs.length} أجهزة تم إصلاحها وجاهزة للتسليم للعميل`
          : `${readyRepairs.length} repaired devices are ready for pickup`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        linkTab: 'repairs'
      });
    }

    // Open Register Status
    if (!reg || reg.status !== 'open') {
      notes.push({
        id: 'notif-reg-closed',
        type: 'info',
        title: lang === 'ar' ? 'الصندوق مغلق' : 'Register Closed',
        message: lang === 'ar' ? 'يرجى فتح وردية كاشير لبدء تسجيل المبيعات النقدية بدقة' : 'Open register shift to start cash sales',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        linkTab: 'cashRegister'
      });
    }

    setNotifications(notes);
  };

  const switchUserRole = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      owner: 'أمين براهيمي (المالك والمدير العام)',
      admin: 'سفيان مداني (مدير النظام)',
      manager: 'وليد رحماني (مدير المتجر)',
      cashier: 'حمزة زايدي (كاشير نقطة البيع)',
      technician: 'ياسين حداد (مسؤول الصيانة)',
      warehouse: 'عمر قاسمي (أمين المستودع)'
    };
    setCurrentUser(prev => ({
      ...prev,
      role,
      name: roleNames[role] || 'مستخدم النظام'
    }));
    DatabaseService.logAudit(
      currentUser.id,
      currentUser.name,
      'تبديل دور المستخدم (Role Switch)',
      `تم تغيير صلاحية الدخول الحالية إلى: ${role}`
    );
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.round(amount).toLocaleString('fr-FR');
    if (lang === 'ar') {
      return `${formatted} دج`;
    }
    return `${formatted} DZD`;
  };

  // Actions
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const prods = DatabaseService.getProducts();
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    prods.unshift(newProd);
    DatabaseService.saveProducts(prods);

    // Initial movement if stock > 0
    if (newProd.currentStock > 0) {
      const movs = DatabaseService.getMovements();
      movs.unshift({
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userId: currentUser.id,
        userName: currentUser.name,
        productId: newProd.id,
        productName: newProd.name,
        locationId: activeLocation.id,
        type: 'adjustment',
        prevQty: 0,
        changeQty: newProd.currentStock,
        newQty: newProd.currentStock,
        unitCost: newProd.costPrice,
        notes: 'إدخال رصيد أولي عند تعريف المنتج'
      });
      localStorage.setItem('tp_movements_v2', JSON.stringify(movs));
    }

    DatabaseService.logAudit(
      currentUser.id,
      currentUser.name,
      'إضافة منتج جديد',
      `تم إضافة المنتج ${newProd.name} بسعر بيع ${newProd.sellingPrice} دج`,
      'product',
      newProd.id
    );
    refreshAllData();
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const prods = DatabaseService.getProducts();
    const index = prods.findIndex(p => p.id === id);
    if (index >= 0) {
      prods[index] = { ...prods[index], ...updates };
      DatabaseService.saveProducts(prods);
      DatabaseService.logAudit(
        currentUser.id,
        currentUser.name,
        'تعديل منتج',
        `تم تعديل بيانات المنتج ${prods[index].name}`,
        'product',
        id
      );
      refreshAllData();
    }
  };

  const deleteProduct = (id: string): boolean => {
    // Check if product is in sales history
    const sales = DatabaseService.getSales();
    const hasHistory = sales.some(s => s.items.some(item => item.productId === id));
    if (hasHistory) {
      alert(lang === 'ar' ? 'لا يمكن حذف منتج له معاملات وفواتير سابقة حفاظاً على تكامل السجلات المالية!' : 'Cannot delete product with historical sales!');
      return false;
    }
    const prods = DatabaseService.getProducts().filter(p => p.id !== id);
    DatabaseService.saveProducts(prods);
    refreshAllData();
    return true;
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'totalPurchases' | 'totalPaid' | 'outstandingDebt' | 'createdAt'>): Customer => {
    const custs = DatabaseService.getCustomers();
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      totalPaid: 0,
      outstandingDebt: 0,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    custs.unshift(newCust);
    DatabaseService.saveCustomers(custs);
    DatabaseService.logAudit(currentUser.id, currentUser.name, 'إضافة عميل جديد', `العميل: ${newCust.name}`);
    refreshAllData();
    return newCust;
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingDebt' | 'createdAt'>): Supplier => {
    const sups = DatabaseService.getSuppliers();
    const newSup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      totalPurchased: 0,
      totalPaid: 0,
      outstandingDebt: 0,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    sups.unshift(newSup);
    DatabaseService.saveSuppliers(sups);
    DatabaseService.logAudit(currentUser.id, currentUser.name, 'إضافة مورد جديد', `المورد: ${newSup.name}`);
    refreshAllData();
    return newSup;
  };

  const processPOSSale = (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date'>) => {
    const result = DatabaseService.processSale(saleData, currentUser.id, currentUser.name);
    if (result.success) {
      refreshAllData();
    }
    return result;
  };

  const recordCustomerPayment = (customerId: string, amount: number, method: string) => {
    const custs = DatabaseService.getCustomers();
    const index = custs.findIndex(c => c.id === customerId);
    if (index >= 0) {
      const cust = custs[index];
      cust.totalPaid += amount;
      cust.outstandingDebt = Math.max(0, cust.outstandingDebt - amount);
      DatabaseService.saveCustomers(custs);

      // Register in cash if cash
      if (method === 'cash') {
        const reg = DatabaseService.getCashRegister();
        if (reg && reg.status === 'open') {
          reg.cashIn += amount;
          reg.expectedCash += amount;
          DatabaseService.saveCashRegister(reg);
        }
      }

      DatabaseService.logAudit(
        currentUser.id,
        currentUser.name,
        'تسديد دفعة دين عميل',
        `استلام مبلغ ${amount.toLocaleString()} دج من العميل ${cust.name} عبر ${method}`,
        'customer',
        customerId
      );
      refreshAllData();
    }
  };

  const createRepair = (data: Omit<RepairTicket, 'id' | 'ticketNumber' | 'receivedDate' | 'status' | 'partsUsed' | 'finalCost'>) => {
    const reps = DatabaseService.getRepairs();
    const ticketNumber = `REP-${new Date().getFullYear()}-${(reps.length + 1).toString().padStart(4, '0')}`;
    const newTicket: RepairTicket = {
      ...data,
      id: `rep-${Date.now()}`,
      ticketNumber,
      receivedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'received',
      partsUsed: [],
      finalCost: data.laborCost || data.estimatedCost
    };
    reps.unshift(newTicket);
    DatabaseService.saveRepairs(reps);
    DatabaseService.logAudit(
      currentUser.id,
      currentUser.name,
      'فتح تذكرة صيانة جديدة',
      `تذكرة رقم ${ticketNumber} للعميل ${data.customerName} لجهاز ${data.brand} ${data.model}`,
      'repair',
      newTicket.id
    );
    refreshAllData();
  };

  const updateRepairStatus = (ticketId: string, status: RepairTicket['status']) => {
    const reps = DatabaseService.getRepairs();
    const index = reps.findIndex(r => r.id === ticketId);
    if (index >= 0) {
      reps[index].status = status;
      if (status === 'ready') {
        reps[index].readyDate = new Date().toISOString().substring(0, 10);
      } else if (status === 'delivered') {
        reps[index].deliveredDate = new Date().toISOString().substring(0, 10);
      }
      DatabaseService.saveRepairs(reps);
      DatabaseService.logAudit(
        currentUser.id,
        currentUser.name,
        'تحديث حالة تذكرة صيانة',
        `تحديث تذكرة ${reps[index].ticketNumber} إلى الحالة: ${status}`,
        'repair',
        ticketId
      );
      refreshAllData();
    }
  };

  const openCashSession = (startingCash: number) => {
    const newSession: CashRegisterSession = {
      id: `shift-${Date.now()}`,
      shiftNumber: `SHIFT-${new Date().toISOString().substring(0, 10)}-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      openedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      startingCash,
      cashSales: 0,
      cashRefunds: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: startingCash,
      status: 'open'
    };
    DatabaseService.saveCashRegister(newSession);
    DatabaseService.logAudit(
      currentUser.id,
      currentUser.name,
      'فتح وردية كاشير',
      `تم فتح الوردية برصيد أولي: ${startingCash.toLocaleString()} دج`
    );
    refreshAllData();
  };

  const closeCashSession = (actualCash: number, notes?: string) => {
    const reg = DatabaseService.getCashRegister();
    if (reg) {
      reg.status = 'closed';
      reg.closedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      reg.actualCash = actualCash;
      reg.variance = actualCash - reg.expectedCash;
      reg.notes = notes;
      DatabaseService.saveCashRegister(reg);
      DatabaseService.logAudit(
        currentUser.id,
        currentUser.name,
        'إغلاق وردية كاشير',
        `تم الإغلاق بنقد فعلي ${actualCash.toLocaleString()} دج (الفارق: ${reg.variance.toLocaleString()} دج)`
      );
      refreshAllData();
    }
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'recordedBy'>) => {
    const exps = DatabaseService.getExpenses();
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      recordedBy: currentUser.name
    };
    exps.unshift(newExp);
    DatabaseService.saveExpenses(exps);

    // If cash expense and register is open, register cashOut
    if (newExp.paymentMethod === 'cash') {
      const reg = DatabaseService.getCashRegister();
      if (reg && reg.status === 'open') {
        reg.cashOut += newExp.amount;
        reg.expectedCash -= newExp.amount;
        DatabaseService.saveCashRegister(reg);
      }
    }

    DatabaseService.logAudit(
      currentUser.id,
      currentUser.name,
      'تسجيل مصروف تشغيلي',
      `مصروف ${newExp.category} بقيمة ${newExp.amount.toLocaleString()} دج (${newExp.description})`
    );
    refreshAllData();
  };

  const updateSettings = (newSettings: StoreSettings) => {
    DatabaseService.saveSettings(newSettings);
    setSettings(newSettings);
    DatabaseService.logAudit(currentUser.id, currentUser.name, 'تحديث إعدادات المتجر', 'تم حفظ الإعدادات العامة والمتجر');
    refreshAllData();
  };

  const addQuotation = (quoteData: Omit<Quotation, 'id' | 'quoteNumber' | 'date'>): Quotation => {
    const quotes = DatabaseService.getQuotations();
    const quoteNumber = `QT-${new Date().getFullYear()}-${(quotes.length + 1).toString().padStart(4, '0')}`;
    const newQuote: Quotation = {
      ...quoteData,
      id: `qt-${Date.now()}`,
      quoteNumber,
      date: new Date().toISOString().substring(0, 10),
    };
    quotes.unshift(newQuote);
    localStorage.setItem('tp_quotations_v2', JSON.stringify(quotes));
    DatabaseService.logAudit(currentUser.id, currentUser.name, 'إنشاء عرض سعر جديد', `عرض سعر ${quoteNumber} للعميل ${quoteData.customerName}`);
    refreshAllData();
    return newQuote;
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        dir,
        formatCurrency,
        currentUser,
        switchUserRole,
        activeLocation,
        setActiveLocation,
        locations,
        products,
        serials,
        customers,
        suppliers,
        sales,
        purchases,
        quotations,
        warranties,
        repairs,
        movements,
        expenses,
        auditLogs,
        cashRegister,
        settings,
        notifications,
        refreshAllData,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        addSupplier,
        processPOSSale,
        recordCustomerPayment,
        createRepair,
        updateRepairStatus,
        openCashSession,
        closeCashSession,
        addExpense,
        updateSettings,
        addQuotation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
