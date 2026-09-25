import React, { useState } from 'react';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, X, FileText, Receipt, Check, Copy } from 'lucide-react';

interface InvoicePrintModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ sale, onClose }) => {
  const { settings, formatCurrency, t } = useApp();
  const [printFormat, setPrintFormat] = useState<'thermal80' | 'a4'>('thermal80');

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">
              طباعة الفاتورة والإيصال: <span className="font-mono text-teal-400">{sale.invoiceNumber}</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Format Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setPrintFormat('thermal80')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
                  printFormat === 'thermal80' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>حراري 80mm</span>
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
                  printFormat === 'a4' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>فاتورة رسمية A4</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>إرسال للطابعة</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          {printFormat === 'thermal80' ? (
            /* 80mm Thermal Receipt Layout */
            <div className="print-area w-80 bg-white text-slate-950 p-4 font-mono text-[11px] leading-tight rounded shadow border border-slate-300">
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
                <div className="font-bold text-sm text-black">{settings.storeNameAr}</div>
                <div className="text-[10px] text-slate-600">{settings.storeName}</div>
                <div className="text-[10px]">{settings.address}</div>
                <div className="text-[10px]">هاتف: {settings.phone}</div>
                {settings.taxId && <div className="text-[9px]">NIF: {settings.taxId}</div>}
              </div>

              {/* Invoice Meta */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold">{sale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ:</span>
                  <span>{sale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>الكاشير:</span>
                  <span>{sale.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>العميل:</span>
                  <span className="font-semibold">{sale.customerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-200">
                  <span className="w-1/2">البيان</span>
                  <span className="w-1/4 text-center">الكمية</span>
                  <span className="w-1/4 text-end">المجموع</span>
                </div>
                {sale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span className="w-1/2 truncate">{item.productName}</span>
                      <span className="w-1/4 text-center">{item.qty} x {item.unitPrice.toLocaleString()}</span>
                      <span className="w-1/4 text-end font-bold">{item.total.toLocaleString()}</span>
                    </div>
                    {/* Serial Numbers Listing */}
                    {item.serialNumbers && item.serialNumbers.length > 0 && (
                      <div className="text-[9px] text-slate-600 ps-2">
                        <span>S/N: </span>
                        <span className="font-bold">{item.serialNumbers.join(', ')}</span>
                      </div>
                    )}
                    {item.warrantyMonths > 0 && (
                      <div className="text-[9px] text-slate-600 ps-2">
                        ضمان: {item.warrantyMonths} شهر
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{sale.subtotal.toLocaleString()} دج</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>الخصم:</span>
                    <span>-{sale.discount.toLocaleString()} دج</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t border-slate-300 pt-1">
                  <span>المجموع الصافي:</span>
                  <span>{sale.grandTotal.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700">
                  <span>المبلغ المدفوع:</span>
                  <span className="font-bold">{sale.paidAmount.toLocaleString()} دج</span>
                </div>
                {sale.remainingDebt > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-rose-700 border-t border-dotted border-slate-300 pt-0.5">
                    <span>المتبقي (آجل / دين):</span>
                    <span>{sale.remainingDebt.toLocaleString()} دج</span>
                  </div>
                )}
              </div>

              {/* Payment Methods Breakdown */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <span className="font-bold">تفاصيل الدفع:</span>
                {sale.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span className="uppercase">{p.method}</span>
                    <span>{p.amount.toLocaleString()} دج</span>
                  </div>
                ))}
              </div>

              {/* Warranty Policy & Footer */}
              <div className="pt-2 text-center text-[9px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">{settings.receiptFooter}</p>
                <p>الأجهزة مضمونة بالرقم التسلسلي فقط. لا يشمل الضمان الكسر وسوء الاستخدام.</p>
                <div className="text-[8px] text-slate-600 pt-1">TechPulse ERP · شكراً لثقتكم</div>
              </div>
            </div>
          ) : (
            /* Official A4 Format */
            <div className="print-area w-full max-w-2xl bg-white text-slate-950 p-8 rounded shadow-lg text-xs leading-normal">
              {/* Official Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{settings.storeNameAr}</h1>
                  <h2 className="text-xs text-slate-600 font-mono">{settings.storeName}</h2>
                  <div className="text-[11px] text-slate-600 mt-1">
                    <div>{settings.address}</div>
                    <div>الهاتف: {settings.phone} · البريد: {settings.email}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    NIF: {settings.taxId} | RC: {settings.commercialReg}
                  </div>
                </div>

                <div className="text-end">
                  <div className="text-sm font-bold bg-slate-900 text-white px-3 py-1 rounded inline-block">
                    فاتورة بيع رسمية
                  </div>
                  <div className="text-xs font-mono font-bold mt-1 text-slate-900">
                    N°: {sale.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    التاريخ: {sale.date.substring(0, 10)}
                  </div>
                </div>
              </div>

              {/* Client Info Box */}
              <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">اسم العميل / الشركة: </span>
                  <span className="font-bold text-slate-900">{sale.customerName}</span>
                </div>
                {sale.customerPhone && (
                  <div>
                    <span className="text-slate-500">الهاتف: </span>
                    <span className="font-mono">{sale.customerPhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">المسؤول عن العملية: </span>
                  <span className="font-medium">{sale.cashierName}</span>
                </div>
                <div>
                  <span className="text-slate-500">طريقة الدفع: </span>
                  <span className="font-mono">{sale.payments.map(p => p.method).join(', ')}</span>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-xs text-start border-collapse my-3">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
                    <th className="py-2 px-2 text-start">#</th>
                    <th className="py-2 px-2 text-start">التعيين / البيان</th>
                    <th className="py-2 px-2 text-center">الرقم التسلسلي (S/N)</th>
                    <th className="py-2 px-2 text-center">الضمان</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-end">سعر الوحدة</th>
                    <th className="py-2 px-2 text-end">المجموع الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2 font-medium">
                        <div>{item.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-[10px] font-bold text-slate-700">
                        {item.serialNumbers && item.serialNumbers.length > 0
                          ? item.serialNumbers.join(', ')
                          : '-'}
                      </td>
                      <td className="py-2 px-2 text-center text-[10px]">
                        {item.warrantyMonths ? `${item.warrantyMonths} شهر` : '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">{item.qty}</td>
                      <td className="py-2 px-2 text-end font-mono">{item.unitPrice.toLocaleString()} دج</td>
                      <td className="py-2 px-2 text-end font-mono font-bold">{item.total.toLocaleString()} دج</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Bottom */}
              <div className="flex justify-between items-start pt-3 border-t-2 border-slate-800">
                <div className="w-1/2 space-y-2 text-[11px] text-slate-600">
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <div className="font-bold text-slate-800 mb-0.5">شروط وأحكام الضمان:</div>
                    <ul className="list-disc ps-4 space-y-0.5 text-[10px]">
                      <li>الضمان يسري ابتداءً من تاريخ إصدار الفاتورة والمطابقة بالأرقام التسلسلية المذكورة.</li>
                      <li>يسقط الضمان في حال فتح الجهاز أو الكسر أو تعرضه للمياه أو التذبذب الكهربائي.</li>
                      <li>يجب الاحتفاظ بهذه الفاتورة الأصلية عند طلب أي خدمة صيانة أو استبدال.</li>
                    </ul>
                  </div>
                </div>

                <div className="w-5/12 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono">{sale.subtotal.toLocaleString()} دج</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                      <span>الخصم التجاري:</span>
                      <span className="font-mono">-{sale.discount.toLocaleString()} دج</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 text-sm font-bold bg-slate-100 px-2 rounded">
                    <span>المجموع الإجمالي المستحق:</span>
                    <span className="font-mono text-teal-800">{sale.grandTotal.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>المبلغ المدفوع:</span>
                    <span className="font-mono">{sale.paidAmount.toLocaleString()} دج</span>
                  </div>
                  {sale.remainingDebt > 0 && (
                    <div className="flex justify-between py-1 text-rose-700 font-bold border-t border-slate-300">
                      <span>الرصيد المتبقي (آجل):</span>
                      <span className="font-mono">{sale.remainingDebt.toLocaleString()} دج</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
                <div>
                  <div className="font-semibold text-slate-700">توقيع وختم المتجر</div>
                  <div className="h-16 flex items-center justify-center text-slate-400 text-[10px]">
                    TechPulse Computer Systems
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700">توقيع واستلام العميل</div>
                  <div className="h-16 flex items-center justify-center text-slate-400 text-[10px]">
                    (قرأت ووافقت على شروط الاستلام والضمان)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
