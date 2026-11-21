using TechAsset.Domain.Entities;

namespace TechAsset.Application.Interfaces.Repositories;

public interface IPrestamoRepository
{
    Task<IEnumerable<Prestamo>> ObtenerTodosAsync(
        string? termino = null,
        string? estadoPrestamo = null,
        Guid? usuarioId = null,
        string? area = null,
        DateTime? desde = null,
        DateTime? hasta = null);

    Task<Prestamo?> ObtenerPorIdAsync(Guid id);
    Task<Prestamo?> ObtenerPrestamoActivoPorEquipoAsync(Guid equipoId);
    Task<IEnumerable<Prestamo>> ObtenerPorUsuarioAsync(Guid usuarioId);
    Task<Prestamo> CrearAsync(Prestamo prestamo);
    Task ActualizarAsync(Prestamo prestamo);
    Task<int> ContarTotalPrestamosAsync();
    Task<int> ContarPrestamosActivosAsync();
    Task<int> ContarPrestamosPendientesAsync();
    Task<Dictionary<string, int>> ObtenerPrestamosPorAreaAsync();
}
