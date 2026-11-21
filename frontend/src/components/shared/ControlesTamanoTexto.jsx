import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ControlesTamanoTexto() {
  const { escalaTexto, cambiarEscalaTexto } = useAuth();

  // Fallback: si no existe cambiarEscalaTexto (compatibilidad), usa localStorage directo
  const escala = escalaTexto ?? Number(localStorage.getItem('techasset_texto_escala') || 100);

  const aplicar = (nuevoValor) => {
    if (typeof cambiarEscalaTexto === 'function') {
      cambiarEscalaTexto(nuevoValor);
    }
  };

  const reducir = () => aplicar(Math.max(90, escala - 10));
  const restablecer = () => aplicar(100);
  const aumentar = () => aplicar(Math.min(135, escala + 10));

  return (
    <div
      className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs shadow-inner select-none"
      role="group"
      aria-label="Controles de tamaño de texto"
    >
      {/* Botón Reducir: A− */}
      <button
        type="button"
        onClick={reducir}
        disabled={escala <= 90}
        title="Reducir tamaño de texto"
        aria-label="Reducir tamaño de texto"
        className="px-2 py-1 rounded-lg font-bold text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors border border-slate-200 dark:border-slate-600"
      >
        A−
      </button>

      {/* Botón Restablecer */}
      <button
        type="button"
        onClick={restablecer}
        title="Restablecer tamaño de texto al 100%"
        aria-label="Restablecer tamaño de texto al 100%"
        className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 border ${
          escala === 100
            ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white border-transparent'
            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600'
        }`}
      >
        <span>A</span>
        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
          {escala}%
        </span>
      </button>

      {/* Botón Aumentar: A+ */}
      <button
        type="button"
        onClick={aumentar}
        disabled={escala >= 135}
        title="Aumentar tamaño de texto"
        aria-label="Aumentar tamaño de texto"
        className="px-2 py-1 rounded-lg font-bold text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors border border-slate-200 dark:border-slate-600"
      >
        A+
      </button>
    </div>
  );
}
