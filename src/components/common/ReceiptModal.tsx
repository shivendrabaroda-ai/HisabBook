import React from 'react';
import { Download, X } from 'lucide-react';

interface ReceiptModalProps {
  url: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative">
        {/* Top bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white">
          <span className="text-xs font-bold text-slate-300">Attached Receipt / Bill</span>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download="HisabBook_Receipt.png"
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="p-4 flex items-center justify-center bg-slate-950/60 max-h-[75vh] overflow-auto">
          <img
            src={url}
            alt="Receipt Full View"
            className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
