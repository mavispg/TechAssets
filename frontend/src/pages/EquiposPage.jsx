import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import EstadoBadge from '../components/EstadoBadge';
import ModalEquipo from '../components/ModalEquipo';
import ModalConfirmacion from '../components/ModalConfirmacion';
import AlertBanner from '../components/AlertBanner';
import { equiposService } from '../services/api';
import Paginador from '../components/shared/Paginador';
import { useAuth } from '../context/AuthContext';

export default function EquiposPage() {
  const { esAdmin, esResponsableTecnologia, esColaborador } = useAuth();

  const [equipos, setEquipos] = useState([]);
  const [totalEquipos, setTotalEquipos] = useState(0);
  const [pagina, setPagina] = useState(1);
  const tamano = 10;
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Filtros
  const [termino, setTermino] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');

  // Modales
  const [modalEquipoAbierto, setModalEquipoAbierto] = useState(false);
  const [equipoParaEditar, setEquipoParaEditar] = useState(null);
  const [equipoParaEliminar, setEquipoParaEliminar] = useState(null);

  const cargarEquipos = async () => {
    try {
      setCargando(true);
      setError(null);
      const result = await equiposService.getAll({
        termino,
        categoria,
        estado,
        page: pagina,
        pageSize: tamano,
      });
      const items = result.items ?? result;
      setEquipos(items);
      setTotalEquipos(result.total ?? items.length);
    } catch (err) {
      setError('Error al obtener la lista de equipos: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, [categoria, estado, pagina]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPagina(1);
    cargarEquipos();
  };

  // Botón Limpiar: Restablece todos los filtros, buscador y vuelve a la página 1
  const handleLimpiarFiltros = () => {
    setTermino('');
    setCategoria('');
    setEstado('');
    setPagina(1);
    setTimeout(() => {
      cargarEquipos();
    }, 0);
  };

  const handleConfirmarEliminacion = async () => {
    if (!equipoParaEliminar) return;

    try {
      await equiposService.delete(equipoParaEliminar.id);
      setExito(`El equipo '${equipoParaEliminar.codigoPatrimonial}' fue eliminado del catálogo.`);
      setEquipoParaEliminar(null);
      cargarEquipos();
    } catch (err) {
      setError(err.message || 'Error eliminando el equipo.');
      setEquipoParaEliminar(null);
    }
  };

  const handleCambiarEstadoDirecto = async (equipo, nuevoEstado) => {
    try {
      await equiposService.changeState(
        equipo.id,
        nuevoEstado,
        'Actualización directa desde columna Estado'
      );
      setExito(`Estado de '${equipo.codigoPatrimonial}' actualizado a ${nuevoEstado}.`);
      cargarEquipos();
    } catch (err) {
      setError(err.message || 'Error actualizando estado.');
    }
  };

  const categoriasDisponibles = [
    'Laptop',
    'Monitor',
    'Proyector',
    'Tablet',
    'Servidor',
    'Periférico',
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción Contextual */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Equipos tecnológicos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Consulta el inventario, la disponibilidad y el estado de cada activo tecnológico.
          </p>
        </div>

        {(esAdmin || esResponsableTecnologia) && (
          <button
            type="button"
            onClick={() => {
              setEquipoParaEditar(null);
              setModalEquipoAbierto(true);
            }}
            className="btn-base btn-primario self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Equipo</span>
          </button>
        )}
      </div>

      {error && <AlertBanner tipo="error" mensaje={error} onClose={() => setError(null)} />}
      {exito && <AlertBanner tipo="success" mensaje={exito} onClose={() => setExito(null)} />}

      {/* Barra de Filtros, Búsqueda y Botón Limpiar */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Formulario de Búsqueda */}
        <form onSubmit={handleBuscar} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={termino}
              onChange={(e) => {
                setTermino(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por código, nombre, marca o modelo..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
          <button
            type="submit"
            className="btn-base btn-primario px-4 py-2 min-h-[38px] text-xs"
          >
            Buscar
          </button>
        </form>

        {/* Filtros Dropdown y Botón Limpiar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setPagina(1);
            }}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-2 px-3 outline-none focus:ring-2 focus:ring-lime-500 font-medium"
          >
            <option value="">Todas las categorías</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPagina(1);
            }}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-2 px-3 outline-none focus:ring-2 focus:ring-lime-500 font-medium"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Prestado">Prestado</option>
            <option value="En Mantenimiento">En mantenimiento</option>
            <option value="De Baja">Dado de baja</option>
          </select>

          {/* Botón Limpiar: Claramente visible, estilo secundario con borde y contraste */}
          <button
            type="button"
            onClick={handleLimpiarFiltros}
            className="btn-base btn-secundario text-xs px-3 py-2 min-h-[38px] font-semibold flex items-center gap-1.5"
            title="Restablecer todos los filtros y volver a la página inicial"
            aria-label="Limpiar filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Tabla de Equipos con Paginación Obligatoria (10 filas por página) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                <th className="py-3 px-4">Cód. Patrimonial</th>
                <th className="py-3 px-4">Equipo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Marca / Modelo</th>
                <th className="py-3 px-4">Estado</th>
                {!esColaborador && <th className="py-3 px-4">Asignación Actual</th>}
                {(esAdmin || esResponsableTecnologia) && (
                  <th className="py-3 px-4 text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {equipos.length === 0 ? (
                <tr>
                  <td
                    colSpan={esColaborador ? 5 : esAdmin || esResponsableTecnologia ? 7 : 6}
                    className="py-10 text-center text-slate-400"
                  >
                    No se encontraron activos tecnológicos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                equipos.map((eq) => (
                  <tr
                    key={eq.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {eq.codigoPatrimonial}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {eq.nombre}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {eq.categoria}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 dark:text-slate-200 block font-semibold">
                        {eq.marca}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-xs">
                        {eq.modelo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {esAdmin || esResponsableTecnologia ? (
                        <select
                          value={
                            eq.estado === 'En Mantenimiento' || eq.estado === 'En mantenimiento'
                              ? 'En mantenimiento'
                              : eq.estado === 'De Baja' || eq.estado === 'Dado de baja'
                                ? 'Dado de baja'
                                : eq.estado
                          }
                          onChange={(e) => handleCambiarEstadoDirecto(eq, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2.5 py-1 outline-none border cursor-pointer transition-all ${
                            eq.estado === 'Disponible'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : eq.estado === 'Prestado'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                : eq.estado === 'En Mantenimiento' ||
                                    eq.estado === 'En mantenimiento'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}
                          title="Cambiar estado del equipo directamente"
                          aria-label={`Cambiar estado de ${eq.codigoPatrimonial}`}
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Prestado">Prestado</option>
                          <option value="En mantenimiento">En mantenimiento</option>
                          <option value="Dado de baja">Dado de baja</option>
                        </select>
                      ) : (
                        <EstadoBadge estado={eq.estado} />
                      )}
                    </td>
                    {!esColaborador && (
                      <td className="py-3.5 px-4">
                        {eq.usuarioActualNombre ? (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {eq.usuarioActualNombre}
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">
                              {eq.usuarioActualArea}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Sin préstamo activo
                          </span>
                        )}
                      </td>
                    )}
                    {(esAdmin || esResponsableTecnologia) && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Editar: Azul, 40x40px, icono 20px */}
                          <button
                            type="button"
                            onClick={() => {
                              setEquipoParaEditar(eq);
                              setModalEquipoAbierto(true);
                            }}
                            className="btn-accion-tabla text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                            title="Editar información del equipo"
                            aria-label={`Editar equipo ${eq.codigoPatrimonial}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          {/* Botón Eliminar: Rojo, 40x40px, icono 20px */}
                          {esAdmin && (
                            <button
                              type="button"
                              onClick={() => setEquipoParaEliminar(eq)}
                              className="btn-accion-tabla text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                              title="Eliminar activo del catálogo"
                              aria-label={`Eliminar equipo ${eq.codigoPatrimonial}`}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador obligatorio: 10 filas por página */}
        <Paginador
          pagina={pagina}
          totalPaginas={Math.max(1, Math.ceil(totalEquipos / tamano))}
          totalElementos={totalEquipos}
          tamano={tamano}
          onCambiarPagina={setPagina}
        />
      </div>

      {/* Modal de Creación / Edición */}
      <ModalEquipo
        isOpen={modalEquipoAbierto}
        onClose={() => setModalEquipoAbierto(false)}
        equipoParaEditar={equipoParaEditar}
        onGuardado={() => {
          setExito('Equipo patrimonial guardado exitosamente.');
          cargarEquipos();
        }}
      />

      {/* Modal Confirmación de Eliminación */}
      <ModalConfirmacion
        isOpen={Boolean(equipoParaEliminar)}
        onClose={() => setEquipoParaEliminar(null)}
        onConfirmar={handleConfirmarEliminacion}
        titulo="Eliminar Activo Tecnológico"
        mensaje={`¿Está seguro de eliminar definitivamente el equipo '${equipoParaEliminar?.codigoPatrimonial} - ${equipoParaEliminar?.nombre}'? Esta acción no se puede deshacer y fallará si el activo posee historial de préstamos.`}
        textoConfirmar="Eliminar Activo"
        esPeligroso={true}
      />
    </div>
  );
}
