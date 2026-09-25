import { 
  Laptop, 
  Cpu, 
  Mouse, 
  Wifi, 
  HardDrive, 
  Monitor, 
  Printer, 
  Zap, 
  Wrench, 
  Package,
  Layers,
  Sparkles,
  DollarSign,
  CreditCard,
  Building,
  Coins,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface CategoryTheme {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: any;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorderHover: string;
  cardBgHover: string;
  activeTabBg: string;
  activeTabText: string;
  glowColor: string;
  barColor: string;
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'all': {
    id: 'all',
    nameEn: 'All Products',
    nameAr: 'جميع المنتجات',
    icon: Layers,
    colorName: 'teal',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/20',
    cardBorderHover: 'hover:border-teal-500/40',
    cardBgHover: 'hover:bg-teal-500/5',
    activeTabBg: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    activeTabText: 'text-slate-950 font-bold',
    glowColor: 'rgba(20, 184, 166, 0.2)',
    barColor: '#14B8A6'
  },
  'Laptops': {
    id: 'Laptops',
    nameEn: 'Laptops',
    nameAr: 'حواسيب محمولة',
    icon: Laptop,
    colorName: 'blue',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/30',
    cardBorderHover: 'hover:border-blue-500/50',
    cardBgHover: 'hover:bg-blue-500/5',
    activeTabBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    barColor: '#3B82F6'
  },
  'Components': {
    id: 'Components',
    nameEn: 'Components & Processors',
    nameAr: 'معالجات ومكونات PC',
    icon: Cpu,
    colorName: 'purple',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/30',
    cardBorderHover: 'hover:border-purple-500/50',
    cardBgHover: 'hover:bg-purple-500/5',
    activeTabBg: 'bg-gradient-to-r from-purple-600 to-violet-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    barColor: '#A855F7'
  },
  'Graphics Cards': {
    id: 'Graphics Cards',
    nameEn: 'Graphics Cards (GPU)',
    nameAr: 'كروت الشاشة GPU',
    icon: Sparkles,
    colorName: 'indigo',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    cardBorderHover: 'hover:border-indigo-500/50',
    cardBgHover: 'hover:bg-indigo-500/5',
    activeTabBg: 'bg-gradient-to-r from-indigo-600 to-blue-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    barColor: '#6366F1'
  },
  'Memory & Storage': {
    id: 'Memory & Storage',
    nameEn: 'RAM & Storage',
    nameAr: 'رام وتخزين SSD/HDD',
    icon: HardDrive,
    colorName: 'emerald',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    cardBorderHover: 'hover:border-emerald-500/50',
    cardBgHover: 'hover:bg-emerald-500/5',
    activeTabBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    barColor: '#10B981'
  },
  'Monitors': {
    id: 'Monitors',
    nameEn: 'Monitors & Displays',
    nameAr: 'شاشات العرض',
    icon: Monitor,
    colorName: 'rose',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/30',
    cardBorderHover: 'hover:border-rose-500/50',
    cardBgHover: 'hover:bg-rose-500/5',
    activeTabBg: 'bg-gradient-to-r from-rose-600 to-pink-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    barColor: '#F43F5E'
  },
  'Accessories': {
    id: 'Accessories',
    nameEn: 'Accessories & Peripherals',
    nameAr: 'إكسسوارات وملحقات',
    icon: Mouse,
    colorName: 'amber',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/30',
    cardBorderHover: 'hover:border-amber-500/50',
    cardBgHover: 'hover:bg-amber-500/5',
    activeTabBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    activeTabText: 'text-slate-950 font-bold',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    barColor: '#F59E0B'
  },
  'Networking': {
    id: 'Networking',
    nameEn: 'Networking & Routers',
    nameAr: 'شبكات وموزعات',
    icon: Wifi,
    colorName: 'cyan',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    cardBorderHover: 'hover:border-cyan-500/50',
    cardBgHover: 'hover:bg-cyan-500/5',
    activeTabBg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    barColor: '#06B6D4'
  },
  'Printers & Scanners': {
    id: 'Printers & Scanners',
    nameEn: 'Printers & Scanners',
    nameAr: 'طابعات وماسحات',
    icon: Printer,
    colorName: 'fuchsia',
    badgeBg: 'bg-fuchsia-500/15',
    badgeText: 'text-fuchsia-300',
    badgeBorder: 'border-fuchsia-500/30',
    cardBorderHover: 'hover:border-fuchsia-500/50',
    cardBgHover: 'hover:bg-fuchsia-500/5',
    activeTabBg: 'bg-gradient-to-r from-fuchsia-600 to-pink-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(217, 70, 239, 0.25)',
    barColor: '#D946EF'
  },
  'Power & Cooling': {
    id: 'Power & Cooling',
    nameEn: 'Power & UPS & Cases',
    nameAr: 'طاقة ومزودات وصناديق',
    icon: Zap,
    colorName: 'orange',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-500/30',
    cardBorderHover: 'hover:border-orange-500/50',
    cardBgHover: 'hover:bg-orange-500/5',
    activeTabBg: 'bg-gradient-to-r from-orange-600 to-red-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(249, 115, 22, 0.25)',
    barColor: '#F97316'
  },
  'Services': {
    id: 'Services',
    nameEn: 'Services & Maintenance',
    nameAr: 'خدمات وصيانة وتركيب',
    icon: Wrench,
    colorName: 'teal',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-500/30',
    cardBorderHover: 'hover:border-teal-500/50',
    cardBgHover: 'hover:bg-teal-500/5',
    activeTabBg: 'bg-gradient-to-r from-teal-600 to-emerald-600',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    barColor: '#14B8A6'
  }
};

export const getCategoryTheme = (categoryName?: string): CategoryTheme => {
  if (!categoryName) return CATEGORY_THEMES['all'];
  if (CATEGORY_THEMES[categoryName]) {
    return CATEGORY_THEMES[categoryName];
  }
  // Fallback matching
  const lower = categoryName.toLowerCase();
  if (lower.includes('laptop') || lower.includes('محمول')) return CATEGORY_THEMES['Laptops'];
  if (lower.includes('comp') || lower.includes('cpu') || lower.includes('معالج')) return CATEGORY_THEMES['Components'];
  if (lower.includes('gpu') || lower.includes('graphic') || lower.includes('شاشة')) return CATEGORY_THEMES['Graphics Cards'];
  if (lower.includes('ram') || lower.includes('ssd') || lower.includes('memory') || lower.includes('تخزين')) return CATEGORY_THEMES['Memory & Storage'];
  if (lower.includes('monitor') || lower.includes('display')) return CATEGORY_THEMES['Monitors'];
  if (lower.includes('access') || lower.includes('إكسسوار') || lower.includes('mouse') || lower.includes('keyboard')) return CATEGORY_THEMES['Accessories'];
  if (lower.includes('net') || lower.includes('شبك') || lower.includes('router')) return CATEGORY_THEMES['Networking'];
  if (lower.includes('print') || lower.includes('طابع')) return CATEGORY_THEMES['Printers & Scanners'];
  if (lower.includes('power') || lower.includes('psu') || lower.includes('ups') || lower.includes('طاق')) return CATEGORY_THEMES['Power & Cooling'];
  if (lower.includes('serv') || lower.includes('صيان') || lower.includes('تركيب')) return CATEGORY_THEMES['Services'];

  return {
    id: categoryName,
    nameEn: categoryName,
    nameAr: categoryName,
    icon: Package,
    colorName: 'slate',
    badgeBg: 'bg-slate-700/20',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-700/40',
    cardBorderHover: 'hover:border-slate-600',
    cardBgHover: 'hover:bg-slate-800/40',
    activeTabBg: 'bg-slate-700',
    activeTabText: 'text-white font-bold',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    barColor: '#94A3B8'
  };
};

export interface PaymentMethodTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: any;
  colorHex: string;
  bgGradient: string;
  borderClass: string;
  textClass: string;
  pillBg: string;
}

