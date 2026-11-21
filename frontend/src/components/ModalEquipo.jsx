import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import AlertBanner from './AlertBanner';
import { equiposService } from '../services/api';

export default function ModalEquipo({ isOpen, onClose, equipoParaEditar = null, onGuardado }) {
  const [codigoPatrimonial, setCodigoPatrimonial] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Laptop');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [estado, setEstado] = useState('Disponible');
  const [observacionesTecnicas, setObservacionesTecnicas] = useState('');

  const [cargando, setCargando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState(null);

  const esEdicion = Boolean(equipoParaEditar);

  const categoriasDisponibles = [
    'Laptop',
    'Monitor',
    'Proyector',
    'Tablet',
    'Servidor',
    'Periférico',
    'Impresora',
    'Redes y Comunicaciones',
  ];

  useEffect(() => {
    if (isOpen) {
      setErrorValidacion(null);
      if (equipoParaEditar) {
        setCodigoPatrimonial(equipoParaEditar.codigoPatrimonial || '');
        setNombre(equipoParaEditar.nombre || '');
        setCategoria(equipoParaEditar.categoria || 'Laptop');
        setMarca(equipoParaEditar.marca || '');
        setModelo(equipoParaEditar.modelo || '');
        setNumeroSerie(equipoParaEditar.numeroSerie || '');
        setEstado(equipoParaEditar.estado || 'Disponible');
        setObservacionesTecnicas(equipoParaEditar.observacionesTecnicas || '');
      } else {
        setCodigoPatrimonial('');
        setNombre('');
        setCategoria('Laptop');
        setMarca('');
        setModelo('');
        setNumeroSerie('');
        setEstado('Disponible');
        setObservacionesTecnicas('');
      }
    }
  }, [isOpen, equipoParaEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion(null);

    // Validación de frontend
    if (!esEdicion && (!codigoPatrimonial.trim() || codigoPatrimonial.trim().length < 4)) {
      setErrorValidacion(
        'El código patrimonial debe tener al menos 4 caracteres (ej. EQ-LAP-001).'
      );
      return;
    }

    if (!nombre.trim() || nombre.trim().length < 3) {
      setErrorValidacion('El nombre del equipo debe tener al menos 3 caracteres.');
      return;
    }

    if (!marca.trim() || !modelo.trim() || !numeroSerie.trim()) {
      setErrorValidacion('Marca, modelo y número de serie son campos obligatorios.');
      return;
    }

    try {
      setCargando(true);
      if (esEdicion) {
        await equiposService.update(equipoParaEditar.id, {
          nombre: nombre.trim(),
          categoria,
          marca: marca.trim(),
          modelo: modelo.trim(),
          numeroSerie: numeroSerie.trim(),
          estado,
          observacionesTecnicas: observacionesTecnicas.trim() || null,
        });
      } else {
        await equiposService.create({
          codigoPatrimonial: codigoPatrimonial.trim().toUpperCase(),
          nombre: nombre.trim(),
          categoria,
          marca: marca.trim(),
          modelo: modelo.trim(),
          numeroSerie: numeroSerie.trim(),
          estado,
          observacionesTecnicas: observacionesTecnicas.trim() || null,
        });
      }

      onGuardado();
      onClose();
    } catch (err) {
      setErrorValidacion(err.message || 'Error guardando datos del equipo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo={
        esEdicion
          ? `Editar Equipo: ${equipoParaEditar.codigoPatrimonial}`
          : 'Registrar Nuevo Equipo Tecnológico'
      }
      subtitulo="Innovatech Solutions S.A.C. – Registro de equipos"
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
          {/* Código Patrimonial  */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Código Patrimonial *
            </label>
            <input
              type="text"
              value={codigoPatrimonial}
              onChange={(e) => setCodigoPatrimonial(e.target.value.toUpperCase())}
              disabled={esEdicion}
              placeholder="Ej. EQ-LAP-005"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 disabled:opacity-75 disabled:cursor-not-allowed outline-none font-mono"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categoría de Activo *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
            >
              {categoriasDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nombre descriptivo */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nombre del Equipo / Descripción Comercial *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Laptop Lenovo ThinkPad L14 Gen 4"
            className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Marca */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Marca *
            </label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej. Lenovo, Dell, Apple"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Modelo *
            </label>
            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ej. ThinkPad L14"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          {/* Serie */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Número de Serie *
            </label>
            <input
              type="text"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              placeholder="Ej. SN-LEN-L14-99"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Estado Inicial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado del Activo
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
            >
              <option value="Disponible">Disponible</option>
              <option value="En Mantenimiento">En Mantenimiento </option>
              <option value="De Baja">De Baja </option>
            </select>
          </div>

          {/* Observaciones Técnicas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observaciones / Especificaciones
            </label>
            <input
              type="text"
              value={observacionesTecnicas}
              onChange={(e) => setObservacionesTecnicas(e.target.value)}
              placeholder="Ej. RAM 16GB, SSD 512GB, garantía vigente"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
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
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/30 transition-all"
          >
            {cargando ? 'Guardando...' : esEdicion ? 'Actualizar Equipo' : 'Registrar Equipo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
