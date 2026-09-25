import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductType } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Barcode, 
  Download, 
  AlertTriangle,
  X,
  Layers,
  Cpu,
  Sparkles
} from 'lucide-react';
import { getCategoryTheme } from '../utils/theme';

export const ProductsView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    formatCurrency, 
    suppliers,
    currentUser,
    activeLocation
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Laptops');
  const [formBrand, setFormBrand] = useState('Lenovo');
  const [formType, setFormType] = useState<ProductType>('serial');
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id || 'sup-techdistro');
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(1);
  const [formMinStock, setFormMinStock] = useState<number>(2);
  const [formWarrantyMonths, setFormWarrantyMonths] = useState<number>(12);
  
  // PC Builder Spec fields
  const [specSocket, setSpecSocket] = useState<'LGA1700' | 'AM5' | 'AM4' | 'LGA1200' | ''>('');
  const [specRamType, setSpecRamType] = useState<'DDR5' | 'DDR4' | ''>('');
  const [specWattage, setSpecWattage] = useState<number>(0);

  const categories = ['all', 'Laptops', 'Desktops', 'Monitors', 'Components', 'Graphics Cards', 'Memory & Storage', 'Power & Cooling', 'Accessories', 'Networking', 'Printers & Scanners', 'Services'];

  const filtered = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormNameAr('');
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormBarcode(`69${Math.floor(10000000000 + Math.random() * 90000000000)}`);
    setFormCategory('Laptops');
    setFormBrand('Lenovo');
    setFormType('serial');
    setFormCostPrice(0);
    setFormSellingPrice(0);
    setFormStock(1);
    setFormMinStock(2);
    setFormWarrantyMonths(12);
    setSpecSocket('');
    setSpecRamType('');
    setSpecWattage(0);
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormNameAr(p.nameAr);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormType(p.type);
    setFormSupplierId(p.supplierId);
    setFormCostPrice(p.costPrice);
    setFormSellingPrice(p.sellingPrice);
    setFormStock(p.currentStock);
    setFormMinStock(p.minStock);
    setFormWarrantyMonths(p.warrantyMonths);
    setSpecSocket(p.specs?.socket || '');
    setSpecRamType(p.specs?.ramType || '');
    setSpecWattage(p.specs?.wattage || 0);
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim() || !formSku.trim()) return;

    const productData: Partial<Product> = {
      name: formName.trim() || formNameAr.trim(),
      nameAr: formNameAr.trim(),
      sku: formSku.trim(),
      barcode: formBarcode.trim() || `${Date.now()}`,
      category: formCategory,
      brand: formBrand.trim(),
      type: formType,
      supplierId: formSupplierId,
      costPrice: Number(formCostPrice) || 0,
      sellingPrice: Number(formSellingPrice) || 0,
      unit: 'Unit',
      currentStock: Number(formStock) || 0,
      minStock: Number(formMinStock) || 1,
      warrantyMonths: Number(formWarrantyMonths) || 12,
      location: activeLocation.name,
      active: true,
      specs: specSocket || specRamType || specWattage ? {
        socket: specSocket as any || undefined,
        ramType: specRamType as any || undefined,
        wattage: Number(specWattage) || undefined,
      } : undefined
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData as Omit<Product, 'id'>);
    }

    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'SKU', 'Barcode', 'NameAr', 'Category', 'Brand', 'CostPrice', 'SellingPrice', 'Stock', 'MinStock'];
    const rows = products.map(p => [
      p.id,
      p.sku,
      p.barcode,
      `"${p.nameAr.replace(/"/g, '""')}"`,
      p.category,
      p.brand,
      p.costPrice,
      p.sellingPrice,
      p.currentStock,
      p.minStock
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InfoTech_Products_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Banner with High-Tech Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C1527] via-[#0E1A34] to-[#0A1224] border border-cyan-500/30 p-4 lg:p-5 rounded-2xl shadow-xl shadow-black/30">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span>دليل المنتجات والمواد التقنية (Products Catalog)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            إدارة الأسعار، تكلفة الشراء، الباركود، الأرقام التسلسلية، والمواصفات الفنية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all ring-1 ring-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Colorful Category Badges */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B1322] p-3.5 rounded-2xl border border-slate-800/90 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-cyan-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، SKU، الباركود، أو الماركة..."
            className="w-full bg-[#070D18] border border-slate-800 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1 no-scrollbar">
          {categories.map(cat => {
            const theme = getCategoryTheme(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all whitespace-nowrap font-bold ${
                  isSelected
                    ? `${theme.activeTabBg} ${theme.activeTabText} shadow-md`
                    : 'bg-[#070D18] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {theme.nameAr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table with Expressive Rows */}
      <div className="bg-[#0B1322] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#070D18] border-b border-slate-800/80 text-slate-400 font-semibold">
                <th className="py-3 px-3.5 text-start">المنتج والتعيين</th>
                <th className="py-3 px-3.5 text-start">الفئة / الماركة</th>
                <th className="py-3 px-3.5 text-center">النوع</th>
                <th className="py-3 px-3.5 text-end">سعر التكلفة</th>
                <th className="py-3 px-3.5 text-end">سعر البيع</th>
                <th className="py-3 px-3.5 text-center">المخزون الحالي</th>
                <th className="py-3 px-3.5 text-center">الضمان</th>
                <th className="py-3 px-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(p => {
                const theme = getCategoryTheme(p.category);
                const isOutOfStock = p.currentStock <= 0;
                const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white truncate max-w-sm">
                        {p.nameAr || p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-400">SKU: {p.sku}</span>
                        <span>·</span>
                        <span>باركود: {p.barcode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                        {theme.nameAr}
                      </span>
                      <div className="text-[11px] text-slate-300 font-mono mt-1">{p.brand}</div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        p.type === 'serial' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.type === 'serial' ? 'سيريال' : p.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono text-slate-300">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono font-black text-emerald-400">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                          نفد (0)
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] animate-pulse">
                          منخفض ({p.currentStock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                          متوفر ({p.currentStock})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-cyan-300 text-[11px]">
                      {p.warrantyMonths} شهر
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="تعديل المنتج"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف المنتج ${p.nameAr}؟`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0C1424] border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج تقني جديد'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الاسم بالعربية (موصى به):</label>
                  <input
                    type="text"
                    value={formNameAr}
                    onChange={e => setFormNameAr(e.target.value)}
                    placeholder="مثال: لابتوب لينوفو ثينك باد T14 الجيل 4"
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الاسم بالإنجليزية:</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Lenovo ThinkPad T14 Gen 4"
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">كود SKU:</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الباركود:</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={e => setFormBarcode(e.target.value)}
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الفئة:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {categories.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الماركة (Brand):</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#070D18] border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">سعر التكلفة (دج):</label>
                  <input
                    type="number"
                    value={formCostPrice || ''}
                    onChange={e => setFormCostPrice(Number(e.target.value))}
                    className="w-full bg-[#0B1322] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سعر البيع (دج):</label>
                  <input
                    type="number"
                    value={formSellingPrice || ''}
                    onChange={e => setFormSellingPrice(Number(e.target.value))}
                    className="w-full bg-[#0B1322] border border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المخزون الحالي:</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={e => setFormStock(Number(e.target.value))}
                    className="w-full bg-[#0B1322] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الحد الأدنى للتنبيه:</label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={e => setFormMinStock(Number(e.target.value))}
                    className="w-full bg-[#0B1322] border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Type & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع تتبع المنتج:</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as ProductType)}
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="serial">يتطلب رقم تسلسلي فريد (Serial Number)</option>
                    <option value="standard">منتج قياسي بالكمية فقط (Standard)</option>
                    <option value="service">خدمة صيانة أو تركيب (Service)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">مدة الضمان (بالأشهر):</label>
                  <input
                    type="number"
                    value={formWarrantyMonths}
                    onChange={e => setFormWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-[#070D18] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black shadow-md shadow-teal-500/20"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
