using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Data;

namespace TechAsset.Infrastructure.Repositories;

public class PrestamoRepository : IPrestamoRepository
{
    private readonly AppDbContext _context;

    public PrestamoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Prestamo>> ObtenerTodosAsync(
        string? termino = null,
        string? estadoPrestamo = null,
        Guid? usuarioId = null,
        string? area = null,
        DateTime? desde = null,
        DateTime? hasta = null)
    {
        var query = _context.Prestamos
            .Include(p => p.Usuario)
            .Include(p => p.Equipo)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(termino))
        {
            var t = termino.Trim().ToLower();
            query = query.Where(p =>
                p.Equipo!.Nombre.ToLower().Contains(t) ||
                p.Equipo.CodigoPatrimonial.ToLower().Contains(t) ||
                p.Usuario!.Nombres.ToLower().Contains(t) ||
                p.Usuario.Apellidos.ToLower().Contains(t) ||
                (p.MotivoPrestamo ?? string.Empty).ToLower().Contains(t));
        }

        if (!string.IsNullOrWhiteSpace(estadoPrestamo))
        {
            var est = estadoPrestamo.Trim().ToLower();
            query = query.Where(p => p.EstadoPrestamo.ToLower() == est);
        }

        if (usuarioId.HasValue)
        {
            query = query.Where(p => p.UsuarioId == usuarioId.Value);
        }

        if (!string.IsNullOrWhiteSpace(area))
        {
            var a = area.Trim().ToLower();
            query = query.Where(p => p.Usuario!.Area.ToLower() == a);
        }

        if (desde.HasValue)
        {
            query = query.Where(p => p.FechaPrestamo >= desde.Value);
        }

        if (hasta.HasValue)
        {
            var fin = hasta.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(p => p.FechaPrestamo <= fin);
        }

        return await query.OrderByDescending(p => p.FechaPrestamo).ToListAsync();
    }

    public async Task<Prestamo?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.Prestamos
            .Include(p => p.Usuario)
            .Include(p => p.Equipo)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Prestamo?> ObtenerPrestamoActivoPorEquipoAsync(Guid equipoId)
    {
        return await _context.Prestamos
            .Include(p => p.Usuario)
            .Include(p => p.Equipo)
            .FirstOrDefaultAsync(p => p.EquipoId == equipoId && (p.EstadoPrestamo == "Activo" || p.EstadoPrestamo == "Aprobado"));
    }

    public async Task<IEnumerable<Prestamo>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        return await _context.Prestamos
            .Include(p => p.Equipo)
            .Where(p => p.UsuarioId == usuarioId)
            .OrderByDescending(p => p.FechaPrestamo)
            .ToListAsync();
    }

    public async Task<Prestamo> CrearAsync(Prestamo prestamo)
    {
        _context.Prestamos.Add(prestamo);
        await _context.SaveChangesAsync();
        return prestamo;
    }

    public async Task ActualizarAsync(Prestamo prestamo)
    {
        _context.Prestamos.Update(prestamo);
        await _context.SaveChangesAsync();
    }

    public async Task<int> ContarTotalPrestamosAsync()
    {
        return await _context.Prestamos.CountAsync();
    }

    public async Task<int> ContarPrestamosActivosAsync()
    {
        return await _context.Prestamos.CountAsync(p => p.EstadoPrestamo == "Activo" || p.EstadoPrestamo == "Aprobado");
    }

    public async Task<int> ContarPrestamosPendientesAsync()
    {
        return await _context.Prestamos.CountAsync(p => p.EstadoPrestamo == "Pendiente");
    }

    public async Task<Dictionary<string, int>> ObtenerPrestamosPorAreaAsync()
    {
        return await _context.Prestamos
            .Include(p => p.Usuario)
            .Where(p => p.Usuario != null)
            .GroupBy(p => p.Usuario!.Area)
            .Select(g => new { Area = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.Area, x => x.Total);
    }
}
