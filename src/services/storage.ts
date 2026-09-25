import {
  Product,
  SerialNumber,
  StockMovement,
  Customer,
  Supplier,
  Sale,
  PurchaseOrder,
  Quotation,
  WarrantyRecord,
  RepairTicket,
  CashRegisterSession,
  Expense,
  AuditLog,
  StoreLocation,
  StoreSettings,
  SplitPayment
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'tp_products_v2',
  SERIALS: 'tp_serials_v2',
  MOVEMENTS: 'tp_movements_v2',
  CUSTOMERS: 'tp_customers_v2',
  SUPPLIERS: 'tp_suppliers_v2',
  SALES: 'tp_sales_v2',
  PURCHASES: 'tp_purchases_v2',
  QUOTATIONS: 'tp_quotations_v2',
  WARRANTIES: 'tp_warranties_v2',
  REPAIRS: 'tp_repairs_v2',
  CASH_REGISTER: 'tp_cash_register_v2',
  EXPENSES: 'tp_expenses_v2',
  AUDIT_LOGS: 'tp_audit_logs_v2',
  LOCATIONS: 'tp_locations_v2',
  SETTINGS: 'tp_settings_v2',
};

// Default Locations
export const defaultLocations: StoreLocation[] = [
  { id: 'loc-1', name: 'Main Store Algiers', nameAr: 'المحل الرئيسي (الجزائر)', address: '14 Rue Didouche Mourad, Alger', isMain: true },
  { id: 'loc-2', name: 'Central Warehouse', nameAr: 'المستودع المركزي (باب الزوار)', address: 'Zone Industrielle Oued Smar, Alger', isMain: false },
  { id: 'loc-3', name: 'Oran Branch', nameAr: 'فرع وهران', address: 'Boulevard des Lions, Oran', isMain: false }
];

export const defaultSettings: StoreSettings = {
  storeName: 'TechPulse Computer Systems',
  storeNameAr: 'تيك بالس لتكنولوجيا الحواسيب والإلكترونيات',
  phone: '+213 550 12 34 56',
  email: 'contact@techpulse-dz.com',
  address: '14 Rue Didouche Mourad, Alger Centre, Algérie',
  taxId: '099816001234567',
  commercialReg: '16/00-1234567B22',
  currency: 'DZD',
  currencySymbol: 'دج',
  allowNegativeStock: false,
  defaultWarrantyMonths: 12,
  receiptHeader: 'مرحباً بكم في متجر تيك بالس - خياركم الموثوق في الحواسيب والإلكترونيات',
  receiptFooter: 'شكراً لتعاملكم معنا. الضمان يسري بموجب الفاتورة والرقم التسلسلي للجهاز.',
  barcodePrefix: 'TP'
};

