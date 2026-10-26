'use client';

import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from 'lucide-react';

export type FeedbackType = 'danger' | 'warning' | 'info' | 'success';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: FeedbackType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  isLoading?: boolean;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Lanjutkan',
  cancelText = 'Batal',
  isConfirm = false,
  isLoading = false,
}: FeedbackModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-[#064E5A]" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  };

  const bgIconMap = {
    danger: 'bg-rose-100',
    warning: 'bg-amber-100',
    info: 'bg-[#ddedf0]',
    success: 'bg-emerald-100',
  };

  const confirmBtnStyle = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
    info: 'bg-[#064E5A] hover:bg-[#043d47] text-white shadow-[#064E5A]/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div className={`w-14 h-14 rounded-2xl ${bgIconMap[type]} flex items-center justify-center mb-4 shadow-sm`}>
            {iconMap[type]}
          </div>

          <h3 className="font-extrabold text-slate-900 text-base mb-1.5 tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full">
            {isConfirm && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (isConfirm && onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
              className={`${
                isConfirm ? 'w-1/2' : 'w-full'
              } py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                confirmBtnStyle[type]
              } disabled:opacity-50 flex items-center justify-center gap-1.5`}
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
