using TechAsset.Application.DTOs;

namespace TechAsset.Application.Interfaces;

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioDto>> ObtenerTodosAsync(bool? soloActivos = null);
    Task<UsuarioDto> ObtenerPorIdAsync(Guid id);
    Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto);
    Task<UsuarioDto> ActualizarAsync(Guid id, ActualizarUsuarioDto dto);
    Task CambiarEstadoAsync(Guid id, bool activo);
}

public interface IEquipoService
{
    Task<IEnumerable<EquipoDto>> ObtenerTodosAsync(FiltroEquipoDto? filtro = null);
    Task<EquipoDto> ObtenerPorIdAsync(Guid id);
    Task<EquipoDto> CrearAsync(CrearEquipoDto dto);
    Task<EquipoDto> ActualizarAsync(Guid id, ActualizarEquipoDto dto);
    Task EliminarAsync(Guid id); // Con validación RN-06
    Task CambiarEstadoAsync(Guid id, string nuevoEstado, string? motivo = null);
    Task<IEnumerable<MovimientoDto>> ObtenerMovimientosAsync(Guid? equipoId = null, DateTime? desde = null, DateTime? hasta = null);
}

public interface IPrestamoService
{
    Task<IEnumerable<PrestamoDto>> ObtenerTodosAsync(FiltroPrestamoDto? filtro = null);
    Task<PrestamoDto> ObtenerPorIdAsync(Guid id);
    Task<IEnumerable<PrestamoDto>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task<PrestamoDto> RegistrarPrestamoAsync(RegistrarPrestamoDto dto);
    Task<PrestamoDto> AprobarPrestamoAsync(Guid id, Guid? aprobadorId = null);
    Task<PrestamoDto> RechazarPrestamoAsync(Guid id, Guid? rechazadorId = null, string? motivo = null);
    Task<PrestamoDto> DevolverPrestamoAsync(Guid prestamoId, DevolverPrestamoDto dto);
}

public interface IDashboardService
{
    Task<DashboardDto> ObtenerResumenEjecutivoAsync();
}

public interface IReporteService
{
    Task<IEnumerable<ReportePrestamosAreaDto>> ObtenerReportePorAreaAsync(DateTime? desde = null, DateTime? hasta = null);
    Task<IEnumerable<PrestamoDto>> ObtenerHistorialCompletoAsync(DateTime? desde, DateTime? hasta, string? categoria);
}
