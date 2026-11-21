using TechAsset.Application.Common;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Exceptions;

namespace TechAsset.Application.Services;

public class EquipoService : IEquipoService
{
    private readonly IEquipoRepository _equipoRepository;

    public EquipoService(IEquipoRepository equipoRepository)
    {
        _equipoRepository = equipoRepository;
    }

    public async Task<IEnumerable<EquipoDto>> ObtenerTodosAsync(FiltroEquipoDto? filtro = null)
    {
        var equipos = await _equipoRepository.ObtenerTodosAsync(
            filtro?.Termino,
            filtro?.Categoria,
            filtro?.Estado);

        return equipos.Select(MapearADto);
    }

    public async Task<EquipoDto> ObtenerPorIdAsync(Guid id)
    {
        var equipo = await _equipoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Equipo", id);

        return MapearADto(equipo);
    }

    public async Task<EquipoDto> CrearAsync(CrearEquipoDto dto)
    {
        // 1. Validaciones de entrada (S5-S6)
        var codigo = ValidadorEntrada.ValidarTextoObligatorio(dto.CodigoPatrimonial, "Código Patrimonial", 4, 50).ToUpperInvariant();
        var nombre = ValidadorEntrada.ValidarTextoObligatorio(dto.Nombre, "Nombre del Equipo", 3, 150);
        var categoria = ValidadorEntrada.ValidarTextoObligatorio(dto.Categoria, "Categoría", 2, 80);
        var marca = ValidadorEntrada.ValidarTextoObligatorio(dto.Marca, "Marca", 2, 80);
        var modelo = ValidadorEntrada.ValidarTextoObligatorio(dto.Modelo, "Modelo", 2, 80);
        var serie = ValidadorEntrada.ValidarTextoObligatorio(dto.NumeroSerie, "Número de Serie", 2, 80);

        // 2. Regla RN-07: Código patrimonial único
        if (await _equipoRepository.ExisteCodigoPatrimonialAsync(codigo))
        {
            throw new ReglaNegocioException("RN-07", $"Ya existe un equipo registrado con el código patrimonial '{codigo}'.");
        }

        var nuevo = new Equipo
        {
            CodigoPatrimonial = codigo,
            Nombre = nombre,
            Categoria = categoria,
            Marca = marca,
            Modelo = modelo,
            NumeroSerie = serie,
            Estado = string.IsNullOrWhiteSpace(dto.Estado) ? "Disponible" : dto.Estado.Trim(),
            ObservacionesTecnicas = dto.ObservacionesTecnicas?.Trim()
        };

        var creado = await _equipoRepository.CrearAsync(nuevo);
        return MapearADto(creado);
    }

    public async Task<EquipoDto> ActualizarAsync(Guid id, ActualizarEquipoDto dto)
    {
        var equipo = await _equipoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Equipo", id);

        equipo.Nombre = ValidadorEntrada.ValidarTextoObligatorio(dto.Nombre, "Nombre del Equipo", 3, 150);
        equipo.Categoria = ValidadorEntrada.ValidarTextoObligatorio(dto.Categoria, "Categoría", 2, 80);
        equipo.Marca = ValidadorEntrada.ValidarTextoObligatorio(dto.Marca, "Marca", 2, 80);
        equipo.Modelo = ValidadorEntrada.ValidarTextoObligatorio(dto.Modelo, "Modelo", 2, 80);
        equipo.NumeroSerie = ValidadorEntrada.ValidarTextoObligatorio(dto.NumeroSerie, "Número de Serie", 2, 80);
        equipo.Estado = string.IsNullOrWhiteSpace(dto.Estado) ? equipo.Estado : dto.Estado.Trim();
        equipo.ObservacionesTecnicas = dto.ObservacionesTecnicas?.Trim();

        await _equipoRepository.ActualizarAsync(equipo);
        return MapearADto(equipo);
    }

    public async Task EliminarAsync(Guid id)
    {
        var equipo = await _equipoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Equipo", id);

        // Regla RN-06: No se puede eliminar si tiene historial de préstamos (Integridad referencial)
        if (await _equipoRepository.TieneHistorialPrestamosAsync(id))
        {
            throw new ReglaNegocioException("RN-06", $"El equipo '{equipo.CodigoPatrimonial}' tiene historial de préstamos registrado y no puede ser eliminado. Si ya no está operativo, debe pasarse al estado 'De Baja'.");
        }

        await _equipoRepository.EliminarAsync(equipo);
    }

