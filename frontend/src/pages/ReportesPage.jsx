import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Calendar,
  Filter,
  Building2,
  Laptop,
  CheckCircle2,
  Clock,
  History,
  RotateCcw,
  Search,
  Users,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  PieChart as PieChartIcon,
} from 'lucide-react';
import EstadoBadge from '../components/EstadoBadge';
import AlertBanner from '../components/AlertBanner';
import Paginador from '../components/shared/Paginador';
import { reportesService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportarCSV, exportarPDF } from '../utils/exportUtils';

// El endpoint /api/reportes/por-area devuelve el detalle de préstamos de cada área.
// La fecha de la última solicitud se deriva de ese detalle (el DTO no expone un campo agregado).
const fechaUltimaSolicitud = (item) => {
  const fechas = (item?.detallePrestamos || []).map((p) => p.fechaPrestamo).filter(Boolean);
  if (fechas.length === 0) return null;
  return fechas.reduce((mayor, actual) =>
    new Date(actual) > new Date(mayor) ? actual : mayor
  );
};

export default function ReportesPage() {
  const { esColaborador } = useAuth();

  // Secciones: 'indicadores', 'disponibles', 'prestados', 'por_area', 'movimientos'
  const [seccionActiva, setSeccionActiva] = useState(
    esColaborador ? 'disponibles' : 'indicadores'
  );

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de datos
  const [indicadores, setIndicadores] = useState(null);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);
  const [equiposPrestados, setEquiposPrestados] = useState([]);
  const [reporteArea, setReporteArea] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  // Paginación por sección (10 filas por página)
  const [pagina, setPagina] = useState(1);
  const tamano = 10;

  // Filtros comunes
  const [termino, setTermino] = useState('');
  const [categoria, setCategoria] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Asegurar que colaborador solo pueda ver 'disponibles'
  useEffect(() => {
    if (esColaborador) {
      setSeccionActiva('disponibles');
    }
  }, [esColaborador]);

  const cargarDatosSeccion = async () => {
    try {
      setCargando(true);
      setError(null);

      if (seccionActiva === 'indicadores' && !esColaborador) {
        const data = await reportesService.getIndicadores();
        setIndicadores(data);
      } else if (seccionActiva === 'disponibles') {
        const data = await reportesService.getDisponibles({
          termino: termino || null,
          categoria: categoria || null,
        });
        const items = Array.isArray(data) ? data : data?.items || [];
        setEquiposDisponibles(items);
      } else if (seccionActiva === 'prestados' && !esColaborador) {
        const data = await reportesService.getPrestados({
          termino: termino || null,
        });
        const items = Array.isArray(data) ? data : data?.items || [];
        setEquiposPrestados(items);
      } else if (seccionActiva === 'por_area' && !esColaborador) {
        const data = await reportesService.getByArea({
          desde: desde || null,
          hasta: hasta || null,
        });
        setReporteArea(Array.isArray(data) ? data : []);
      } else if (seccionActiva === 'movimientos' && !esColaborador) {
        const data = await reportesService.getMovimientos({
          desde: desde || null,
          hasta: hasta || null,
        });
        setMovimientos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Error al cargar la sección de reportes: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setPagina(1);
    cargarDatosSeccion();
  }, [seccionActiva]);

  const handleFiltrar = (e) => {
    e.preventDefault();
    setPagina(1);
    cargarDatosSeccion();
  };

  const handleLimpiarFiltros = () => {
    setTermino('');
    setCategoria('');
    setDesde('');
    setHasta('');
    setPagina(1);
    setTimeout(() => {
      cargarDatosSeccion();
    }, 0);
  };

  const categoriasDisponibles = [
    'Laptop',
    'Monitor',
    'Proyector',
    'Tablet',
    'Servidor',
    'Periférico',
  ];

  // =========================================================================
  // MÉTODOS DE EXPORTACIÓN (CSV y PDF) RESPETANDO LOS FILTROS
  // =========================================================================

  const handleExportarDisponibles = (formato) => {
    const encabezados = ['Cód. Patrimonial', 'Equipo', 'Categoría', 'Marca', 'Modelo', 'Nro. Serie', 'Estado'];
    const filas = equiposDisponibles.map((eq) => [
      eq.codigoPatrimonial,
      eq.nombre,
      eq.categoria,
      eq.marca,
      eq.modelo,
      eq.numeroSerie,
      eq.estado,
    ]);
    const criterio = `Búsqueda: "${termino || 'Todas'}" | Categoría: "${categoria || 'Todas'}"`;

    if (formato === 'csv') {
      exportarCSV('reporte_equipos_disponibles', encabezados, filas);
    } else {
      exportarPDF('Reporte de Equipos Disponibles', encabezados, filas, criterio);
    }
  };

  const handleExportarPrestados = (formato) => {
    const encabezados = [
      'Cód. Patrimonial',
      'Equipo',
      'Usuario Responsable',
      'Área',
      'Fecha Préstamo',
      'Fecha Devolución',
      'Estado',
    ];
    const filas = equiposPrestados.map((p) => [
      p.equipoCodigoPatrimonial,
      p.equipoNombre,
      p.usuarioNombre,
      p.usuarioArea,
      new Date(p.fechaPrestamo).toLocaleDateString(),
      new Date(p.fechaEsperadaDevolucion).toLocaleDateString(),
      p.estadoPrestamo,
    ]);
    const criterio = termino ? `Filtro: "${termino}"` : 'Todos los equipos actualmente prestados';

    if (formato === 'csv') {
      exportarCSV('reporte_equipos_prestados', encabezados, filas);
    } else {
      exportarPDF('Reporte de Equipos Prestados y Asignaciones', encabezados, filas, criterio);
    }
  };

  const handleExportarPorArea = (formato) => {
    const encabezados = ['Área / Departamento', 'Total Préstamos en Periodo', 'Fecha Último Préstamo'];
    const filas = reporteArea.map((r) => {
      const ultima = fechaUltimaSolicitud(r);
      return [
        r.area,
        r.totalPrestamos,
        ultima ? new Date(ultima).toLocaleDateString() : 'N/A',
      ];
    });
    const criterio = `Periodo: ${desde || 'Inicio'} hasta ${hasta || 'Hoy'}`;

    if (formato === 'csv') {
      exportarCSV('reporte_prestamos_por_area', encabezados, filas);
    } else {
      exportarPDF('Reporte de Solicitud de Préstamos por Área', encabezados, filas, criterio);
    }
  };

  const handleExportarMovimientos = (formato) => {
    const encabezados = ['Fecha y Hora', 'Cód. Equipo', 'Equipo', 'Tipo de Movimiento', 'Responsable', 'Observaciones'];
    const filas = movimientos.map((m) => [
      new Date(m.fechaMovimiento).toLocaleString(),
      m.equipoCodigoPatrimonial,
      m.equipoNombre,
      m.tipoMovimiento,
      m.usuarioNombre || 'Sin responsable',
      m.motivo || 'Sin observaciones',
    ]);
    const criterio = `Periodo: ${desde || 'Histórico completo'} hasta ${hasta || 'Hoy'}`;

    if (formato === 'csv') {
      exportarCSV('bitacora_movimientos_historicos', encabezados, filas);
    } else {
      exportarPDF('Bitácora de Movimientos Históricos y Trazabilidad', encabezados, filas, criterio);
    }
  };

  // Helper para paginar listas en memoria
  const paginarLista = (lista) => {
    const total = lista.length;
    const paginas = Math.ceil(total / tamano) || 1;
    const items = lista.slice((pagina - 1) * tamano, pagina * tamano);
    return { items, total, paginas };
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Módulo de reportes y analítica
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {esColaborador
              ? 'Consulta de disponibilidad de activos tecnológicos institucionales.'
              : 'Analítica ejecutiva, bitácora de movimientos y reportes exportables en CSV y PDF.'}
          </p>
        </div>
      </div>

      {error && <AlertBanner tipo="error" mensaje={error} onClose={() => setError(null)} />}

      {/* Navegación por Secciones (Sin scroll horizontal: Selector en móvil y flex-wrap en escritorio) */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Selector Desplegable en Móvil */}
        <div className="sm:hidden">
          <label htmlFor="selector-reportes" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
            Seleccionar Reporte:
          </label>
          <select
            id="selector-reportes"
            value={seccionActiva}
            onChange={(e) => setSeccionActiva(e.target.value)}
            className="w-full text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-2.5 px-3 outline-none focus:ring-2 focus:ring-lime-500"
          >
            {!esColaborador && <option value="indicadores">Visualizar indicadores</option>}
            <option value="disponibles">Equipos disponibles</option>
            {!esColaborador && <option value="prestados">Equipos prestados</option>}
            {!esColaborador && <option value="por_area">Préstamos por área</option>}
            {!esColaborador && <option value="movimientos">Movimientos históricos</option>}
          </select>
        </div>

        {/* Pestañas Flexibles en Tablet y Escritorio (Sin scroll horizontal) */}
        <nav className="hidden sm:flex flex-wrap items-center gap-2" aria-label="Secciones de reportes">
          {!esColaborador && (
            <button
              type="button"
              onClick={() => setSeccionActiva('indicadores')}
              className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                seccionActiva === 'indicadores'
                  ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Visualizar indicadores</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSeccionActiva('disponibles')}
            className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              seccionActiva === 'disponibles'
                ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Equipos disponibles</span>
          </button>

          {!esColaborador && (
            <>
              <button
                type="button"
                onClick={() => setSeccionActiva('prestados')}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  seccionActiva === 'prestados'
                    ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Equipos prestados</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionActiva('por_area')}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  seccionActiva === 'por_area'
                    ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Préstamos por área</span>
              </button>

              <button
                type="button"
                onClick={() => setSeccionActiva('movimientos')}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  seccionActiva === 'movimientos'
                    ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Movimientos históricos</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* ================================================================= */}
      {/* SECCIÓN 1: VISUALIZAR INDICADORES (ADMIN Y RESPONSABLE TI) */}
      {/* ================================================================= */}
      {seccionActiva === 'indicadores' && !esColaborador && (
        <div className="space-y-6">
          {/* Tarjetas de Indicadores */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Equipos
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {indicadores?.totalEquipos ?? 0}
              </p>
              <span className="text-[10px] text-slate-400">Inventario global</span>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Disponibles
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {indicadores?.equiposDisponibles ?? 0}
              </p>
              <span className="text-[10px] text-emerald-600/70">Listos para entrega</span>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Prestados
              </span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {indicadores?.equiposPrestados ?? 0}
              </p>
              <span className="text-[10px] text-indigo-600/70">Asignados en campo</span>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-sm">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Mantenimiento
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {indicadores?.equiposEnMantenimiento ?? 0}
              </p>
              <span className="text-[10px] text-amber-600/70">Soporte técnico</span>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 shadow-sm">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Préstamos Activos
              </span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {indicadores?.prestamosActivos ?? 0}
              </p>
              <span className="text-[10px] text-blue-600/70">Vigentes</span>
            </div>

            <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/60 shadow-sm">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                Pendientes
              </span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {indicadores?.prestamosPendientes ?? 0}
              </p>
              <span className="text-[10px] text-rose-600/70">Por aprobar</span>
            </div>
          </div>

          {/* Gráficos y Rankings Analíticos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gráfico 1: Distribución por categoría */}
            <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-1.5 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Distribución por Categoría</span>
                </h3>
              </div>
              <div className="space-y-3">
                {indicadores?.distribucionPorCategoria?.map((cat) => {
                  const pct =
                    indicadores.totalEquipos > 0
                      ? Math.round((cat.cantidad / indicadores.totalEquipos) * 100)
                      : 0;
                  return (
                    <div key={cat.categoria} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{cat.categoria}</span>
                        <span className="text-slate-500">
                          {cat.cantidad} unidades ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico 2: Préstamos por área */}
            <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-1.5 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-lime-600" />
                  <span>Préstamos por Área</span>
                </h3>
              </div>
              <div className="space-y-3">
                {indicadores?.prestamosPorArea?.map((area) => {
                  const max = Math.max(
                    1,
                    ...(indicadores?.prestamosPorArea?.map((a) => a.totalPrestamos) || [1])
                  );
                  const pct = Math.round((area.totalPrestamos / max) * 100);
                  return (
                    <div key={area.area} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{area.area}</span>
                        <span className="text-slate-500">{area.totalPrestamos} préstamo(s)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-lime-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tarjeta 3: Equipos más utilizados (RF-15 ubicado en Reportes para Admin y TI) */}
            <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Equipos más utilizados</span>
                </h3>
              </div>
              <div className="space-y-2.5">
                {indicadores?.equiposMasUtilizados?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Sin préstamos registrados</p>
                ) : (
                  indicadores?.equiposMasUtilizados?.map((eq, index) => (
                    <div
                      key={eq.codigoPatrimonial}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[140px]">
                            {eq.nombre}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {eq.codigoPatrimonial} &bull; {eq.categoria}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {eq.totalPrestamos} préstamo(s)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SECCIÓN 2: CONSULTAR EQUIPOS DISPONIBLES (Accesible para Colaborador) */}
      {/* ================================================================= */}
      {seccionActiva === 'disponibles' && (
        <div className="space-y-4">
          {/* Barra de Filtro y Exportación */}
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleFiltrar} className="flex-1 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                  placeholder="Buscar por código, equipo o marca..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full sm:w-auto text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-2 px-3 outline-none focus:ring-2 focus:ring-lime-500 font-medium"
              >
                <option value="">Todas las categorías</option>
                {categoriasDisponibles.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button type="submit" className="btn-base btn-primario text-xs px-3.5 py-2 min-h-[38px] shrink-0">
                Filtrar
              </button>

              {(termino || categoria) && (
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="btn-base btn-secundario text-xs px-3 py-2 min-h-[38px] shrink-0"
                >
                  Limpiar
                </button>
              )}
            </form>

            {/* Botones de Exportación CSV y PDF */}
            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleExportarDisponibles('csv')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Descargar reporte en formato CSV compatible con Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportarDisponibles('pdf')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Generar e imprimir reporte corporativo en PDF"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {/* Tabla de Equipos Disponibles */}
          {(() => {
            const { items, total, paginas } = paginarLista(equiposDisponibles);
            return (
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                        <th className="py-3 px-4">Cód. Patrimonial</th>
                        <th className="py-3 px-4">Equipo</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Marca / Modelo</th>
                        <th className="py-3 px-4">Número de Serie</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Observaciones Técnicas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-slate-400">
                            No hay equipos disponibles que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        items.map((eq) => (
                          <tr
                            key={eq.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {eq.codigoPatrimonial}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {eq.nombre}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {eq.categoria}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-800 dark:text-slate-200 block font-semibold">
                                {eq.marca}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                {eq.modelo}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">{eq.numeroSerie}</td>
                            <td className="py-3 px-4">
                              <EstadoBadge estado={eq.estado} />
                            </td>
                            <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                              {eq.observacionesTecnicas || 'Operativo, listo para préstamo'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Paginador
                  pagina={pagina}
                  totalPaginas={paginas}
                  totalElementos={total}
                  tamano={tamano}
                  onCambiarPagina={setPagina}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* ================================================================= */}
      {/* SECCIÓN 3: CONSULTAR EQUIPOS PRESTADOS */}
      {/* ================================================================= */}
      {seccionActiva === 'prestados' && !esColaborador && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleFiltrar} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                  placeholder="Buscar por equipo o usuario responsable..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>
              <button type="submit" className="btn-base btn-primario text-xs px-3.5 py-2 min-h-[38px] shrink-0">
                Buscar
              </button>
              {termino && (
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="btn-base btn-secundario text-xs px-3 py-2 min-h-[38px] shrink-0"
                >
                  Limpiar
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleExportarPrestados('csv')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Descargar reporte en formato CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportarPrestados('pdf')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Generar e imprimir reporte en PDF"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {(() => {
            const { items, total, paginas } = paginarLista(equiposPrestados);
            return (
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                        <th className="py-3 px-4">Equipo Tecnológico</th>
                        <th className="py-3 px-4">Usuario Responsable</th>
                        <th className="py-3 px-4">Fecha de Préstamo</th>
                        <th className="py-3 px-4">Fecha de Devolución</th>
                        <th className="py-3 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-slate-400">
                            No hay equipos prestados registrados actualmente.
                          </td>
                        </tr>
                      ) : (
                        items.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                                {p.equipoCodigoPatrimonial}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {p.equipoNombre}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.equipoCategoria} &bull; {p.equipoMarca}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {p.usuarioNombre}
                              </span>
                              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">
                                {p.usuarioArea}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {p.usuarioCorreo}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                              {new Date(p.fechaPrestamo).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                              {new Date(p.fechaEsperadaDevolucion).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <EstadoBadge estado={p.estadoPrestamo} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Paginador
                  pagina={pagina}
                  totalPaginas={paginas}
                  totalElementos={total}
                  tamano={tamano}
                  onCambiarPagina={setPagina}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* ================================================================= */}
      {/* SECCIÓN 4: CONSULTAR PRÉSTAMOS POR ÁREA */}
      {/* ================================================================= */}
      {seccionActiva === 'por_area' && !esColaborador && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleFiltrar} className="flex-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Desde:</span>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span>Hasta:</span>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <button type="submit" className="btn-base btn-primario text-xs px-3.5 py-1.5 min-h-[36px] shrink-0">
                Filtrar Rango
              </button>

              {(desde || hasta) && (
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="btn-base btn-secundario text-xs px-3 py-1.5 min-h-[36px] shrink-0"
                >
                  Limpiar
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleExportarPorArea('csv')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Descargar reporte por área en CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportarPorArea('pdf')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Generar e imprimir reporte por área en PDF"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {(() => {
            const { items, total, paginas } = paginarLista(reporteArea);
            return (
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                        <th className="py-3 px-4">Área / Departamento</th>
                        <th className="py-3 px-4">Total de Préstamos Solicitados</th>
                        <th className="py-3 px-4">Fecha de Última Solicitud</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-10 text-center text-slate-400">
                            No se registran solicitudes para las fechas seleccionadas.
                          </td>
                        </tr>
                      ) : (
                        items.map((r) => (
                          <tr
                            key={r.area}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {r.area}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {r.totalPrestamos} préstamo(s)
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              {fechaUltimaSolicitud(r)
                                ? new Date(fechaUltimaSolicitud(r)).toLocaleDateString()
                                : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Paginador
                  pagina={pagina}
                  totalPaginas={paginas}
                  totalElementos={total}
                  tamano={tamano}
                  onCambiarPagina={setPagina}
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* ================================================================= */}
      {/* SECCIÓN 5: CONSULTAR MOVIMIENTOS HISTÓRICOS */}
      {/* ================================================================= */}
      {seccionActiva === 'movimientos' && !esColaborador && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleFiltrar} className="flex-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Desde:</span>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span>Hasta:</span>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              <button type="submit" className="btn-base btn-primario text-xs px-3.5 py-1.5 min-h-[36px] shrink-0">
                Filtrar Bitácora
              </button>

              {(desde || hasta) && (
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="btn-base btn-secundario text-xs px-3 py-1.5 min-h-[36px] shrink-0"
                >
                  Limpiar
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleExportarMovimientos('csv')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Descargar bitácora de movimientos en CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportarMovimientos('pdf')}
                className="btn-base btn-secundario text-xs flex items-center gap-1.5"
                title="Generar e imprimir bitácora de auditoría en PDF"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {(() => {
            const { items, total, paginas } = paginarLista(movimientos);
            return (
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                        <th className="py-3 px-4">Fecha y Hora</th>
                        <th className="py-3 px-4">Equipo</th>
                        <th className="py-3 px-4">Tipo Movimiento</th>
                        <th className="py-3 px-4">Usuario Responsable</th>
                        <th className="py-3 px-4">Observaciones Registradas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-slate-400">
                            No se registran movimientos históricos en el periodo indicado.
                          </td>
                        </tr>
                      ) : (
                        items.map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                              {new Date(m.fechaMovimiento).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                                {m.equipoCodigoPatrimonial || '—'}
                              </span>
                              <span className="text-slate-900 dark:text-white font-bold block">
                                {m.equipoNombre || '—'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  m.tipoMovimiento === 'Devolución'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : m.tipoMovimiento === 'Préstamo'
                                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                      : m.tipoMovimiento === 'Mantenimiento'
                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {m.tipoMovimiento}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                              {m.usuarioNombre || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 max-w-sm break-words whitespace-normal">
                              {m.motivo || 'Sin observaciones registradas'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Paginador
                  pagina={pagina}
                  totalPaginas={paginas}
                  totalElementos={total}
                  tamano={tamano}
                  onCambiarPagina={setPagina}
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
