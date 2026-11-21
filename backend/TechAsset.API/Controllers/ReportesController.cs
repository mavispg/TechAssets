using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;

namespace TechAsset.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly IReporteService _reporteService;
    private readonly IEquipoService _equipoService;
    private readonly IPrestamoService _prestamoService;
    private readonly IDashboardService _dashboardService;

    public ReportesController(
        IReporteService reporteService,
        IEquipoService equipoService,
        IPrestamoService prestamoService,
        IDashboardService dashboardService)
    {
        _reporteService = reporteService;
        _equipoService = equipoService;
        _prestamoService = prestamoService;
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Sección 1: Indicadores (tarjetas y gráficos: total equipos, disponibles, prestados, mantenimiento, activos, pendientes)
    /// </summary>
    [HttpGet("indicadores")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<DashboardDto>> ObtenerIndicadores()
    {
        var indicadores = await _dashboardService.ObtenerResumenEjecutivoAsync();
        return Ok(indicadores);
    }

    /// <summary>
    /// Sección 2: Consultar equipos disponibles (Acceso permitido para Colaborador, Tech y Admin)
    /// </summary>
    [HttpGet("disponibles")]
    public async Task<ActionResult<IEnumerable<EquipoDto>>> ObtenerEquiposDisponibles([FromQuery] string? termino, [FromQuery] string? categoria)
    {
        var disponibles = await _equipoService.ObtenerTodosAsync(new FiltroEquipoDto
        {
            Estado = "Disponible",
            Termino = termino,
            Categoria = categoria
        });
        return Ok(disponibles);
    }

    /// <summary>
    /// Sección 3: Consultar equipos prestados (Equipo, usuario responsable, fecha préstamo, fecha devolución)
    /// </summary>
    [HttpGet("prestados")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<IEnumerable<PrestamoDto>>> ObtenerEquiposPrestados([FromQuery] string? termino)
    {
        var prestados = await _prestamoService.ObtenerTodosAsync(new FiltroPrestamoDto
        {
            EstadoPrestamo = "Activo",
            Termino = termino
        });
        return Ok(prestados);
    }

    /// <summary>
    /// Sección 4: Consultar préstamos por área con filtro de fechas
    /// </summary>
    [HttpGet("por-area")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<IEnumerable<ReportePrestamosAreaDto>>> ObtenerPorArea([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
    {
        var reporte = await _reporteService.ObtenerReportePorAreaAsync(desde, hasta);
        return Ok(reporte);
    }

    /// <summary>
    /// Sección 5: Consultar movimientos históricos (Bitácora con filtro de fechas)
    /// </summary>
    [HttpGet("movimientos")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<IEnumerable<MovimientoDto>>> ObtenerMovimientos(
        [FromQuery] Guid? equipoId,
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
    {
        var movimientos = await _equipoService.ObtenerMovimientosAsync(equipoId, desde, hasta);
        return Ok(movimientos);
    }

    /// <summary>
    /// Compatibilidad: Historial de préstamos con filtro
    /// </summary>
    [HttpGet("historial")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<IEnumerable<PrestamoDto>>> ObtenerHistorial(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] string? categoria)
    {
        var historial = await _reporteService.ObtenerHistorialCompletoAsync(desde, hasta, categoria);
        return Ok(historial);
    }
}
