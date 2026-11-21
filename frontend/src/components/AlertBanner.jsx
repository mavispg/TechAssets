import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function AlertBanner({ tipo = 'error', mensaje, onClose }) {
  if (!mensaje) return null;

  const config = {
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    info: {
      bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900 text-violet-800 dark:text-violet-200',
      icon: Info,
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  };

  const actual = config[tipo] || config.error;
  const Icon = actual.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${actual.bg}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${actual.iconColor}`} />
      <div className="flex-1 text-sm font-medium leading-relaxed">{mensaje}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