export const PAYMENT_METHOD_THEMES: Record<string, PaymentMethodTheme> = {
  cash: {
    id: 'cash',
    nameAr: 'نقداً (Cash)',
    nameEn: 'Cash',
    icon: DollarSign,
    colorHex: '#10B981',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    textClass: 'text-emerald-400',
    pillBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  baridimob: {
    id: 'baridimob',
    nameAr: 'بريدي موب (BaridiMob)',
    nameEn: 'BaridiMob',
    icon: Coins,
    colorHex: '#F59E0B',
    bgGradient: 'from-amber-500/20 to-yellow-500/10',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    textClass: 'text-amber-400',
    pillBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  ccp: {
    id: 'ccp',
    nameAr: 'حساب بريدي (CCP)',
    nameEn: 'CCP Transfer',
    icon: Building,
    colorHex: '#EAB308',
    bgGradient: 'from-yellow-500/20 to-amber-500/10',
    borderClass: 'border-yellow-500/40 hover:border-yellow-400',
    textClass: 'text-yellow-400',
    pillBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
  },
  card: {
    id: 'card',
    nameAr: 'بطاقة بنكية / ذهبية',
    nameEn: 'Bank Card / Dahabia',
    icon: CreditCard,
    colorHex: '#06B6D4',
    bgGradient: 'from-cyan-500/20 to-blue-500/10',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    textClass: 'text-cyan-400',
    pillBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  },
  bank_transfer: {
    id: 'bank_transfer',
    nameAr: 'تحويل بنكي (Virement)',
    nameEn: 'Bank Transfer',
    icon: Building,
    colorHex: '#6366F1',
    bgGradient: 'from-indigo-500/20 to-purple-500/10',
    borderClass: 'border-indigo-500/40 hover:border-indigo-400',
    textClass: 'text-indigo-400',
    pillBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  },
  cheque: {
    id: 'cheque',
    nameAr: 'شيك بنكي (Chèque)',
    nameEn: 'Bank Cheque',
    icon: CreditCard,
    colorHex: '#3B82F6',
    bgGradient: 'from-blue-500/20 to-sky-500/10',
    borderClass: 'border-blue-500/40 hover:border-blue-400',
    textClass: 'text-blue-400',
    pillBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  },
  credit: {
    id: 'credit',
    nameAr: 'بيع بالتقسيط / آجل (Credit)',
    nameEn: 'Store Credit / Due',
    icon: Clock,
    colorHex: '#A855F7',
    bgGradient: 'from-purple-500/20 to-fuchsia-500/10',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    textClass: 'text-purple-400',
    pillBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  }
};

export const getPaymentTheme = (method: string): PaymentMethodTheme => {
  return PAYMENT_METHOD_THEMES[method] || PAYMENT_METHOD_THEMES['cash'];
};
