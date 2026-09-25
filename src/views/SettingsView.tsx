import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DatabaseService } from '../services/storage';
import { 
  Settings, 
  Store, 
  Download, 
  Upload, 
  History, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, auditLogs, t, currentUser, refreshAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'store' | 'backup' | 'audit'>('store');
  const [storeNameAr, setStoreNameAr] = useState(settings.storeNameAr);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [taxId, setTaxId] = useState(settings.taxId);
  const [commercialReg, setCommercialReg] = useState(settings.commercialReg);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup state
  const [restoreJson, setRestoreJson] = useState('');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      storeNameAr,
      storeName,
      phone,
      email,
      address,
      taxId,
      commercialReg,
      receiptHeader,
      receiptFooter
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = DatabaseService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techpulse_backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = () => {
    if (!restoreJson.trim()) return;
    const res = DatabaseService.importFullBackupJSON(restoreJson);
    if (res.success) {
      setBackupMessage('تمت استعادة البيانات بنجاح تام! تم تحديث كافة الجداول والمخزون.');
      setRestoreJson('');
      refreshAllData();
      setTimeout(() => setBackupMessage(null), 5000);
    } else {
      alert(res.error || 'فشلت استعادة النسخة الاحتياطية');
    }
  };

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <span>الإعدادات والنسخ الاحتياطي وسجل الرقابة</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            تخصيص بيانات المحل، ترويسة الفاتورة الحرارية، النسخ الاحتياطي، وسجل Audit Log
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'store' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            بيانات المتجر والطباعة
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'backup' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            النسخ الاحتياطي (Backup)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'audit' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل الرقابة والعمليات (Audit Log)
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم حفظ الإعدادات بنجاح! ستظهر التعديلات على كافة الفواتير والإيصالات الحرارية.</span>
        </div>
      )}

      {/* Tab: Store Settings */}
      {activeTab === 'store' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSaveStoreSettings} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">اسم المتجر (بالعربية):</label>
                <input
                  type="text"
                  value={storeNameAr}
                  onChange={e => setStoreNameAr(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">اسم المتجر (بالفرنسية / اللاتينية):</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">العنوان الجغرافي للمحل الرئيسي:</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">الرقم التعريفي الجبائي (NIF):</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">السجل التجاري (RC):</label>
                <input
                  type="text"
                  value={commercialReg}
                  onChange={e => setCommercialReg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ترويسة الإيصال الحراري 80mm (Header):</label>
              <input
                type="text"
                value={receiptHeader}
                onChange={e => setReceiptHeader(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">تذييل الإيصال وسياسة الضمان (Footer):</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={e => setReceiptFooter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
              >
                حفظ بيانات المتجر والطباعة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl mx-auto space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-400" />
              <span>تصدير نسخة احتياطية كاملة (JSON Export)</span>
            </h3>
            <p className="text-xs text-slate-400">
              تنزيل ملف يحتوي على كافة المنتجات، السيريالات، الفواتير، ديون العملاء، وسجلات الضمان
            </p>
            <div className="pt-2">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-teal-500/20"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملف النسخة الاحتياطية (.JSON)</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>استعادة نسخة احتياطية سابقة (Restore)</span>
            </h3>
            <p className="text-xs text-slate-400">
              ألصق محتوى ملف النسخة الاحتياطية هنا لاستعادة كافة البيانات:
            </p>

            {backupMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs font-semibold">
                {backupMessage}
              </div>
            )}

            <textarea
              rows={4}
              value={restoreJson}
              onChange={e => setRestoreJson(e.target.value)}
              placeholder="ألصق محتوى كود JSON هنا..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-teal-500"
            />

            <button
              onClick={handleImportBackup}
              disabled={!restoreJson.trim()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-teal-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>بدء استيراد واستعادة البيانات</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white">سجل العمليات والرقابة الأمنية (Audit Trail Ledger)</span>
            <span className="text-slate-400 font-mono">{auditLogs.length} حركة مسجلة</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 text-start">التوقيت والتاريخ</th>
                  <th className="py-2.5 px-3 text-start">المستخدم</th>
                  <th className="py-2.5 px-3 text-start">الإجراء (Action)</th>
                  <th className="py-2.5 px-3 text-start">التفاصيل الكاملة</th>
                  <th className="py-2.5 px-3 text-start">نوع الكيان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-3 text-teal-400 font-medium">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 uppercase">
                      {log.entityType || 'SYSTEM'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