// Seed Products
const seedProducts: Product[] = [
  {
    id: 'prod-lenovo-t14',
    sku: 'LAP-LEN-T14',
    barcode: '6934567890123',
    name: 'Lenovo ThinkPad T14 Gen 4 (i7-1355U / 16GB / 512GB SSD)',
    nameAr: 'حاسوب محمول لينوفو ثينك باد T14 الجيل الرابع (Core i7 / 16GB / 512GB SSD)',
    category: 'Laptops',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 4',
    type: 'serial',
    supplierId: 'sup-techdistro',
    costPrice: 120000,
    sellingPrice: 145000,
    wholesalePrice: 138000,
    unit: 'Unit',
    currentStock: 3,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'A-01',
    warrantyMonths: 12,
    active: true,
  },
  {
    id: 'prod-asus-rog',
    sku: 'LAP-ASU-G16',
    barcode: '4718017891234',
    name: 'ASUS ROG Strix G16 (i7-13650HX / RTX 4060 8GB / 16GB DDR5 / 1TB NVMe)',
    nameAr: 'حاسوب ألعاب أسوس روج ستريكس G16 (i7 / RTX 4060 / 16GB / 1TB SSD)',
    category: 'Laptops',
    brand: 'ASUS',
    model: 'G614JV-AS73',
    type: 'serial',
    supplierId: 'sup-techdistro',
    costPrice: 245000,
    sellingPrice: 285000,
    wholesalePrice: 270000,
    unit: 'Unit',
    currentStock: 2,
    minStock: 1,
    location: 'Main Store Algiers',
    shelf: 'A-02',
    warrantyMonths: 24,
    active: true,
  },
  {
    id: 'prod-cpu-i7',
    sku: 'CPU-INT-14700K',
    barcode: '5032037278910',
    name: 'Intel Core i7-14700K Processor (20 Cores, up to 5.6 GHz)',
    nameAr: 'معالج إنتل كور i7-14700K (20 نواة، سرعة حتى 5.6GHz)',
    category: 'Components',
    brand: 'Intel',
    model: 'Core i7 14700K',
    type: 'serial',
    supplierId: 'sup-infortech',
    costPrice: 65000,
    sellingPrice: 78000,
    unit: 'Piece',
    currentStock: 5,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'B-01',
    warrantyMonths: 36,
    active: true,
    specs: {
      socket: 'LGA1700',
      wattage: 125,
      recommendedPsu: 750
    }
  },
  {
    id: 'prod-cpu-ryzen',
    sku: 'CPU-AMD-7800X3D',
    barcode: '0730143314930',
    name: 'AMD Ryzen 7 7800X3D Gaming Processor (8 Cores, 3D V-Cache)',
    nameAr: 'معالج ألعاب إيه إم دي رايزن 7 7800X3D مع ذاكرة ثلاثية الأبعاد',
    category: 'Components',
    brand: 'AMD',
    model: 'Ryzen 7 7800X3D',
    type: 'serial',
    supplierId: 'sup-infortech',
    costPrice: 68000,
    sellingPrice: 82000,
    unit: 'Piece',
    currentStock: 4,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'B-01',
    warrantyMonths: 36,
    active: true,
    specs: {
      socket: 'AM5',
      wattage: 120,
      recommendedPsu: 750
    }
  },
  {
    id: 'prod-mb-z790',
    sku: 'MB-MSI-Z790P',
    barcode: '4719072978912',
    name: 'MSI PRO Z790-P WiFi Motherboard (LGA 1700, DDR5, PCIe 5.0)',
    nameAr: 'لوحة أم إم إس آي برو Z790-P مع واي فاي (LGA1700، DDR5)',
    category: 'Components',
    brand: 'MSI',
    model: 'PRO Z790-P WIFI',
    type: 'serial',
    supplierId: 'sup-infortech',
    costPrice: 34000,
    sellingPrice: 42000,
    unit: 'Piece',
    currentStock: 3,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'B-02',
    warrantyMonths: 24,
    active: true,
    specs: {
      socket: 'LGA1700',
      ramType: 'DDR5',
      formFactor: 'ATX'
    }
  },
  {
    id: 'prod-mb-b650',
    sku: 'MB-ASU-B650P',
    barcode: '4718017992144',
    name: 'ASUS TUF Gaming B650-PLUS WiFi (Socket AM5, DDR5)',
    nameAr: 'لوحة أم أسوس تاف B650 بلس واي فاي (Socket AM5، DDR5)',
    category: 'Components',
    brand: 'ASUS',
    model: 'TUF GAMING B650-PLUS',
    type: 'serial',
    supplierId: 'sup-techdistro',
    costPrice: 33000,
    sellingPrice: 39500,
    unit: 'Piece',
    currentStock: 4,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'B-02',
    warrantyMonths: 24,
    active: true,
    specs: {
      socket: 'AM5',
      ramType: 'DDR5',
      formFactor: 'ATX'
    }
  },
  {
    id: 'prod-gpu-4070',
    sku: 'GPU-GIG-4070',
    barcode: '4719331313456',
    name: 'Gigabyte GeForce RTX 4070 Windforce OC 12GB GDDR6X',
    nameAr: 'كرت شاشة جيجابايت جيفورس RTX 4070 سعة 12 جيجابايت',
    category: 'Graphics Cards',
    brand: 'Gigabyte',
    model: 'GV-N4070WF3OC-12GD',
    type: 'serial',
    supplierId: 'sup-techdistro',
    costPrice: 110000,
    sellingPrice: 129000,
    wholesalePrice: 124000,
    unit: 'Piece',
    currentStock: 3,
    minStock: 1,
    location: 'Main Store Algiers',
    shelf: 'B-03',
    warrantyMonths: 24,
    active: true,
    specs: {
      wattage: 200,
      recommendedPsu: 650
    }
  },
  {
    id: 'prod-ram-ddr5',
    sku: 'RAM-KIN-32D5',
    barcode: '740617329123',
    name: 'Kingston FURY Beast 32GB (2x16GB) 6000MHz DDR5 RGB',
    nameAr: 'ذاكرة رام كينجستون فيوري بيست 32 جيجابايت (2x16GB) تردد 6000MHz DDR5',
    category: 'Memory & Storage',
    brand: 'Kingston',
    model: 'KF560C36BBEAK2-32',
    type: 'standard',
    supplierId: 'sup-infortech',
    costPrice: 21000,
    sellingPrice: 26500,
    unit: 'Kit',
    currentStock: 8,
    minStock: 3,
    location: 'Main Store Algiers',
    shelf: 'C-01',
    warrantyMonths: 36,
    active: true,
    specs: {
      ramType: 'DDR5'
    }
  },
  {
    id: 'prod-ssd-samsung',
    sku: 'SSD-SAM-990P-1TB',
    barcode: '8806094391234',
    name: 'Samsung 990 PRO NVMe M.2 SSD 1TB (PCIe 4.0 - 7450 MB/s)',
    nameAr: 'قرص صلب سامسونج 990 برو NVMe سعة 1 تيرابايت فائق السرعة',
    category: 'Memory & Storage',
    brand: 'Samsung',
    model: 'MZ-V9P1T0BW',
    type: 'serial',
    supplierId: 'sup-techdistro',
    costPrice: 19500,
    sellingPrice: 24500,
    unit: 'Piece',
    currentStock: 12,
    minStock: 4,
    location: 'Main Store Algiers',
    shelf: 'C-02',
    warrantyMonths: 60,
    active: true,
  },
  {
    id: 'prod-psu-corsair',
    sku: 'PSU-COR-850E',
    barcode: '840006659123',
    name: 'Corsair RM850e Fully Modular Power Supply 850W (80+ Gold, ATX 3.0)',
    nameAr: 'مزود طاقة كورسير RM850e استطاعة 850 واط معياري بالكامل (ذهبي 80+)',
    category: 'Power & Cooling',
    brand: 'Corsair',
    model: 'CP-9020263-NA',
    type: 'serial',
    supplierId: 'sup-infortech',
    costPrice: 22000,
    sellingPrice: 27500,
    unit: 'Piece',
    currentStock: 6,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'D-01',
    warrantyMonths: 36,
    active: true,
    specs: {
      wattage: 850
    }
  },
  {
    id: 'prod-case-nzxt',
    sku: 'CAS-NZX-H5F',
    barcode: '506030169123',
    name: 'NZXT H5 Flow RGB Compact Mid-Tower Case (Black)',
    nameAr: 'صندوق حاسوب مكتبي NZXT H5 Flow مع مراوح RGB (أسود)',
    category: 'Cases & Accessories',
    brand: 'NZXT',
    model: 'CC-H51FB-R1',
    type: 'standard',
    supplierId: 'sup-techdistro',
    costPrice: 17000,
    sellingPrice: 21500,
    unit: 'Piece',
    currentStock: 4,
    minStock: 1,
    location: 'Main Store Algiers',
    shelf: 'D-02',
    warrantyMonths: 12,
    active: true,
    specs: {
      formFactor: 'ATX'
    }
  },
  {
    id: 'prod-monitor-aoc',
    sku: 'MON-AOC-27G2',
    barcode: '4038986189123',
    name: 'AOC Gaming 27" IPS QHD 165Hz 1ms Gaming Monitor (2560x1440)',
    nameAr: 'شاشة ألعاب AOC مقاس 27 بوصة IPS بدقة QHD وتردد 165Hz',
    category: 'Monitors',
    brand: 'AOC',
    model: 'Q27G2S/EU',
    type: 'serial',
    supplierId: 'sup-techdistro',
    costPrice: 42000,
    sellingPrice: 51000,
    unit: 'Piece',
    currentStock: 5,
    minStock: 2,
    location: 'Main Store Algiers',
    shelf: 'E-01',
    warrantyMonths: 24,
    active: true,
  },
  {
    id: 'prod-mouse-logitech',
    sku: 'ACC-LOG-GPW',
    barcode: '5099206091234',
    name: 'Logitech G PRO X SUPERLIGHT Wireless Gaming Mouse',
    nameAr: 'فأرة ألعاب لاسلكية لوجيتك جي برو إكس سوبرلايت فائقة الخفة',
    category: 'Gaming Gear',
    brand: 'Logitech',
    model: '910-005878',
    type: 'standard',
    supplierId: 'sup-infortech',
    costPrice: 19000,
    sellingPrice: 24000,
    unit: 'Piece',
    currentStock: 7,
    minStock: 3,
    location: 'Main Store Algiers',
    shelf: 'F-01',
    warrantyMonths: 24,
    active: true,
  },
  {
    id: 'prod-router-tplink',
    sku: 'NET-TPL-AX53',
    barcode: '6935364071234',
    name: 'TP-Link Archer AX53 AX3000 Dual-Band Gigabit Wi-Fi 6 Router',
    nameAr: 'راوتر تي بي لينك Archer AX53 واي فاي 6 ثنائي النطاق فائق السرعة',
    category: 'Networking',
    brand: 'TP-Link',
    model: 'Archer AX53',
    type: 'standard',
    supplierId: 'sup-techdistro',
    costPrice: 11000,
    sellingPrice: 14500,
    unit: 'Piece',
    currentStock: 9,
    minStock: 3,
    location: 'Main Store Algiers',
    shelf: 'G-01',
    warrantyMonths: 24,
    active: true,
  },
  {
    id: 'prod-win11-pro',
    sku: 'SFT-MS-W11P',
    barcode: '889842891234',
    name: 'Microsoft Windows 11 Pro 64-bit Retail License',
    nameAr: 'ترخيص أصلي مايكروسوفت ويندوز 11 برو 64 بت',
    category: 'Software & Licences',
    brand: 'Microsoft',
    model: 'Retail OEM',
    type: 'digital',
    supplierId: 'sup-infortech',
    costPrice: 4500,
    sellingPrice: 7500,
    unit: 'License',
    currentStock: 50,
    minStock: 10,
    location: 'Main Store Algiers',
    shelf: 'DIGITAL',
    warrantyMonths: 12,
    active: true,
  },
  {
    id: 'prod-srv-assembly',
    sku: 'SRV-PC-ASSEMBLY',
    barcode: 'SRV001',
    name: 'Professional PC Assembly & Cable Management Service',
    nameAr: 'خدمة تجميع وتركيب الحواسيب الاحترافية وتنظيم الكابلات',
    category: 'Services',
    brand: 'TechPulse Service',
    model: 'Pro Assembly',
    type: 'service',
    supplierId: 'sup-techdistro',
    costPrice: 1000,
    sellingPrice: 4000,
    unit: 'Service',
    currentStock: 999,
    minStock: 1,
    location: 'Main Store Algiers',
    warrantyMonths: 3,
    active: true,
  }
];