    public async Task CambiarEstadoAsync(Guid id, string nuevoEstado, string? motivo = null)
    {
        var equipo = await _equipoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Equipo", id);

        var estadoNormalizado = nuevoEstado.Trim();
        if (estadoNormalizado.Equals("En mantenimiento", StringComparison.OrdinalIgnoreCase))
            estadoNormalizado = "En Mantenimiento";
        else if (estadoNormalizado.Equals("Dado de baja", StringComparison.OrdinalIgnoreCase) || estadoNormalizado.Equals("De baja", StringComparison.OrdinalIgnoreCase))
            estadoNormalizado = "De Baja";

        if (estadoNormalizado != "Disponible" && estadoNormalizado != "Prestado" &&
            estadoNormalizado != "En Mantenimiento" && estadoNormalizado != "De Baja")
        {
            throw new ArgumentException($"El estado '{nuevoEstado}' no es válido.", nameof(nuevoEstado));
        }

        var estadoAnterior = equipo.Estado;
        equipo.Estado = estadoNormalizado;
        if (!string.IsNullOrWhiteSpace(motivo))
        {
            equipo.ObservacionesTecnicas = $"{equipo.ObservacionesTecnicas} | [{DateTime.UtcNow:yyyy-MM-dd}] Cambio a {estadoNormalizado}: {motivo.Trim()}".Trim(' ', '|');
        }

        await _equipoRepository.ActualizarAsync(equipo);

        // Registrar trazabilidad de movimiento (Parte B6)
        await _equipoRepository.RegistrarMovimientoAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            TipoMovimiento = "CambioEstado",
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = estadoNormalizado,
            Motivo = motivo?.Trim(),
            FechaMovimiento = DateTime.UtcNow
        });
    }

    public async Task<IEnumerable<MovimientoDto>> ObtenerMovimientosAsync(Guid? equipoId = null, DateTime? desde = null, DateTime? hasta = null)
    {
        var movimientos = await _equipoRepository.ObtenerMovimientosAsync(equipoId, desde, hasta);
        return movimientos.Select(m => new MovimientoDto
        {
            Id = m.Id,
            EquipoId = m.EquipoId,
            EquipoCodigoPatrimonial = m.Equipo?.CodigoPatrimonial ?? "",
            EquipoNombre = m.Equipo?.Nombre ?? "",
            UsuarioId = m.UsuarioId,
            UsuarioNombre = m.Usuario != null ? $"{m.Usuario.Nombres} {m.Usuario.Apellidos}".Trim() : null,
            TipoMovimiento = m.TipoMovimiento,
            EstadoAnterior = m.EstadoAnterior,
            EstadoNuevo = m.EstadoNuevo,
            Motivo = m.Motivo,
            FechaMovimiento = m.FechaMovimiento
        });
    }

    private static EquipoDto MapearADto(Equipo eq)
    {
        var prestamoActivo = eq.Prestamos?.FirstOrDefault(p => p.EstadoPrestamo == "Activo" || p.EstadoPrestamo == "Aprobado");

        return new EquipoDto
        {
            Id = eq.Id,
            CodigoPatrimonial = eq.CodigoPatrimonial,
            Nombre = eq.Nombre,
            Categoria = eq.Categoria,
            Marca = eq.Marca,
            Modelo = eq.Modelo,
            NumeroSerie = eq.NumeroSerie,
            Estado = eq.Estado,
            ObservacionesTecnicas = eq.ObservacionesTecnicas,
            CreadoEn = eq.CreadoEn,
            PrestamoActualId = prestamoActivo?.Id,
            UsuarioActualNombre = prestamoActivo?.Usuario != null ? $"{prestamoActivo.Usuario.Nombres} {prestamoActivo.Usuario.Apellidos}".Trim() : null,
            UsuarioActualArea = prestamoActivo?.Usuario?.Area,
            FechaEsperadaDevolucion = prestamoActivo?.FechaEsperadaDevolucion
        };
    }
}
