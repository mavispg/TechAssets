import React, { useState } from 'react';
import Modal from './Modal';
import AlertBanner from './AlertBanner';
import { prestamosService } from '../services/api';

export default function ModalDevolucion({ isOpen, onClose, prestamo, onDevuelto }) {
  const [observacionDevolucion, setObservacionDevolucion] = useState('');
  const [nuevoEstadoEquipo, setNuevoEstadoEquipo] = useState('Disponible');
  const [cargando, setCargando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState(null);

  if (!prestamo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion(null);

    // Validación de frontend: observaciones obligatorias al registrar devolución
    if (!observacionDevolucion.trim() || observacionDevolucion.trim().length < 5) {
      setErrorValidacion(
        'Es obligatorio ingresar una observación técnica detallada sobre el estado del equipo (mínimo 5 caracteres).'
      );
      return;
    }

    try {
      setCargando(true);
      await prestamosService.returnLoan(prestamo.id, {
        observacionDevolucion: observacionDevolucion.trim(),
        nuevoEstadoEquipo,
      });

      onDevuelto();
      onClose();
    } catch (err) {
      setErrorValidacion(err.message || 'Error registrando la devolución.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Registrar Devolución de Activo Tecnológico"
      subtitulo={`Equipo: [${prestamo.equipoCodigoPatrimonial}] ${prestamo.equipoNombre}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorValidacion && (
          <AlertBanner
            tipo="error"
            mensaje={errorValidacion}
            onClose={() => setErrorValidacion(null)}
          />
        )}

        {/* Resumen del Préstamo Activo */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Responsable:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {prestamo.usuarioNombre} ({prestamo.usuarioArea})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Fecha Préstamo:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {new Date(prestamo.fechaPrestamo).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Motivo:</span>
            <span className="text-slate-700 dark:text-slate-300 italic">
              {prestamo.motivoPrestamo}
            </span>
          </div>
        </div>

        {/* Estado Operativo Post-Retorno */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Estado Posterior del Equipo
          </label>
          <select
            value={nuevoEstadoEquipo}
            onChange={(e) => setNuevoEstadoEquipo(e.target.value)}
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
          >
            <option value="Disponible">Operativo / Disponible para nuevo préstamo</option>
            <option value="En Mantenimiento">Requiere Mantenimiento Técnico o Limpieza </option>
          </select>
        </div>

        {/* Observación Técnica Obligatoria  */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Observaciones Técnicas de Devolución (OBLIGATORIO) *
          </label>
          <textarea
            rows="3"
            value={observacionDevolucion}
            onChange={(e) => setObservacionDevolucion(e.target.value)}
            placeholder="Ej. Se devuelve equipo con cargador completo, pantalla sin rayones, puertos USB operativos y formateo preliminar..."
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
            required
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Debe registrar el estado físico, accesorios devueltos y cualquier anomalía detectada.
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all"
          >
            {cargando ? 'Registrando...' : 'Confirmar Devolución'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
