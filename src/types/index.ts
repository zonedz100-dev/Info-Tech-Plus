export type UserRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'technician' | 'warehouse';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  storeId: string;
  active: boolean;
}

export type ProductType = 'standard' | 'serial' | 'imei' | 'service' | 'digital';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  nameAr: string;
  nameFr?: string;
  category: string;
  subcategory?: string;
  brand: string;
  model?: string;
  description?: string;
  image?: string;
  type: ProductType;
  supplierId: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  minimumPrice?: number;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  location: string;
  shelf?: string;
  warrantyMonths: number;
  active: boolean;
  // Specific technical specs for PC builder compatibility
  specs?: {
    socket?: 'LGA1700' | 'AM5' | 'AM4' | 'LGA1200';
    ramType?: 'DDR5' | 'DDR4';
    wattage?: number;
    recommendedPsu?: number;
    formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
    capacity?: string;
  };
}

export type SerialStatus = 
  | 'in_stock'
  | 'reserved'
  | 'sold'
  | 'returned'
  | 'under_repair'
  | 'warranty_repair'
  | 'damaged'
  | 'lost';

export interface SerialNumber {
  id: string;
  serialNumber: string;
  imei?: string;
  productId: string;
  productName: string;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  locationId: string;
  purchaseDate: string;
  saleDate?: string;
  saleId?: string;
  customerId?: string;
  warrantyStart?: string;
  warrantyEnd?: string;
  status: SerialStatus;
  notes?: string;
}

export type MovementType = 
  | 'purchase'
  | 'sale'
  | 'sale_return'
  | 'supplier_return'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'damage'
  | 'repair_use'
  | 'stocktake_adjustment';

export interface StockMovement {
  id: string;
  date: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  locationId: string;
  type: MovementType;
  prevQty: number;
  changeQty: number;
  newQty: number;
  unitCost: number;
  referenceDoc?: string;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  sourceLocationId: string;
  targetLocationId: string;
  status: 'pending' | 'completed' | 'cancelled';
  items: {
    productId: string;
    productName: string;
    qty: number;
    serialNumbers?: string[];
  }[];
  createdBy: string;
  notes?: string;
}

export interface StockCountItem {
  productId: string;
  productName: string;
  systemStock: number;
  countedStock: number;
  unitCost: number;
  variance: number;
  varianceCost: number;
}

export interface StockCount {
  id: string;
  countNumber: string;
  date: string;
  locationId: string;
  status: 'draft' | 'applied';
  items: StockCountItem[];
  notes?: string;
  appliedBy?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  nationalId?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingDebt: number;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  bankInfo?: string;
  paymentTerms?: string;
  totalPurchased: number;
  totalPaid: number;
  outstandingDebt: number;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'baridimob'
  | 'ccp'
  | 'transfer'
  | 'cheque'
  | 'credit';

export interface SplitPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  type: ProductType;
  qty: number;
  unitPrice: number;
  costPrice: number; // Cost snapshot at time of sale
  discount: number;
  total: number;
  serialNumbers?: string[];
  warrantyMonths: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  cashierId: string;
  cashierName: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  remainingDebt: number;
  payments: SplitPayment[];
  dueDate?: string;
  warrantyStart: string;
  status: 'completed' | 'held' | 'returned' | 'cancelled';
  notes?: string;
  locationId: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  qty: number;
  unitCost: number;
  total: number;
  serialNumbers?: string[];
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'ordered' | 'received' | 'partially_received' | 'cancelled';
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod?: PaymentMethod;
  locationId: string;
  notes?: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  notes?: string;
}

export interface WarrantyRecord {
  id: string;
  saleId: string;
  invoiceNumber: string;
  productId: string;
  productName: string;
  serialNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  warrantyPeriodMonths: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'claimed';
  claims: {
    id: string;
    date: string;
    issue: string;
    resolution?: string;
    status: 'pending' | 'resolved' | 'rejected';
  }[];
}

export type RepairStatus = 
  | 'received'
  | 'diagnosing'
  | 'waiting_customer'
  | 'waiting_parts'
  | 'repairing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface RepairPartUsed {
  productId: string;
  productName: string;
  qty: number;
  costPrice: number;
  sellingPrice: number;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber?: string;
  problemDescription: string;
  accessoriesReceived?: string;
  condition?: string;
  technicianId?: string;
  technicianName?: string;
  status: RepairStatus;
  isWarranty: boolean;
  partsUsed: RepairPartUsed[];
  laborCost: number;
  estimatedCost: number;
  finalCost: number;
  receivedDate: string;
  expectedDate?: string;
  readyDate?: string;
  deliveredDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface PCConfiguration {
  id: string;
  name: string;
  cpuId?: string;
  motherboardId?: string;
  ramId?: string;
  gpuId?: string;
  storageId?: string;
  psuId?: string;
  caseId?: string;
  coolerId?: string;
  totalWattage: number;
  isCompatible: boolean;
  compatibilityIssues: string[];
  totalCost: number;
  totalSellingPrice: number;
  profit: number;
  createdAt: string;
}

export interface CashRegisterSession {
  id: string;
  shiftNumber: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number;
  cashSales: number;
  cashRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type ExpenseCategory = 
  | 'rent'
  | 'salaries'
  | 'electricity'
  | 'internet'
  | 'transport'
  | 'maintenance'
  | 'marketing'
  | 'taxes'
  | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  recordedBy: string;
  reference?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  entityType?: string;
  entityId?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  nameAr: string;
  address: string;
  isMain: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeNameAr: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  commercialReg: string;
  currency: 'DZD' | 'EUR' | 'USD';
  currencySymbol: string;
  allowNegativeStock: boolean;
  defaultWarrantyMonths: number;
  receiptHeader?: string;
  receiptFooter?: string;
  barcodePrefix?: string;
  logoUrl?: string; // Base64 data URL or custom image URL for store logo
  logoBadgeStyle?: 'glow' | 'badge' | 'minimal';
}
