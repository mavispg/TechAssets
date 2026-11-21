import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import EstadoBadge from '../components/EstadoBadge';
import ModalNuevoPrestamo from '../components/ModalNuevoPrestamo';
import ModalDevolucion from '../components/ModalDevolucion';
import ModalConfirmacion from '../components/ModalConfirmacion';
import AlertBanner from '../components/AlertBanner';
import { prestamosService } from '../services/api';
import Paginador from '../components/shared/Paginador';
import { useAuth } from '../context/AuthContext';

export default function PrestamosPage() {
  const { currentUser, esColaborador, esAdmin, esResponsableTecnologia } = useAuth();
  const puedeAprobarYDevolver = esAdmin || esResponsableTecnologia;

  const [prestamos, setPrestamos] = useState([]);
  const [totalPrestamos, setTotalPrestamos] = useState(0);
  const [pagina, setPagina] = useState(1);
  const tamano = 10;
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Pestañas de Estado (Activo, Pendiente, Historial, Todos)
  const [tabEstado, setTabEstado] = useState('Activo');

  // Filtros de búsqueda y fechas
  const [termino, setTermino] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [prestamoParaDevolver, setPrestamoParaDevolver] = useState(null);
  const [prestamoParaRechazar, setPrestamoParaRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const cargarPrestamos = async () => {
    try {
      setCargando(true);
      setError(null);

      // Regla por rol: Colaborador siempre ve sus préstamos. Admin y Responsable TI ven todos.
      const params = {
        termino: termino || null,
        desde: desde || null,
        hasta: hasta || null,
        usuarioId: esColaborador ? currentUser.id : null,
      };

      if (tabEstado === 'Activo') {
        params.estadoPrestamo = 'Activo';
      } else if (tabEstado === 'Pendiente') {
        params.estadoPrestamo = 'Pendiente';
      } else if (tabEstado === 'Historial') {
        params.estadoPrestamo = 'Devuelto';
      }

      const data = await prestamosService.getAll(params);
      let items = Array.isArray(data) ? data : data.items || [];

      // Si la pestaña es Historial, incluimos devueltos y rechazados
      if (tabEstado === 'Historial') {
        const todos = await prestamosService.getAll({
          termino: termino || null,
          desde: desde || null,
          hasta: hasta || null,
          usuarioId: esColaborador ? currentUser.id : null,
        });
        const todosItems = Array.isArray(todos) ? todos : todos.items || [];
        items = todosItems.filter(
          (p) => p.estadoPrestamo === 'Devuelto' || p.estadoPrestamo === 'Rechazado'
        );
      }

      setPrestamos(items);
      setTotalPrestamos(items.length);
    } catch (err) {
      setError('Error al obtener préstamos: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPrestamos();
  }, [tabEstado]);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPagina(1);
    cargarPrestamos();
  };

  const handleLimpiarFiltros = () => {
    setTermino('');
    setDesde('');
    setHasta('');
    setPagina(1);
    setTimeout(() => {
      cargarPrestamos();
    }, 0);
  };

  const handleAprobar = async (prestamo) => {
    try {
      await prestamosService.approveLoan(prestamo.id);
      setExito(
        `Préstamo aprobado con éxito. El equipo '${prestamo.equipoCodigoPatrimonial}' pasó a estado Prestado.`
      );
      cargarPrestamos();
    } catch (err) {
      setError(err.message || 'Error al aprobar el préstamo.');
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!prestamoParaRechazar) return;
    try {
      await prestamosService.rejectLoan(
        prestamoParaRechazar.id,
        motivoRechazo || 'Rechazado por administración'
      );
      setExito(
        `Préstamo rechazado. El equipo '${prestamoParaRechazar.equipoCodigoPatrimonial}' permanece Disponible.`
      );
      setPrestamoParaRechazar(null);
      setMotivoRechazo('');
      cargarPrestamos();
    } catch (err) {
      setError(err.message || 'Error al rechazar el préstamo.');
      setPrestamoParaRechazar(null);
    }
  };

  const pestanas = [
    { id: 'Activo', label: 'Préstamos Activos' },
    { id: 'Pendiente', label: 'Por Aprobar' },
    { id: 'Historial', label: 'Historial de Préstamos' },
    { id: 'Todos', label: 'Todos los Registros' },
  ];

  // Paginación obligatoria (10 filas por página)
  const totalPaginas = Math.ceil(totalPrestamos / tamano) || 1;
  const prestamosPaginados = prestamos.slice((pagina - 1) * tamano, pagina * tamano);

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción Contextual */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Gestión de préstamos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control de solicitudes, autorizaciones, entregas y devoluciones de equipos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNuevoAbierto(true)}
          className="btn-base btn-primario self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Préstamo</span>
        </button>
      </div>

      {error && <AlertBanner tipo="error" mensaje={error} onClose={() => setError(null)} />}
      {exito && <AlertBanner tipo="success" mensaje={exito} onClose={() => setExito(null)} />}

      {/* Pestañas y Filtros */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm space-y-4">
        {/* Pestañas de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          {pestanas.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTabEstado(t.id);
                setPagina(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                tabEstado === t.id
                  ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Buscador de Texto, Filtro de Fechas y Botón Limpiar */}
        <form
          onSubmit={handleBuscar}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={termino}
              onChange={(e) => {
                setTermino(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por usuario, equipo o código patrimonial..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Desde:</span>
              <input
                type="date"
                value={desde}
                onChange={(e) => {
                  setDesde(e.target.value);
                  setPagina(1);
                }}
                className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <span>Hasta:</span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => {
                  setHasta(e.target.value);
                  setPagina(1);
                }}
                className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-lime-500"
              />
            </div>

            <button
              type="submit"
              className="btn-base btn-primario px-3.5 py-1.5 min-h-[36px] text-xs"
            >
              Buscar
            </button>

            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="btn-base btn-secundario px-3 py-1.5 min-h-[36px] text-xs flex items-center gap-1"
              title="Restablecer filtros"
              aria-label="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Préstamos: SIN SCROLL HORIZONTAL (encaja completa en el ancho disponible) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs table-fixed">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
              <th className="py-3 px-3 sm:px-4 w-[24%]">Equipo Tecnológico</th>
              <th className="py-3 px-3 sm:px-4 w-[20%]">Usuario Responsable</th>
              <th className="py-3 px-3 sm:px-4 w-[18%]">Fechas (Préstamo / Devolución)</th>
              <th className="py-3 px-3 sm:px-4 w-[12%]">Estado</th>
              <th className="py-3 px-3 sm:px-4 w-[14%]">Observaciones</th>
              <th className="py-3 px-3 sm:px-4 w-[12%] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {prestamosPaginados.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">
                  No se encontraron registros de préstamos en esta vista.
                </td>
              </tr>
            ) : (
              prestamosPaginados.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  {/* Columna 1: Equipo Tecnológico */}
                  <td className="py-3 px-3 sm:px-4 align-top">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block truncate">
                      {p.equipoCodigoPatrimonial}
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold block whitespace-normal break-words leading-tight mt-0.5">
                      {p.equipoNombre}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                      {p.equipoCategoria} &bull; {p.equipoMarca}
                    </span>
                  </td>

                  {/* Columna 2: Usuario Responsable */}
                  <td className="py-3 px-3 sm:px-4 align-top">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block whitespace-normal break-words leading-tight">
                      {p.usuarioNombre}
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block truncate mt-0.5">
                      {p.usuarioArea}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {p.usuarioCorreo}
                    </span>
                  </td>

                  {/* Columna 3: Fechas combinadas en 2 líneas */}
                  <td className="py-3 px-3 sm:px-4 align-top">
                    <div className="space-y-1 leading-tight">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Préstamo:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(p.fechaPrestamo).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Devolución:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(p.fechaEsperadaDevolucion).toLocaleDateString()}
                        </span>
                      </div>
                      {p.fechaDevolucion && (
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Devuelto: {new Date(p.fechaDevolucion).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Columna 4: Estado */}
                  <td className="py-3 px-3 sm:px-4 align-top">
                    <EstadoBadge estado={p.estadoPrestamo} />
                  </td>

                  {/* Columna 5: Observaciones con texto en múltiples líneas */}
                  <td className="py-3 px-3 sm:px-4 align-top">
                    <p className="text-slate-600 dark:text-slate-300 whitespace-normal break-words leading-snug line-clamp-3">
                      {p.motivoPrestamo || p.observacionEntrega || 'Sin observaciones'}
                    </p>
                    {p.observacionDevolucion && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 italic block mt-1 line-clamp-2">
                        Devolución: {p.observacionDevolucion}
                      </span>
                    )}
                  </td>

                  {/* Columna 6: Iconos de Acciones Grandes (40x40px, colores semánticos WCAG AA) */}
                  <td className="py-3 px-3 sm:px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Si está pendiente: Aprobar (Verde) y Rechazar (Rojo) */}
                      {p.estadoPrestamo === 'Pendiente' && puedeAprobarYDevolver && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAprobar(p)}
                            className="btn-accion-tabla text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-300 dark:hover:border-emerald-800"
                            title="Aprobar solicitud de préstamo"
                            aria-label={`Aprobar solicitud de préstamo para ${p.equipoCodigoPatrimonial}`}
                          >
                            <Check className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPrestamoParaRechazar(p);
                              setMotivoRechazo('');
                            }}
                            className="btn-accion-tabla text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-300 dark:hover:border-rose-800"
                            title="Rechazar solicitud de préstamo"
                            aria-label={`Rechazar solicitud de préstamo para ${p.equipoCodigoPatrimonial}`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Si está activo: Devolver (Naranja / Ámbar) */}
                      {p.estadoPrestamo === 'Activo' && puedeAprobarYDevolver && (
                        <button
                          type="button"
                          onClick={() => setPrestamoParaDevolver(p)}
                          className="btn-accion-tabla text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-300 dark:hover:border-amber-800"
                          title="Registrar devolución de equipo"
                          aria-label={`Registrar devolución de ${p.equipoCodigoPatrimonial}`}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginador obligatorio: 10 filas por página */}
        <Paginador
          pagina={pagina}
          totalPaginas={totalPaginas}
          totalElementos={totalPrestamos}
          tamano={tamano}
          onCambiarPagina={setPagina}
        />
      </div>

      {/* Modales */}
      {modalNuevoAbierto && (
        <ModalNuevoPrestamo
          isOpen={modalNuevoAbierto}
          onClose={() => setModalNuevoAbierto(false)}
          onCreado={() => {
            setExito('Solicitud de préstamo registrada exitosamente con estado Pendiente.');
            cargarPrestamos();
          }}
        />
      )}

      {prestamoParaDevolver && (
        <ModalDevolucion
          prestamo={prestamoParaDevolver}
          isOpen={!!prestamoParaDevolver}
          onClose={() => setPrestamoParaDevolver(null)}
          onDevuelto={() => {
            setExito('Devolución registrada exitosamente. El equipo vuelve a estar Disponible.');
            setPrestamoParaDevolver(null);
            cargarPrestamos();
          }}
        />
      )}

      {/* Modal Rechazar Préstamo */}
      <ModalConfirmacion
        isOpen={Boolean(prestamoParaRechazar)}
        onClose={() => setPrestamoParaRechazar(null)}
        onConfirmar={handleConfirmarRechazo}
        titulo="Rechazar Solicitud de Préstamo"
        mensaje={`¿Está seguro de rechazar la solicitud de préstamo para el equipo '${prestamoParaRechazar?.equipoCodigoPatrimonial} - ${prestamoParaRechazar?.equipoNombre}' solicitado por ${prestamoParaRechazar?.usuarioNombre}? El equipo permanecerá en estado Disponible.`}
        textoConfirmar="Rechazar Préstamo"
        esPeligroso={true}
      />
    </div>
  );
}
