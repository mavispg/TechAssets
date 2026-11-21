using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Interfaces.Repositories;

namespace TechAsset.Application.Services;

/// <summary>
/// Módulo de Salida de Datos: Dashboard Ejecutivo (Semanas 09 y 10).
/// Aplica POO para estructurar métricas, consolidar información y responder a los 6 KPIs del proyecto.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly IEquipoRepository _equipoRepository;
    private readonly IPrestamoRepository _prestamoRepository;

    public DashboardService(IEquipoRepository equipoRepository, IPrestamoRepository prestamoRepository)
    {
        _equipoRepository = equipoRepository;
        _prestamoRepository = prestamoRepository;
    }

    public async Task<DashboardDto> ObtenerResumenEjecutivoAsync()
    {
        var todosEquipos = (await _equipoRepository.ObtenerTodosAsync()).ToList();
        var totalPrestamos = await _prestamoRepository.ContarTotalPrestamosAsync();
        var prestamosActivos = await _prestamoRepository.ContarPrestamosActivosAsync();
        var prestamosPendientes = await _prestamoRepository.ContarPrestamosPendientesAsync();
        var prestamosPorAreaDict = await _prestamoRepository.ObtenerPrestamosPorAreaAsync();
        var ultimosPrestamos = (await _prestamoRepository.ObtenerTodosAsync())
            .OrderByDescending(p => p.FechaPrestamo)
            .Take(20)
            .ToList();

        // 1. Cálculo de los 6 KPIs
        var totalEquipos = todosEquipos.Count;
        var equiposDisponibles = todosEquipos.Count(e => e.Estado == "Disponible");
        var equiposPrestados = todosEquipos.Count(e => e.Estado == "Prestado");
        var equiposEnMantenimiento = todosEquipos.Count(e => e.Estado == "En Mantenimiento");
        var equiposDeBaja = todosEquipos.Count(e => e.Estado == "De Baja");

        // KPI 6: Área con mayor uso
        var areaTop = prestamosPorAreaDict.OrderByDescending(kv => kv.Value).FirstOrDefault();
        var areaMayorUso = string.IsNullOrEmpty(areaTop.Key) ? "Sin registros" : areaTop.Key;
        var cantidadAreaMayor = areaTop.Value;

        // Distribución por categoría
        var categorias = todosEquipos
            .GroupBy(e => e.Categoria)
            .Select(g => new CategoriaResumenDto { Categoria = g.Key, Cantidad = g.Count() })
            .OrderByDescending(c => c.Cantidad)
            .ToList();

        // Resumen por área
        var areasResumen = prestamosPorAreaDict
            .Select(kv => new AreaUsoResumenDto
            {
                Area = kv.Key,
                TotalPrestamos = kv.Value,
                PrestamosActivos = 0 // simplificado
            })
            .OrderByDescending(a => a.TotalPrestamos)
            .ToList();

        // Mapear préstamos recientes
        var recientesDto = ultimosPrestamos.Select(p => new PrestamoDto
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            UsuarioNombre = p.Usuario != null ? $"{p.Usuario.Nombres} {p.Usuario.Apellidos}".Trim() : "Desconocido",
            UsuarioCorreo = p.Usuario?.Correo ?? "",
            UsuarioArea = p.Usuario?.Area ?? "",
            EquipoId = p.EquipoId,
            EquipoCodigoPatrimonial = p.Equipo?.CodigoPatrimonial ?? "",
            EquipoNombre = p.Equipo?.Nombre ?? "",
            EquipoCategoria = p.Equipo?.Categoria ?? "",
            EquipoMarca = p.Equipo?.Marca ?? "",
            EquipoModelo = p.Equipo?.Modelo ?? "",
            FechaPrestamo = p.FechaPrestamo,
            FechaEsperadaDevolucion = p.FechaEsperadaDevolucion,
            FechaDevolucion = p.FechaDevolucion,
            EstadoPrestamo = p.EstadoPrestamo,
            MotivoPrestamo = p.MotivoPrestamo ?? string.Empty,
            ObservacionEntrega = p.ObservacionEntrega,
            ObservacionDevolucion = p.ObservacionDevolucion,
            CreadoEn = p.CreadoEn
        }).ToList();

        // RF-15: Equipos más utilizados (Top de mayor demanda por frecuencia de préstamos)
        var todosPrestamos = (await _prestamoRepository.ObtenerTodosAsync()).ToList();
        var masUtilizados = todosPrestamos
            .Where(p => p.Equipo != null)
            .GroupBy(p => new { p.Equipo!.CodigoPatrimonial, p.Equipo.Nombre, p.Equipo.Categoria })
            .Select(g => new EquipoUsoResumenDto
            {
                CodigoPatrimonial = g.Key.CodigoPatrimonial,
                Nombre = g.Key.Nombre,
                Categoria = g.Key.Categoria,
                TotalPrestamos = g.Count()
            })
            .OrderByDescending(e => e.TotalPrestamos)
            .Take(5)
            .ToList();

        return new DashboardDto
        {
            TotalEquipos = totalEquipos,
            EquiposDisponibles = equiposDisponibles,
            EquiposPrestados = equiposPrestados,
            EquiposEnMantenimiento = equiposEnMantenimiento,
            EquiposDeBaja = equiposDeBaja,
            TotalPrestamos = totalPrestamos,
            PrestamosActivos = prestamosActivos,
            PrestamosPendientes = prestamosPendientes,
            AreaConMayorUso = areaMayorUso,
            CantidadPrestamosAreaMayorUso = cantidadAreaMayor,
            EquiposMasUtilizados = masUtilizados,
            DistribucionPorCategoria = categorias,
            PrestamosPorArea = areasResumen,
            PrestamosRecientes = recientesDto
        };
    }
}
