import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DatabaseService } from '../services/storage';
import { 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Unlock, 
  DollarSign,
  X
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const { cashRegister, openCashSession, closeCashSession, formatCurrency, t, currentUser, refreshAllData } = useApp();

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCashInOutModal, setShowCashInOutModal] = useState<'in' | 'out' | null>(null);

  const [startingCash, setStartingCash] = useState<number>(20000);
  const [actualCashCounted, setActualCashCounted] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  const [movementAmount, setMovementAmount] = useState<number>(0);
  const [movementReason, setMovementReason] = useState<string>('');

  const handleOpenSession = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(Number(startingCash));
    setShowOpenModal(false);
  };

  const handleCloseSession = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashSession(Number(actualCashCounted), closeNotes);
    setShowCloseModal(false);
  };

  const handleCashMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashRegister || movementAmount <= 0) return;

    if (showCashInOutModal === 'in') {
      cashRegister.cashIn += movementAmount;
      cashRegister.expectedCash += movementAmount;
      DatabaseService.logAudit(currentUser.id, currentUser.name, 'إيداع نقدي في الصندوق', `إيداع ${movementAmount.toLocaleString()} دج: ${movementReason}`);
    } else {
      cashRegister.cashOut += movementAmount;
      cashRegister.expectedCash -= movementAmount;
      DatabaseService.logAudit(currentUser.id, currentUser.name, 'سحب نقدي من الصندوق', `سحب ${movementAmount.toLocaleString()} دج: ${movementReason}`);
    }

    DatabaseService.saveCashRegister(cashRegister);
    setShowCashInOutModal(null);
    setMovementAmount(0);
    setMovementReason('');
    refreshAllData();
  };

  const isSessionOpen = cashRegister?.status === 'open';

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-teal-400" />
            <span>إدارة الصندوق والورديات اليومية (Cash Register & Shifts)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ضبط رصيد بداية اليوم، تتبع التدفقات النقدية اللحظية، ومطابقة النقد الفعلي عند الإغلاق
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSessionOpen ? (
            <button
              onClick={() => {
                setActualCashCounted(cashRegister?.expectedCash || 0);
                setShowCloseModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>إغلاق الوردية والترحيل</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>فتح وردية كاشير جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Shift Status Card */}
      {cashRegister && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isSessionOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <div>
                <h3 className="text-sm font-bold text-white">
                  الوردية الحالية: <span className="font-mono text-teal-400">{cashRegister.shiftNumber}</span>
                </h3>
                <div className="text-[11px] text-slate-400 font-mono">
                  فتحت بتاريخ: {cashRegister.openedAt} · الكاشير: {cashRegister.userName}
                </div>
              </div>
            </div>

            {isSessionOpen && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCashInOutModal('in')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>إيداع نقدي (Cash In)</span>
                </button>
                <button
                  onClick={() => setShowCashInOutModal('out')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>سحب نقدي (Cash Out)</span>
                </button>
              </div>
            )}
          </div>

          {/* Key Figures Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">رصيد البداية (Float):</span>
              <div className="text-base font-bold font-mono text-slate-200">{formatCurrency(cashRegister.startingCash)}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">مبيعات نقدية (Sales):</span>
              <div className="text-base font-bold font-mono text-emerald-400">+{formatCurrency(cashRegister.cashSales)}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400">صافي الحركات (In - Out):</span>
              <div className="text-base font-bold font-mono text-slate-300">
                {formatCurrency(cashRegister.cashIn - cashRegister.cashOut)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1">
              <span className="text-teal-300 font-bold">النقد المتوقع في الدرج:</span>
              <div className="text-lg font-bold font-mono text-teal-400">{formatCurrency(cashRegister.expectedCash)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Open Register Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Unlock className="w-4 h-4 text-teal-400" />
                <span>فتح وردية جديدة</span>
              </h3>
              <button onClick={() => setShowOpenModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">رصيد الفكة الأولي في الدرج (دج):</label>
                <input
                  type="number"
                  value={startingCash}
                  onChange={e => setStartingCash(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-teal-500/20"
                >
                  تأكيد فتح الوردية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Register Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>إغلاق الوردية والترحيل المحاسبي</span>
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">النقد المتوقع حسب العمليات:</span>
                <span className="font-mono font-bold text-teal-400">{formatCurrency(cashRegister?.expectedCash || 0)}</span>
              </div>
            </div>

            <form onSubmit={handleCloseSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">النقد الفعلي المحصي في الدرج (دج):</label>
                <input
                  type="number"
                  value={actualCashCounted}
                  onChange={e => setActualCashCounted(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {cashRegister && (
                <div className="flex justify-between text-xs font-mono p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">الفارق (عجز / زيادة):</span>
                  <span className={`font-bold ${
                    actualCashCounted - cashRegister.expectedCash === 0 
                      ? 'text-emerald-400' 
                      : actualCashCounted - cashRegister.expectedCash > 0 
                      ? 'text-teal-400' 
                      : 'text-rose-400'
                  }`}>
                    {formatCurrency(actualCashCounted - cashRegister.expectedCash)}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات الإغلاق (إن وجدت):</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                  placeholder="مثال: تسليم المبلغ للمدير المالي..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-md"
                >
                  تأكيد الإغلاق النهائي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash In / Out Movement Modal */}
      {showCashInOutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {showCashInOutModal === 'in' ? 'إيداع نقدي في الصندوق' : 'سحب نقدي من الصندوق'}
              </h3>
              <button onClick={() => setShowCashInOutModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCashMovement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">المبلغ (دج):</label>
                <input
                  type="number"
                  min="1"
                  value={movementAmount}
                  onChange={e => setMovementAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">السبب / البيان:</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  required
                  placeholder="مثال: شراء فكة، مصاريف نقل طارئة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCashInOutModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  تسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
