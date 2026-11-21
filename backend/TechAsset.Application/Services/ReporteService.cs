using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Interfaces.Repositories;

namespace TechAsset.Application.Services;

public class ReporteService : IReporteService
{
    private readonly IPrestamoRepository _prestamoRepository;

    public ReporteService(IPrestamoRepository prestamoRepository)
    {
        _prestamoRepository = prestamoRepository;
    }

    public async Task<IEnumerable<ReportePrestamosAreaDto>> ObtenerReportePorAreaAsync(DateTime? desde = null, DateTime? hasta = null)
    {
        var prestamos = (await _prestamoRepository.ObtenerTodosAsync(desde: desde, hasta: hasta)).ToList();

        var grupos = prestamos
            .GroupBy(p => p.Usuario?.Area ?? "Sin Área")
            .Select(g => new ReportePrestamosAreaDto
            {
                Area = g.Key,
                TotalPrestamos = g.Count(),
                DetallePrestamos = g.Select(p => new PrestamoDto
                {
                    Id = p.Id,
                    UsuarioId = p.UsuarioId,
                    UsuarioNombre = p.Usuario != null ? $"{p.Usuario.Nombres} {p.Usuario.Apellidos}".Trim() : "",
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
                }).ToList()
            })
            .OrderByDescending(r => r.TotalPrestamos)
            .ToList();

        return grupos;
    }

    public async Task<IEnumerable<PrestamoDto>> ObtenerHistorialCompletoAsync(DateTime? desde, DateTime? hasta, string? categoria)
    {
        var prestamos = await _prestamoRepository.ObtenerTodosAsync(desde: desde, hasta: hasta);

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            var cat = categoria.Trim().ToLower();
            prestamos = prestamos.Where(p => p.Equipo?.Categoria.ToLower() == cat);
        }

        return prestamos.Select(p => new PrestamoDto
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            UsuarioNombre = p.Usuario != null ? $"{p.Usuario.Nombres} {p.Usuario.Apellidos}".Trim() : "",
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
        });
    }
}
