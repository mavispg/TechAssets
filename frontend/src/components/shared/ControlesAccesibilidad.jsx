import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ControlesTamanoTexto from './ControlesTamanoTexto';

export default function ControlesAccesibilidad({ compact = false }) {
  const { darkMode, toggleDarkMode } = useAuth();

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Controles de accesibilidad">
      <ControlesTamanoTexto compact={compact} />

      <button
        type="button"
        onClick={toggleDarkMode}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        aria-label={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        {darkMode ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        )}
      </button>
    </div>
  );
}
