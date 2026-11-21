import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import AlertBanner from './AlertBanner';
import { prestamosService, equiposService, usuariosService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ModalNuevoPrestamo({
  isOpen,
  onClose,
  onCreado,
  equipoPreseleccionado = null,
}) {
  const { currentUser } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [equipoId, setEquipoId] = useState('');

  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaPrestamo, setFechaPrestamo] = useState(hoyStr);
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [cargando, setCargando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorValidacion(null);
      setUsuarioId('');
      setEquipoId(equipoPreseleccionado ? equipoPreseleccionado.id : '');
      setFechaPrestamo(hoyStr);
      setFechaDevolucion('');
      setObservaciones('');

      Promise.all([usuariosService.getAll(true), equiposService.getAll()])
        .then(([users, eqsResult]) => {
          const listaUsuarios = Array.isArray(users) ? users : users?.items || [];
          const listaEquipos = Array.isArray(eqsResult) ? eqsResult : eqsResult?.items || [];
          setUsuarios(listaUsuarios);
          setEquipos(listaEquipos);
        })
        .catch((err) => {
          setErrorValidacion('Error cargando catálogo: ' + err.message);
        });
    }
  }, [isOpen, equipoPreseleccionado]);

  const equipoSeleccionado = equipos.find((e) => e.id === equipoId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion(null);

    // Validaciones obligatorias
    if (!usuarioId) {
      setErrorValidacion('Debe seleccionar un usuario responsable.');
      return;
    }

    if (!equipoId) {
      setErrorValidacion('Debe seleccionar un equipo tecnológico.');
      return;
    }

    if (!fechaPrestamo) {
      setErrorValidacion('Debe especificar la fecha de préstamo.');
      return;
    }

    if (!fechaDevolucion) {
      setErrorValidacion('Debe especificar la fecha de devolución.');
      return;
    }

    if (fechaDevolucion < fechaPrestamo) {
      setErrorValidacion('La fecha de devolución debe ser igual o posterior a la fecha de préstamo.');
      return;
    }

    // Reglas de negocio de disponibilidad de equipo
    if (equipoSeleccionado) {
      if (equipoSeleccionado.estado === 'Prestado') {
        setErrorValidacion(
          `El equipo '${equipoSeleccionado.codigoPatrimonial}' ya se encuentra prestado.`
        );
        return;
      }
      if (equipoSeleccionado.estado === 'En Mantenimiento' || equipoSeleccionado.estado === 'En mantenimiento') {
        setErrorValidacion(
          `El equipo '${equipoSeleccionado.codigoPatrimonial}' está en mantenimiento y no puede prestarse.`
        );
        return;
      }
      if (equipoSeleccionado.estado === 'De Baja' || equipoSeleccionado.estado === 'Dado de baja') {
        setErrorValidacion(
          `El equipo '${equipoSeleccionado.codigoPatrimonial}' fue dado de baja definitivamente.`
        );
        return;
      }
    }

    try {
      setCargando(true);
      const payload = {
        usuarioId,
        equipoId,
        fechaPrestamo: new Date(fechaPrestamo + 'T10:00:00Z').toISOString(),
        fechaEsperadaDevolucion: new Date(fechaDevolucion + 'T23:59:59Z').toISOString(),
        observaciones: observaciones.trim() || 'Sin observaciones registradas',
        observacionEntrega: observaciones.trim() || null,
      };

      await prestamosService.create(payload);
      onCreado();
      onClose();
    } catch (err) {
      setErrorValidacion(err.message || 'Error al procesar el registro del préstamo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Registrar Nuevo Préstamo de Equipo"
      subtitulo="Innovatech Solutions S.A.C. – Control de Asignaciones"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorValidacion && (
          <AlertBanner
            tipo="error"
            mensaje={errorValidacion}
            onClose={() => setErrorValidacion(null)}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Selección de Usuario Responsable */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Usuario Responsable *
            </label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            >
              <option value="" disabled>
                Seleccionar usuario
              </option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombres} {u.apellidos} &bull; {u.area} ({u.rol})
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Equipo Tecnológico */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Equipo Tecnológico *
            </label>
            <select
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            >
              <option value="" disabled>
                Seleccionar equipo
              </option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.codigoPatrimonial}] {e.nombre} ({e.estado})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerta si el equipo no está disponible */}
        {equipoSeleccionado && equipoSeleccionado.estado !== 'Disponible' && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span>
              ⚠️ <strong>Atención:</strong> Este equipo se encuentra en estado{' '}
              <strong>{equipoSeleccionado.estado}</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha de Préstamo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha de préstamo *
            </label>
            <input
              type="date"
              value={fechaPrestamo}
              onChange={(e) => setFechaPrestamo(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          {/* Fecha de Devolución */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha de devolución *
            </label>
            <input
              type="date"
              min={fechaPrestamo}
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Observaciones (único campo de texto) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Observaciones
          </label>
          <textarea
            rows="3"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones de entrega, accesorios (cargador, funda), estado físico o justificación..."
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
          />
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
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/30 transition-all flex items-center gap-2"
          >
            {cargando ? 'Registrando...' : 'Confirmar Préstamo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
