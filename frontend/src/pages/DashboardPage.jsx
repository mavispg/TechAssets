import React, { useState, useEffect } from 'react';
import {
  Laptop,
  CheckCircle2,
  Clock,
  Wrench,
  FileCheck2,
  TrendingUp,
  Plus,
  Building2,
  PieChart as PieChartIcon,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import CardKPI from '../components/CardKPI';
import EstadoBadge from '../components/EstadoBadge';
import ModalNuevoPrestamo from '../components/ModalNuevoPrestamo';
import ModalDevolucion from '../components/ModalDevolucion';
import AlertBanner from '../components/AlertBanner';
import Paginador from '../components/shared/Paginador';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Paleta de colores para el gráfico de dona
const PALETA_DONA = [
  '#2563EB', // Azul
  '#84CC16', // Verde lima Innovatech
  '#06B6D4', // Cyan
  '#F59E0B', // Ámbar
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
];

export default function DashboardPage() {
  const { currentUser, esColaborador } = useAuth();
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Paginación para la tabla de préstamos recientes (10 por página)
  const [paginaTabla, setPaginaTabla] = useState(1);
  const tamanoPagina = 10;

  // Modales
  const [modalNuevoPrestamoAbierto, setModalNuevoPrestamoAbierto] = useState(false);
  const [prestamoParaDevolver, setPrestamoParaDevolver] = useState(null);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await dashboardService.getSummary();
      setMetricas(data);
    } catch (err) {
      setError('Error al obtener datos del panel: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  // Cálculo de segmentos para el Gráfico de Dona SVG
  const radio = 65;
  const circunferencia = 2 * Math.PI * radio;
  const totalEquiposDona =
    metricas?.distribucionPorCategoria?.reduce((acc, cur) => acc + cur.cantidad, 0) ||
    metricas?.totalEquipos ||
    0;

  let offsetAcumulado = 0;
  const segmentosDona = (metricas?.distribucionPorCategoria || []).map((cat, idx) => {
    const porcentaje = totalEquiposDona > 0 ? cat.cantidad / totalEquiposDona : 0;
    const strokeDasharray = `${porcentaje * circunferencia} ${circunferencia}`;
    const strokeDashoffset = -offsetAcumulado;
    offsetAcumulado += porcentaje * circunferencia;
    const color = PALETA_DONA[idx % PALETA_DONA.length];
    return {
      ...cat,
      porcentajeTexto: Math.round(porcentaje * 100),
      strokeDasharray,
      strokeDashoffset,
      color,
    };
  });

  // Filtrado de préstamos según el rol (el Colaborador ve solo lo suyo)
  const todosPrestamosRecientes = metricas?.prestamosRecientes || [];
  const prestamosFiltrados = todosPrestamosRecientes.filter((p) => {
    if (esColaborador) {
      const matchId = p.usuarioId && currentUser?.id && p.usuarioId === currentUser.id;
      const matchCorreo =
        p.usuarioCorreo &&
        currentUser?.correo &&
        p.usuarioCorreo.toLowerCase() === currentUser.correo.toLowerCase();
      return matchId || matchCorreo;
    }
    return true;
  });

  // Paginación en cliente (10 por página)
  const totalFiltrados = prestamosFiltrados.length;
  const totalPaginasTabla = Math.ceil(totalFiltrados / tamanoPagina) || 1;
  const prestamosPaginados = prestamosFiltrados.slice(
    (paginaTabla - 1) * tamanoPagina,
    paginaTabla * tamanoPagina
  );

  return (
    <div className="space-y-6 w-full">
      {/* Barra de Bienvenida y Acción (Sin botón de refresh redundante) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0B132B] text-white p-5 sm:p-6 rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-lime-400">
              Panel de Control Operativo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Bienvenido, {currentUser.nombres} {currentUser.apellidos}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Supervisión integral de asignaciones, inventario y disponibilidad en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalNuevoPrestamoAbierto(true)}
            className="btn-base bg-lime-500 hover:bg-lime-400 text-[#0B132B] font-black shadow-md shadow-lime-500/20 px-5 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>
      </div>

      {error && <AlertBanner tipo="error" mensaje={error} onClose={() => setError(null)} />}

      {/* 1. SEIS TARJETAS ESTADÍSTICAS HORIZONTALES (Formato rectangular apaisado) */}
      {/* Icono a un lado, título y valor al otro. Mismas dimensiones y ensanchadas. */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <CardKPI
          titulo="Total Equipos"
          valor={metricas ? metricas.totalEquipos : '—'}
          subtitulo="Activos registrados"
          icon={Laptop}
          color="blue"
        />

        <CardKPI
          titulo="Disponibles"
          valor={metricas ? metricas.equiposDisponibles : '—'}
          subtitulo="En stock"
          icon={CheckCircle2}
          color="emerald"
        />

        <CardKPI
          titulo="Prestados"
          valor={metricas ? metricas.equiposPrestados : '—'}
          subtitulo="En campo"
          icon={Clock}
          color="indigo"
        />

        <CardKPI
          titulo="Mantenimiento"
          valor={metricas ? metricas.equiposEnMantenimiento : '—'}
          subtitulo="Revisión técnica"
          icon={Wrench}
          color="amber"
        />

        <CardKPI
          titulo="Total Préstamos"
          valor={metricas ? metricas.totalPrestamos : '—'}
          subtitulo="Historial acumulado"
          icon={FileCheck2}
          color="purple"
        />

        <CardKPI
          titulo="Área Mayor Uso"
          valor={metricas?.areaConMayorUso || '—'}
          subtitulo={
            metricas?.cantidadPrestamosAreaMayorUso !== undefined
              ? `${metricas.cantidadPrestamosAreaMayorUso} préstamos`
              : 'Sin registros'
          }
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* 2. DOS GRÁFICOS JUSTO DEBAJO, LADO A LADO Y CON LA MISMA ALTURA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Gráfico Izquierdo: Gráfico de Dona */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Distribución por Categoría</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proporción de inventario tecnológico según el tipo de hardware
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {totalEquiposDona} unidades
            </span>
          </div>

          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
            {/* Gráfico SVG de Dona */}
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radio}
                  stroke="currentColor"
                  strokeWidth="20"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-700/60"
                />
                {segmentosDona.map((seg) => (
                  <circle
                    key={seg.categoria}
                    cx="80"
                    cy="80"
                    r={radio}
                    stroke={seg.color}
                    strokeWidth="20"
                    fill="transparent"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 hover:opacity-90"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalEquiposDona}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Activos
                </span>
              </div>
            </div>

            {/* Leyenda con valores y porcentajes */}
            <div className="space-y-2.5">
              {segmentosDona.map((seg) => (
                <div
                  key={seg.categoria}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {seg.categoria}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {seg.cantidad} u.
                    </span>
                    <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {seg.porcentajeTexto}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            Inventario clasificado por catálogo patrimonial institucional.
          </div>
        </div>

        {/* Gráfico Derecho: Demanda por áreas en barras */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                <span>Demanda por Áreas</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Volumen acumulado de solicitudes por departamento institucional
              </p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="my-6 space-y-4">
            {metricas?.prestamosPorArea?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No hay registros de solicitudes por área aún.
              </p>
            ) : (
              metricas?.prestamosPorArea?.map((area) => {
                const maximoPrestamos = Math.max(
                  1,
                  ...(metricas?.prestamosPorArea?.map((a) => a.totalPrestamos) || [1])
                );
                const porcentaje = Math.round((area.totalPrestamos / maximoPrestamos) * 100);

                return (
                  <div key={area.area} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {area.area}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {area.totalPrestamos} préstamo(s)
                        </span>
                        <span className="text-[10px] text-slate-400">({porcentaje}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700/70 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(porcentaje, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            Métrica calculada sobre el historial de solicitudes registradas.
          </div>
        </div>
      </div>

      {/* 3. TABLA DE PRÉSTAMOS RECIENTES / EN CURSO (COMPLETA Y FUNCIONAL) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Préstamos recientes / en curso
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {esColaborador
                ? 'Tus préstamos y solicitudes vigentes en Innovatech.'
                : 'Últimas transacciones registradas en el sistema institucional.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                <th className="py-3 px-4">Equipo</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Fecha Préstamo</th>
                <th className="py-3 px-4">Fecha Devolución</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {prestamosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                      {esColaborador
                        ? 'No tienes préstamos activos ni recientes asignados a tu cuenta.'
                        : 'No se encontraron préstamos registrados en el sistema.'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {esColaborador
                        ? 'Puedes realizar una nueva solicitud haciendo clic en "Nuevo Préstamo".'
                        : 'Los préstamos aparecerán aquí una vez que sean registrados.'}
                    </p>
                  </td>
                </tr>
              ) : (
                prestamosPaginados.map((p) => {
                  const codigo = p.equipoCodigoPatrimonial || p.codigoEquipo || '—';
                  const nombre = p.equipoNombre || p.nombreEquipo || 'Equipo sin nombre';
                  const categoria = p.equipoCategoria || '—';
                  const marca = p.equipoMarca || '';
                  const usuario = p.usuarioNombre || p.usuarioResponsable || '—';
                  const area = p.usuarioArea || p.areaUsuario || '—';
                  const estado = p.estadoPrestamo || p.estado || 'Pendiente';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                          {codigo}
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold block">
                          {nombre}
                        </span>
                        {(categoria || marca) && (
                          <span className="text-[10px] text-slate-400 block">
                            {categoria} {marca ? `• ${marca}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {usuario}
                        </span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">
                          {area}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.fechaPrestamo ? new Date(p.fechaPrestamo).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="block font-semibold">
                          {p.fechaEsperadaDevolucion
                            ? new Date(p.fechaEsperadaDevolucion).toLocaleDateString()
                            : '—'}
                        </span>
                        {p.fechaDevolucion && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            Devuelto: {new Date(p.fechaDevolucion).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <EstadoBadge estado={estado} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!esColaborador && estado === 'Activo' && (
                          <button
                            type="button"
                            onClick={() => setPrestamoParaDevolver(p)}
                            className="btn-base px-3 py-1.5 min-h-[34px] text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Devolver</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador obligatorio para la tabla */}
        <Paginador
          pagina={paginaTabla}
          totalPaginas={totalPaginasTabla}
          totalElementos={totalFiltrados}
          tamano={tamanoPagina}
          onCambiarPagina={(nueva) => setPaginaTabla(nueva)}
        />
      </div>

      {/* Modales */}
      {modalNuevoPrestamoAbierto && (
        <ModalNuevoPrestamo
          isOpen={modalNuevoPrestamoAbierto}
          onClose={() => setModalNuevoPrestamoAbierto(false)}
          onCreado={() => {
            setModalNuevoPrestamoAbierto(false);
            cargarDashboard();
          }}
        />
      )}

      {prestamoParaDevolver && (
        <ModalDevolucion
          prestamo={prestamoParaDevolver}
          isOpen={!!prestamoParaDevolver}
          onClose={() => setPrestamoParaDevolver(null)}
          onDevuelto={() => {
            setPrestamoParaDevolver(null);
            cargarDashboard();
          }}
        />
      )}
    </div>
  );
}
