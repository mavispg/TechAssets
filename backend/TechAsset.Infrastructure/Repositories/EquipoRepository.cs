using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Data;

namespace TechAsset.Infrastructure.Repositories;

public class EquipoRepository : IEquipoRepository
{
    private readonly AppDbContext _context;

    public EquipoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Equipo>> ObtenerTodosAsync(string? termino = null, string? categoria = null, string? estado = null)
    {
        var query = _context.Equipos
            .Include(eq => eq.Prestamos.Where(p => p.EstadoPrestamo == "Activo" || p.EstadoPrestamo == "Aprobado"))
                .ThenInclude(p => p.Usuario)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(termino))
        {
            var t = termino.Trim().ToLower();
            query = query.Where(eq =>
                eq.CodigoPatrimonial.ToLower().Contains(t) ||
                eq.Nombre.ToLower().Contains(t) ||
                eq.Marca.ToLower().Contains(t) ||
                eq.Modelo.ToLower().Contains(t) ||
                eq.NumeroSerie.ToLower().Contains(t));
        }

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            var cat = categoria.Trim().ToLower();
            query = query.Where(eq => eq.Categoria.ToLower() == cat);
        }

        if (!string.IsNullOrWhiteSpace(estado))
        {
            var est = estado.Trim().ToLower();
            query = query.Where(eq => eq.Estado.ToLower() == est);
        }

        return await query.OrderBy(eq => eq.CodigoPatrimonial).ToListAsync();
    }

    public async Task<Equipo?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.Equipos
            .Include(eq => eq.Prestamos.Where(p => p.EstadoPrestamo == "Activo" || p.EstadoPrestamo == "Aprobado"))
                .ThenInclude(p => p.Usuario)
            .FirstOrDefaultAsync(eq => eq.Id == id);
    }

    public async Task<Equipo?> ObtenerPorCodigoPatrimonialAsync(string codigo)
    {
        var upper = codigo.Trim().ToUpperInvariant();
        return await _context.Equipos
            .FirstOrDefaultAsync(eq => eq.CodigoPatrimonial.ToUpper() == upper);
    }

    public async Task<bool> ExisteCodigoPatrimonialAsync(string codigo, Guid? excluirId = null)
    {
        var upper = codigo.Trim().ToUpperInvariant();
        var query = _context.Equipos.AsNoTracking().Where(eq => eq.CodigoPatrimonial.ToUpper() == upper);
        if (excluirId.HasValue)
        {
            query = query.Where(eq => eq.Id != excluirId.Value);
        }
        return await query.AnyAsync();
    }

    public async Task<Equipo> CrearAsync(Equipo equipo)
    {
        _context.Equipos.Add(equipo);
        await _context.SaveChangesAsync();
        return equipo;
    }

    public async Task ActualizarAsync(Equipo equipo)
    {
        _context.Equipos.Update(equipo);
        await _context.SaveChangesAsync();
    }

    public async Task EliminarAsync(Equipo equipo)
    {
        _context.Equipos.Remove(equipo);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> TieneHistorialPrestamosAsync(Guid equipoId)
    {
        return await _context.Prestamos
            .AsNoTracking()
            .AnyAsync(p => p.EquipoId == equipoId);
    }

    public async Task RegistrarMovimientoAsync(MovimientoEquipo movimiento)
    {
        _context.HistorialMovimientos.Add(movimiento);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<MovimientoEquipo>> ObtenerMovimientosAsync(Guid? equipoId = null, DateTime? desde = null, DateTime? hasta = null)
    {
        var q = _context.HistorialMovimientos
            .Include(m => m.Equipo)
            .Include(m => m.Usuario)
            .AsNoTracking();

        if (equipoId.HasValue)
        {
            q = q.Where(m => m.EquipoId == equipoId.Value);
        }

        if (desde.HasValue)
        {
            q = q.Where(m => m.FechaMovimiento >= desde.Value);
        }

        if (hasta.HasValue)
        {
            var fin = hasta.Value.Date.AddDays(1).AddTicks(-1);
            q = q.Where(m => m.FechaMovimiento <= fin);
        }

        return await q.OrderByDescending(m => m.FechaMovimiento).ToListAsync();
    }
}
