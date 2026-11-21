using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Data;

namespace TechAsset.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Usuario>> ObtenerTodosAsync(bool? soloActivos = null)
    {
        var query = _context.Usuarios
            .Include(u => u.Prestamos.Where(p => p.EstadoPrestamo == "Activo"))
            .AsNoTracking();

        if (soloActivos.HasValue)
        {
            query = query.Where(u => u.Activo == soloActivos.Value);
        }

        return await query.OrderBy(u => u.Nombres).ThenBy(u => u.Apellidos).ToListAsync();
    }

    public async Task<Usuario?> ObtenerPorIdAsync(Guid id)
    {
        return await _context.Usuarios
            .Include(u => u.Prestamos)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Usuario?> ObtenerPorCorreoAsync(string correo)
    {
        var lower = correo.Trim().ToLowerInvariant();
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo.ToLower() == lower);
    }

    public async Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId = null)
    {
        var lower = correo.Trim().ToLowerInvariant();
        var query = _context.Usuarios.AsNoTracking().Where(u => u.Correo.ToLower() == lower);
        if (excluirId.HasValue)
        {
            query = query.Where(u => u.Id != excluirId.Value);
        }
        return await query.AnyAsync();
    }

    public async Task<Usuario> CrearAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task ActualizarAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }
}