// Seed Suppliers
const seedSuppliers: Supplier[] = [
  {
    id: 'sup-techdistro',
    name: 'TechDistro DZ Distribution',
    company: 'SARL TechDistro Algérie',
    phone: '+213 21 65 43 21',
    email: 'commercial@techdistro-dz.com',
    address: 'Lotissement El Bina N°44, Kouba, Alger',
    taxId: '001516098765432',
    bankInfo: 'BEA Kouba - 002 00015 1234567890 45',
    paymentTerms: '30 Days Net',
    totalPurchased: 1450000,
    totalPaid: 1350000,
    outstandingDebt: 100000,
    notes: 'المورد الرسمي لمنتجات لينوفو وأسوس وسامسونج',
    createdAt: '2026-01-10'
  },
  {
    id: 'sup-infortech',
    name: 'InforTech Hardware Solutions',
    company: 'EURL InforTech Oran',
    phone: '+213 41 33 22 11',
    email: 'sales@infortech-dz.com',
    address: 'Zone des Sièges, Bir El Djir, Oran',
    taxId: '001831012345678',
    bankInfo: 'BNA Oran - 001 00031 9876543210 12',
    paymentTerms: 'Cash on Delivery / 15 Days',
    totalPurchased: 890000,
    totalPaid: 890000,
    outstandingDebt: 0,
    notes: 'متخصص في كروت الشاشة والمعالجات وإكسسوارات الألعاب',
    createdAt: '2026-01-15'
  }
];

