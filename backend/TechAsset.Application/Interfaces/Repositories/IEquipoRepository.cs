using TechAsset.Domain.Entities;

namespace TechAsset.Application.Interfaces.Repositories;

public interface IEquipoRepository
{
    Task<IEnumerable<Equipo>> ObtenerTodosAsync(string? termino = null, string? categoria = null, string? estado = null);
    Task<Equipo?> ObtenerPorIdAsync(Guid id);
    Task<Equipo?> ObtenerPorCodigoPatrimonialAsync(string codigo);
    Task<bool> ExisteCodigoPatrimonialAsync(string codigo, Guid? excluirId = null);
    Task<Equipo> CrearAsync(Equipo equipo);
    Task ActualizarAsync(Equipo equipo);
    Task EliminarAsync(Equipo equipo);
    Task<bool> TieneHistorialPrestamosAsync(Guid equipoId);
    Task RegistrarMovimientoAsync(MovimientoEquipo movimiento);
    Task<IEnumerable<MovimientoEquipo>> ObtenerMovimientosAsync(Guid? equipoId = null, DateTime? desde = null, DateTime? hasta = null);
}
