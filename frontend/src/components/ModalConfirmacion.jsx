import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirmar,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  esPeligroso = true,
  cargando = false,
}) {
  const botonCancelarRef = useRef(null);

  // Prevención de Errores (Nielsen #5): Foco automático en Cancelar
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        botonCancelarRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titulo={titulo} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full shrink-0 ${
            esPeligroso
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              : 'bg-violet-100 text-violet-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{mensaje}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          ref={botonCancelarRef}
          data-autofocus
          type="button"
          onClick={onClose}
          disabled={cargando}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-slate-400"
        >
          {textoCancelar}
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={cargando}
          className={`px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors ${
            esPeligroso
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
          }`}
        >
          {cargando ? 'Procesando...' : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