// Seed Customers
const seedCustomers: Customer[] = [
  {
    id: 'cust-ahmed',
    name: 'أحمد منصوري (Ahmed Mansouri)',
    phone: '0555 12 34 56',
    email: 'ahmed.mansouri@gmail.com',
    address: 'حي البدر، القبة، الجزائر العاصمة',
    nationalId: '10987654321',
    totalPurchases: 1450000,
    totalPaid: 100000,
    outstandingDebt: 45000, // Scenario debt 45,000 DZD
    notes: 'عميل وفي - حاسوب محمول ثينك باد مع دفعة آجلة',
    createdAt: '2026-02-01'
  },
  {
    id: 'cust-karim',
    name: 'كريم بلحاج (Karim Belhadj)',
    phone: '0661 98 76 54',
    email: 'k.belhadj@yahoo.fr',
    address: 'المرادية، الجزائر العاصمة',
    totalPurchases: 285000,
    totalPaid: 285000,
    outstandingDebt: 0,
    notes: 'مهتم بمعدات الألعاب وصانعي المحتوى',
    createdAt: '2026-02-14'
  },
  {
    id: 'cust-sarl-digital',
    name: 'SARL Digital Solution DZ',
    phone: '023 45 67 89',
    email: 'contact@digitalsolution-dz.com',
    address: 'باب الزوار، الجزائر',
    nationalId: '001916055544433',
    totalPurchases: 540000,
    totalPaid: 450000,
    outstandingDebt: 90000,
    notes: 'شركة برمجيات وتجهيز مكاتب',
    createdAt: '2026-02-20'
  }
];

// Seed Serials (including the specific scenario Lenovo SN123456 sold to Ahmed)
const seedSerials: SerialNumber[] = [
  // The Scenario Lenovo Laptop Serial (SOLD)
  {
    id: 'ser-sn123456',
    serialNumber: 'SN123456',
    productId: 'prod-lenovo-t14',
    productName: 'Lenovo ThinkPad T14 Gen 4',
    costPrice: 120000,
    sellingPrice: 145000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-15',
    saleDate: '2026-02-20',
    saleId: 'inv-2026-0001',
    customerId: 'cust-ahmed',
    warrantyStart: '2026-02-20',
    warrantyEnd: '2027-02-20',
    status: 'sold',
    notes: 'الجهاز المباع للسيد أحمد منصوري (100,000 دج كاش + 45,000 دج آجل)'
  },
  // In stock serials
  {
    id: 'ser-t14-002',
    serialNumber: 'LNV-T14-998811',
    productId: 'prod-lenovo-t14',
    productName: 'Lenovo ThinkPad T14 Gen 4',
    costPrice: 120000,
    sellingPrice: 145000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-15',
    status: 'in_stock',
  },
  {
    id: 'ser-t14-003',
    serialNumber: 'LNV-T14-998812',
    productId: 'prod-lenovo-t14',
    productName: 'Lenovo ThinkPad T14 Gen 4',
    costPrice: 120000,
    sellingPrice: 145000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-15',
    status: 'in_stock',
  },
  {
    id: 'ser-asus-001',
    serialNumber: 'ASU-ROG-772210',
    productId: 'prod-asus-rog',
    productName: 'ASUS ROG Strix G16',
    costPrice: 245000,
    sellingPrice: 285000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-10',
    status: 'in_stock',
  },
  {
    id: 'ser-asus-002',
    serialNumber: 'ASU-ROG-772211',
    productId: 'prod-asus-rog',
    productName: 'ASUS ROG Strix G16',
    costPrice: 245000,
    sellingPrice: 285000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-10',
    status: 'in_stock',
  },
  {
    id: 'ser-gpu-001',
    serialNumber: 'GIG-4070-55441',
    productId: 'prod-gpu-4070',
    productName: 'Gigabyte GeForce RTX 4070',
    costPrice: 110000,
    sellingPrice: 129000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-12',
    status: 'in_stock',
  },
  {
    id: 'ser-gpu-002',
    serialNumber: 'GIG-4070-55442',
    productId: 'prod-gpu-4070',
    productName: 'Gigabyte GeForce RTX 4070',
    costPrice: 110000,
    sellingPrice: 129000,
    supplierId: 'sup-techdistro',
    locationId: 'loc-1',
    purchaseDate: '2026-02-12',
    status: 'in_stock',
  }
];

