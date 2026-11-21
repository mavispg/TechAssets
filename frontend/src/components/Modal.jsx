import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  children,
  maxWidth = 'max-w-4xl',
}) {
  const dialogRef = useRef(null);
  const tituloId = useId();
  useEffect(() => {
    if (!isOpen) return undefined;
    const focoAnterior = document.activeElement;
    const obtenerFocos = () => [
      ...dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ];
    const focoInicial =
      obtenerFocos().find((el) => el.dataset.autofocus !== undefined) || obtenerFocos()[0];
    focoInicial?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        const elementos = obtenerFocos();
        if (!elementos.length) return;
        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      if (focoAnterior instanceof HTMLElement) focoAnterior.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
    >
      <div
        ref={dialogRef}
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full ${maxWidth} overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div>
            <h3 id={tituloId} className="text-lg font-bold text-slate-900 dark:text-white">
              {titulo}
            </h3>
            {subtitulo && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitulo}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana emergente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 max-h-[calc(88vh-8rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
