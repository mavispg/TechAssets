import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ControlesTamanoTexto from './shared/ControlesTamanoTexto';
import ModalConfirmacion from './ModalConfirmacion';

export default function Topbar({ titulo, subtitulo, colapsado = false, onToggleSidebar }) {
  const { currentUser, cerrarSesion, darkMode, toggleDarkMode } = useAuth();
  const [confirmarCierre, setConfirmarCierre] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-3 shadow-sm transition-colors">
      {/* Botón para contraer/expandir + Título */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title={colapsado ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          aria-label={colapsado ? 'Expandir barra lateral' : 'Contraer barra lateral'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              {subtitulo}
            </p>
          )}
        </div>
      </div>

      {/* Controles de Accesibilidad, Tema y Bloque de Usuario Destacado */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Control de Tamaño de Texto Accesible (A− / A / A+) */}
        <ControlesTamanoTexto />

        {/* Alternar Tema Claro / Oscuro */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          aria-label={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Separador */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Bloque de Usuario Ampliado (Avatar ~44px, Nombre ~16px, Rol ~13-14px) */}
        <div className="flex items-center gap-3 pl-1">
          {/* Avatar ampliado (44px) */}
          <div className="w-11 h-11 rounded-2xl bg-[#0B132B] dark:bg-lime-500 text-lime-400 dark:text-[#0B132B] font-black text-sm flex items-center justify-center shadow-sm shrink-0 border border-slate-700/50 dark:border-lime-400">
            {currentUser?.nombres?.charAt(0) || 'U'}
            {currentUser?.apellidos?.charAt(0) || ''}
          </div>

          {/* Información legible de usuario */}
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
              {currentUser?.nombres} {currentUser?.apellidos}
            </span>
            <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium block truncate">
              {currentUser?.rol}
            </span>
          </div>

          {/* Botón Salir */}
          <button
            type="button"
            onClick={() => setConfirmarCierre(true)}
            className="p-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-all ml-1"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ModalConfirmacion
        isOpen={confirmarCierre}
        onClose={() => setConfirmarCierre(false)}
        onConfirmar={cerrarSesion}
        titulo="¿Cerrar sesión?"
        mensaje="Se cerrará tu sesión y volverás a la pantalla de ingreso."
        textoConfirmar="Cerrar sesión"
        textoCancelar="Seguir en el sistema"
        esPeligroso={false}
      />
    </header>
  );
}