// Seed Historic Sales (Including user's exact scenario invoice!)
const seedSales: Sale[] = [
  {
    id: 'inv-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    date: '2026-02-20 11:30:00',
    cashierId: 'usr-1',
    cashierName: 'أمين براهيمي (كاشير رئيسي)',
    customerId: 'cust-ahmed',
    customerName: 'أحمد منصوري (Ahmed Mansouri)',
    customerPhone: '0555 12 34 56',
    items: [
      {
        productId: 'prod-lenovo-t14',
        productName: 'Lenovo ThinkPad T14 Gen 4',
        sku: 'LAP-LEN-T14',
        type: 'serial',
        qty: 1,
        unitPrice: 145000,
        costPrice: 120000, // Cost Snapshot
        discount: 0,
        total: 145000,
        serialNumbers: ['SN123456'],
        warrantyMonths: 12
      }
    ],
    subtotal: 145000,
    discount: 0,
    tax: 0,
    grandTotal: 145000,
    paidAmount: 100000,
    remainingDebt: 45000, // Scenario: 45,000 DZD credit
    payments: [
      { method: 'cash', amount: 100000, reference: 'CASH-REC-001' },
      { method: 'credit', amount: 45000, reference: 'DEBT-AGREEMENT-2026-01' }
    ],
    dueDate: '2026-03-25',
    warrantyStart: '2026-02-20',
    status: 'completed',
    notes: 'عملية البيع المعيارية: شراء 120,000 دج، بيع 145,000 دج، مدفوع 100,000 دج، آجل 45,000 دج، ضمان 12 شهر',
    locationId: 'loc-1'
  }
];

// Seed Warranty for the Lenovo laptop
const seedWarranties: WarrantyRecord[] = [
  {
    id: 'war-sn123456',
    saleId: 'inv-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    productId: 'prod-lenovo-t14',
    productName: 'Lenovo ThinkPad T14 Gen 4',
    serialNumber: 'SN123456',
    customerId: 'cust-ahmed',
    customerName: 'أحمد منصوري (Ahmed Mansouri)',
    customerPhone: '0555 12 34 56',
    warrantyPeriodMonths: 12,
    startDate: '2026-02-20',
    endDate: '2027-02-20',
    status: 'active',
    claims: []
  }
];

// Seed Stock Movements
const seedMovements: StockMovement[] = [
  {
    id: 'mov-001',
    date: '2026-02-15 09:00:00',
    userId: 'usr-admin',
    userName: 'مدير المستودع (Warehouse Admin)',
    productId: 'prod-lenovo-t14',
    productName: 'Lenovo ThinkPad T14 Gen 4',
    locationId: 'loc-1',
    type: 'purchase',
    prevQty: 0,
    changeQty: 4,
    newQty: 4,
    unitCost: 120000,
    referenceDoc: 'PO-2026-008',
    notes: 'استلام بضاعة من TechDistro مع إدخال السيريالات ومنها SN123456'
  },
  {
    id: 'mov-002',
    date: '2026-02-20 11:30:00',
    userId: 'usr-1',
    userName: 'أمين براهيمي (كاشير رئيسي)',
    productId: 'prod-lenovo-t14',
    productName: 'Lenovo ThinkPad T14 Gen 4',
    locationId: 'loc-1',
    type: 'sale',
    prevQty: 4,
    changeQty: -1,
    newQty: 3,
    unitCost: 120000,
    referenceDoc: 'INV-2026-0001',
    notes: 'بيع جهاز Lenovo T14 سيريال SN123456 للعميل أحمد منصوري'
  }
];

// Seed Repair Tickets
const seedRepairs: RepairTicket[] = [
  {
    id: 'rep-2026-01',
    ticketNumber: 'REP-2026-0042',
    customerId: 'cust-karim',
    customerName: 'كريم بلحاج (Karim Belhadj)',
    customerPhone: '0661 98 76 54',
    deviceType: 'Gaming Laptop',
    brand: 'ASUS ROG',
    model: 'Strix Scar 15',
    serialNumber: 'SN-REP-9921',
    problemDescription: 'ارتفاع شديد في درجة الحرارة وصوت مروحة تبريد غير طبيعي مع انطفاء مفاجئ أثناء اللعب',
    accessoriesReceived: 'شاحن أصلي 240W + حقيبة',
    condition: 'خدش بسيط على الغطاء الخلفي، الشاشة سليمة',
    technicianId: 'tech-1',
    technicianName: 'ياسين حداد (مهندس صيانة)',
    status: 'repairing',
    isWarranty: false,
    partsUsed: [],
    laborCost: 4500,
    estimatedCost: 6500,
    finalCost: 6500,
    receivedDate: '2026-02-24 14:00',
    notes: 'تم فك الجهاز وتنظيف المعجون الحراري، بانتظار تغيير مروحة وحدة معالجة الرسوميات'
  }
];

// Seed Expenses
const seedExpenses: Expense[] = [
  {
    id: 'exp-01',
    date: '2026-02-01',
    category: 'rent',
    amount: 80000,
    paymentMethod: 'cheque',
    description: 'إيجار المحل التجاري لشهر فيفري 2026',
    recordedBy: 'المدير العام',
    reference: 'CHQ-BNA-8821'
  },
  {
    id: 'exp-02',
    date: '2026-02-05',
    category: 'internet',
    amount: 6000,
    paymentMethod: 'baridimob',
    description: 'اشتراك إنترنت الألياف البصرية Idoom Fibre Pro',
    recordedBy: 'أمين براهيمي',
    reference: 'MOB-TX-99823'
  }
];

// Seed Audit Logs
const seedAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-02-15 09:10:00',
    userId: 'usr-admin',
    userName: 'مدير المستودع',
    action: 'استلام بضاعة وتوليد أرقام تسلسلية',
    details: 'استلام 4 أجهزة Lenovo T14 Gen 4 بسعر تكلفة 120,000 دج بما فيها الرقم SN123456',
    entityType: 'purchase',
    entityId: 'PO-2026-008'
  },
  {
    id: 'log-002',
    timestamp: '2026-02-20 11:31:00',
    userId: 'usr-1',
    userName: 'أمين براهيمي',
    action: 'إتمام عملية بيع برقم تسلسلي',
    details: 'بيع جهاز Lenovo T14 (SN123456) للعميل أحمد منصوري بقيمة 145,000 دج (دفعة نقدية 100,000 دج + آجل 45,000 دج)',
    entityType: 'sale',
    entityId: 'INV-2026-0001'
  }
];

