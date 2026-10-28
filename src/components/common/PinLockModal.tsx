import React, { useState } from 'react';
import { Delete, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PinLockModal: React.FC = () => {
  const { unlockWithPin, settings } = useApp();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg('');

    if (nextPin.length === 4) {
      setTimeout(() => {
        const success = unlockWithPin(nextPin);
        if (!success) {
          setIsShaking(true);
          setErrorMsg(
            settings.language === 'hi'
              ? 'गलत पिन दर्ज किया गया। पुन: प्रयास करें।'
              : 'Incorrect PIN. Please try again.'
          );
          setTimeout(() => {
            setPin('');
            setIsShaking(false);
          }, 600);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none">
      <div className={`w-full max-w-xs text-center ${isShaking ? 'animate-bounce' : ''}`}>
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight">
          {settings.language === 'hi' ? 'हिसाबबुक अनलॉक करें' : 'Unlock HisabBook'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {settings.language === 'hi'
            ? 'अपनी वित्तीय जानकारी सुरक्षित रखने के लिए 4-अंकीय पिन दर्ज करें'
            : 'Enter your 4-digit security PIN to access your finances'}
        </p>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-medium mb-4 animate-fade-in">
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-white text-2xl font-bold transition-all border border-slate-700/60 shadow-md flex items-center justify-center active:scale-95"
            >
              {d}
            </button>
          ))}

          {/* Empty or Shield */}
          <div className="flex items-center justify-center text-emerald-500/60">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 text-white text-2xl font-bold transition-all border border-slate-700/60 shadow-md flex items-center justify-center active:scale-95"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:bg-rose-600 text-slate-300 hover:text-white transition-all border border-slate-700/40 flex items-center justify-center active:scale-95"
            aria-label="Delete digit"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
