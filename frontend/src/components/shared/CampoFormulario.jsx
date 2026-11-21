import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function CampoFormulario({
  id,
  label,
  tipo = 'text',
  valor,
  onChange,
  placeholder,
  error,
  requerido = false,
  deshabilitado = false,
  autoComplete,
  children,
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {requerido && <span className="text-rose-500">*</span>}
        </label>
        {children}
      </div>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={tipo}
          value={valor}
          onChange={onChange}
          placeholder={placeholder}
          disabled={deshabilitado}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all outline-none ${
            error
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 pr-10'
              : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        />

        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-rose-500">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5 mt-1"
          aria-live="polite"
        >
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