// Seed Open Cash Register
const seedCashRegister: CashRegisterSession = {
  id: 'reg-session-today',
  shiftNumber: 'SHIFT-2026-0225-1',
  userId: 'usr-1',
  userName: 'أمين براهيمي (كاشير رئيسي)',
  openedAt: '2026-02-25 08:30:00',
  startingCash: 25000,
  cashSales: 100000, // From Ahmed's sale
  cashRefunds: 0,
  cashIn: 0,
  cashOut: 0,
  expectedCash: 125000, // 25,000 starting + 100,000 cash sale
  status: 'open',
  notes: 'وردية الصباح الاعتيادية'
};

// Database Storage Service Wrapper
export class DatabaseService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }

  // Initialize Seed Data if first time
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.setItem(STORAGE_KEYS.PRODUCTS, seedProducts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERIALS)) {
      this.setItem(STORAGE_KEYS.SERIALS, seedSerials);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      this.setItem(STORAGE_KEYS.SUPPLIERS, seedSuppliers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.setItem(STORAGE_KEYS.CUSTOMERS, seedCustomers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      this.setItem(STORAGE_KEYS.SALES, seedSales);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WARRANTIES)) {
      this.setItem(STORAGE_KEYS.WARRANTIES, seedWarranties);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOVEMENTS)) {
      this.setItem(STORAGE_KEYS.MOVEMENTS, seedMovements);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPAIRS)) {
      this.setItem(STORAGE_KEYS.REPAIRS, seedRepairs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      this.setItem(STORAGE_KEYS.EXPENSES, seedExpenses);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.setItem(STORAGE_KEYS.AUDIT_LOGS, seedAuditLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_REGISTER)) {
      this.setItem(STORAGE_KEYS.CASH_REGISTER, seedCashRegister);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      this.setItem(STORAGE_KEYS.LOCATIONS, defaultLocations);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, defaultSettings);
    }
  }

  // Getters
  static getProducts(): Product[] {
    return this.getItem(STORAGE_KEYS.PRODUCTS, seedProducts);
  }

  static getSerials(): SerialNumber[] {
    return this.getItem(STORAGE_KEYS.SERIALS, seedSerials);
  }

  static getCustomers(): Customer[] {
    return this.getItem(STORAGE_KEYS.CUSTOMERS, seedCustomers);
  }

  static getSuppliers(): Supplier[] {
    return this.getItem(STORAGE_KEYS.SUPPLIERS, seedSuppliers);
  }

  static getSales(): Sale[] {
    return this.getItem(STORAGE_KEYS.SALES, seedSales);
  }

  static getPurchases(): PurchaseOrder[] {
    return this.getItem(STORAGE_KEYS.PURCHASES, []);
  }

  static getQuotations(): Quotation[] {
    return this.getItem(STORAGE_KEYS.QUOTATIONS, []);
  }

  static getWarranties(): WarrantyRecord[] {
    return this.getItem(STORAGE_KEYS.WARRANTIES, seedWarranties);
  }

  static getRepairs(): RepairTicket[] {
    return this.getItem(STORAGE_KEYS.REPAIRS, seedRepairs);
  }

  static getMovements(): StockMovement[] {
    return this.getItem(STORAGE_KEYS.MOVEMENTS, seedMovements);
  }

  static getExpenses(): Expense[] {
    return this.getItem(STORAGE_KEYS.EXPENSES, seedExpenses);
  }

  static getAuditLogs(): AuditLog[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, seedAuditLogs);
  }

  static getCashRegister(): CashRegisterSession | null {
    return this.getItem(STORAGE_KEYS.CASH_REGISTER, seedCashRegister);
  }

  static getLocations(): StoreLocation[] {
    return this.getItem(STORAGE_KEYS.LOCATIONS, defaultLocations);
  }

  static getSettings(): StoreSettings {
    return this.getItem(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  // Mutations
  static saveProducts(products: Product[]): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  static saveSerials(serials: SerialNumber[]): void {
    this.setItem(STORAGE_KEYS.SERIALS, serials);
  }

  static saveCustomers(customers: Customer[]): void {
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  static saveSuppliers(suppliers: Supplier[]): void {
    this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  static saveSales(sales: Sale[]): void {
    this.setItem(STORAGE_KEYS.SALES, sales);
  }

  static saveWarranties(warranties: WarrantyRecord[]): void {
    this.setItem(STORAGE_KEYS.WARRANTIES, warranties);
  }

  static saveRepairs(repairs: RepairTicket[]): void {
    this.setItem(STORAGE_KEYS.REPAIRS, repairs);
  }

  static saveExpenses(expenses: Expense[]): void {
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);
  }

  static saveCashRegister(session: CashRegisterSession | null): void {
    this.setItem(STORAGE_KEYS.CASH_REGISTER, session);
  }

  static saveSettings(settings: StoreSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  static logAudit(userId: string, userName: string, action: string, details: string, entityType?: string, entityId?: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId,
      userName,
      action,
      details,
      entityType,
      entityId
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200)); // Keep latest 200 logs
  }

  // COMPLETE POS TRANSACTION METHOD
  static processSale(
    saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date'>,
    cashierId: string,
    cashierName: string
  ): { success: boolean; sale?: Sale; error?: string } {
    try {
      const products = this.getProducts();
      const serials = this.getSerials();
      const movements = this.getMovements();
      const customers = this.getCustomers();
      const sales = this.getSales();
      const warranties = this.getWarranties();
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

      // 1. Validate Serials Uniqueness & Stock Availability
      for (const item of saleData.items) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) {
          return { success: false, error: `المنتج غير موجود في قاعدة البيانات: ${item.productName}` };
        }

        if (prod.type === 'serial') {
          if (!item.serialNumbers || item.serialNumbers.length !== item.qty) {
            return {
              success: false,
              error: `المنتج ${item.productName} يتطلب تحديد ${item.qty} رقم تسلسلي بالضبط!`
            };
          }

          // Verify each serial is actually in_stock
          for (const sn of item.serialNumbers) {
            const foundSerial = serials.find(s => s.serialNumber === sn && s.productId === prod.id);
            if (!foundSerial) {
              return { success: false, error: `الرقم التسلسلي ${sn} غير مسجل لهذا المنتج!` };
            }
            if (foundSerial.status !== 'in_stock') {
              return { success: false, error: `الرقم التسلسلي ${sn} غير متوفر للبيع (حالته: ${foundSerial.status})!` };
            }
          }
        }
      }

      // 2. Generate Invoice Number
      const invoiceNumber = `INV-${now.getFullYear()}-${(sales.length + 1).toString().padStart(4, '0')}`;
      const saleId = `sale-${Date.now()}`;

      // 3. Deduct Stock & Update Serials
      for (const item of saleData.items) {
        const prodIndex = products.findIndex(p => p.id === item.productId);
        if (prodIndex >= 0) {
          const prevQty = products[prodIndex].currentStock;
          const newQty = Math.max(0, prevQty - item.qty);
          products[prodIndex].currentStock = newQty;

          // Record Stock Movement Ledger
          movements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: dateStr,
            userId: cashierId,
            userName: cashierName,
            productId: item.productId,
            productName: item.productName,
            locationId: saleData.locationId || 'loc-1',
            type: 'sale',
            prevQty,
            changeQty: -item.qty,
            newQty,
            unitCost: item.costPrice,
            referenceDoc: invoiceNumber,
            notes: `فاتورة بيع رقم ${invoiceNumber} للعميل ${saleData.customerName}`
          });
        }

        // Update Serial Records
        if (item.serialNumbers && item.serialNumbers.length > 0) {
          for (const sn of item.serialNumbers) {
            const sIndex = serials.findIndex(s => s.serialNumber === sn && s.productId === item.productId);
            if (sIndex >= 0) {
              const startWarranty = now.toISOString().substring(0, 10);
              const endDate = new Date(now);
              endDate.setMonth(endDate.getMonth() + (item.warrantyMonths || 12));
              const endWarranty = endDate.toISOString().substring(0, 10);

              serials[sIndex].status = 'sold';
              serials[sIndex].saleId = saleId;
              serials[sIndex].saleDate = dateStr;
              serials[sIndex].customerId = saleData.customerId;
              serials[sIndex].sellingPrice = item.unitPrice;
              serials[sIndex].warrantyStart = startWarranty;
              serials[sIndex].warrantyEnd = endWarranty;

              // Create Warranty Entry
              warranties.unshift({
                id: `war-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                saleId,
                invoiceNumber,
                productId: item.productId,
                productName: item.productName,
                serialNumber: sn,
                customerId: saleData.customerId,
                customerName: saleData.customerName,
                customerPhone: saleData.customerPhone,
                warrantyPeriodMonths: item.warrantyMonths || 12,
                startDate: startWarranty,
                endDate: endWarranty,
                status: 'active',
                claims: []
              });
            }
          }
        }
      }

      // 4. Update Customer Account & Receivables
      if (saleData.customerId) {
        const cIndex = customers.findIndex(c => c.id === saleData.customerId);
        if (cIndex >= 0) {
          customers[cIndex].totalPurchases += saleData.grandTotal;
          customers[cIndex].totalPaid += saleData.paidAmount;
          customers[cIndex].outstandingDebt += saleData.remainingDebt;
        }
      }

      // 5. Update Cash Register if cash received
      const cashPortion = saleData.payments
        .filter(p => p.method === 'cash')
        .reduce((sum, p) => sum + p.amount, 0);

      const activeRegister = this.getCashRegister();
      if (activeRegister && activeRegister.status === 'open' && cashPortion > 0) {
        activeRegister.cashSales += cashPortion;
        activeRegister.expectedCash += cashPortion;
        this.saveCashRegister(activeRegister);
      }

      // 6. Create Sale Record
      const fullSale: Sale = {
        id: saleId,
        invoiceNumber,
        date: dateStr,
        cashierId,
        cashierName,
        customerId: saleData.customerId,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        items: saleData.items,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        tax: saleData.tax,
        grandTotal: saleData.grandTotal,
        paidAmount: saleData.paidAmount,
        remainingDebt: saleData.remainingDebt,
        payments: saleData.payments,
        dueDate: saleData.dueDate,
        warrantyStart: now.toISOString().substring(0, 10),
        status: 'completed',
        notes: saleData.notes,
        locationId: saleData.locationId || 'loc-1'
      };

      sales.unshift(fullSale);

      // Commit changes
      this.saveProducts(products);
      this.saveSerials(serials);
      this.setItem(STORAGE_KEYS.MOVEMENTS, movements);
      this.saveCustomers(customers);
      this.saveSales(sales);
      this.saveWarranties(warranties);

      // Audit Log
      this.logAudit(
        cashierId,
        cashierName,
        'إتمام عملية بيع (Sale)',
        `تم تسجيل الفاتورة ${invoiceNumber} بقيمة إجمالية ${saleData.grandTotal.toLocaleString()} دج (مدفوع: ${saleData.paidAmount.toLocaleString()} دج، آجل: ${saleData.remainingDebt.toLocaleString()} دج)`,
        'sale',
        saleId
      );

      return { success: true, sale: fullSale };
    } catch (err: any) {
      console.error('Error during sale transaction:', err);
      return { success: false, error: err.message || 'حدث خطأ أثناء معالجة عملية البيع' };
    }
  }

  // Create Purchase Order & Receive Stock with Serials
  static receivePurchaseOrder(
    supplierId: string,
    supplierName: string,
    items: {
      productId: string;
      productName: string;
      qty: number;
      unitCost: number;
      serialNumbers?: string[];
    }[],
    paidAmount: number,
    locationId: string,
    userId: string,
    userName: string
  ): { success: boolean; orderNumber?: string; error?: string } {
    try {
      const products = this.getProducts();
      const serials = this.getSerials();
      const movements = this.getMovements();
      const suppliers = this.getSuppliers();
      const purchases = this.getPurchases();
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
      const orderNumber = `PO-${now.getFullYear()}-${(purchases.length + 1).toString().padStart(4, '0')}`;

      let totalAmount = 0;

      for (const item of items) {
        totalAmount += item.qty * item.unitCost;
        const pIndex = products.findIndex(p => p.id === item.productId);
        if (pIndex >= 0) {
          const prevQty = products[pIndex].currentStock;
          const newQty = prevQty + item.qty;
          products[pIndex].currentStock = newQty;
          // Update cost price to latest
          products[pIndex].costPrice = item.unitCost;

          // Record Movement
          movements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: dateStr,
            userId,
            userName,
            productId: item.productId,
            productName: item.productName,
            locationId,
            type: 'purchase',
            prevQty,
            changeQty: item.qty,
            newQty,
            unitCost: item.unitCost,
            referenceDoc: orderNumber,
            notes: `شراء واستلام بضاعة من المورد ${supplierName}`
          });
        }

        // Register incoming serials
        if (item.serialNumbers && item.serialNumbers.length > 0) {
          for (const sn of item.serialNumbers) {
            serials.unshift({
              id: `ser-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              serialNumber: sn.trim(),
              productId: item.productId,
              productName: item.productName,
              costPrice: item.unitCost,
              sellingPrice: products[pIndex]?.sellingPrice || (item.unitCost * 1.2),
              supplierId,
              locationId,
              purchaseDate: dateStr.substring(0, 10),
              status: 'in_stock'
            });
          }
        }
      }

      // Update Supplier Balance
      const supIndex = suppliers.findIndex(s => s.id === supplierId);
      if (supIndex >= 0) {
        suppliers[supIndex].totalPurchased += totalAmount;
        suppliers[supIndex].totalPaid += paidAmount;
        suppliers[supIndex].outstandingDebt += (totalAmount - paidAmount);
      }

      const newPurchase: PurchaseOrder = {
        id: `po-${Date.now()}`,
        orderNumber,
        date: dateStr,
        supplierId,
        supplierName,
        status: 'received',
        items: items.map(item => ({
          ...item,
          total: item.qty * item.unitCost
        })),
        subtotal: totalAmount,
        tax: 0,
        totalAmount,
        paidAmount,
        locationId
      };

      purchases.unshift(newPurchase);

      this.saveProducts(products);
      this.saveSerials(serials);
      this.setItem(STORAGE_KEYS.MOVEMENTS, movements);
      this.saveSuppliers(suppliers);
      this.setItem(STORAGE_KEYS.PURCHASES, purchases);

      this.logAudit(
        userId,
        userName,
        'استلام بضاعة مشتريات (Purchase Received)',
        `تم استلام أمر الشراء ${orderNumber} من ${supplierName} بقيمة ${totalAmount.toLocaleString()} دج`,
        'purchase',
        newPurchase.id
      );

      return { success: true, orderNumber };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Backup & Restore
  static exportFullBackupJSON(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      products: this.getProducts(),
      serials: this.getSerials(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      sales: this.getSales(),
      purchases: this.getPurchases(),
      warranties: this.getWarranties(),
      repairs: this.getRepairs(),
      movements: this.getMovements(),
      expenses: this.getExpenses(),
      auditLogs: this.getAuditLogs(),
      cashRegister: this.getCashRegister(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackupJSON(jsonStr: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.products || !data.sales) {
        return { success: false, error: 'الملف غير صالح أو لا يحتوي على بنية بيانات TechPulse ERP' };
      }
      if (data.products) this.saveProducts(data.products);
      if (data.serials) this.saveSerials(data.serials);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.suppliers) this.saveSuppliers(data.suppliers);
      if (data.sales) this.saveSales(data.sales);
      if (data.purchases) this.setItem(STORAGE_KEYS.PURCHASES, data.purchases);
      if (data.warranties) this.saveWarranties(data.warranties);
      if (data.repairs) this.saveRepairs(data.repairs);
      if (data.movements) this.setItem(STORAGE_KEYS.MOVEMENTS, data.movements);
      if (data.expenses) this.saveExpenses(data.expenses);
      if (data.auditLogs) this.setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      if (data.settings) this.saveSettings(data.settings);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'فشل في قراءة ملف النسخة الاحتياطية' };
    }
  }
}
