using TechAsset.Application.Common;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Exceptions;

namespace TechAsset.Application.Services;

public class PrestamoService : IPrestamoService
{
    private readonly IPrestamoRepository _prestamoRepository;
    private readonly IEquipoRepository _equipoRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public PrestamoService(
        IPrestamoRepository prestamoRepository,
        IEquipoRepository equipoRepository,
        IUsuarioRepository usuarioRepository)
    {
        _prestamoRepository = prestamoRepository;
        _equipoRepository = equipoRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<PrestamoDto>> ObtenerTodosAsync(FiltroPrestamoDto? filtro = null)
    {
        var prestamos = await _prestamoRepository.ObtenerTodosAsync(
            filtro?.Termino,
            filtro?.EstadoPrestamo,
            filtro?.UsuarioId,
            filtro?.Area,
            filtro?.Desde,
            filtro?.Hasta);

        return prestamos.Select(MapearADto);
    }

    public async Task<PrestamoDto> ObtenerPorIdAsync(Guid id)
    {
        var prestamo = await _prestamoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Préstamo", id);

        return MapearADto(prestamo);
    }

    public async Task<IEnumerable<PrestamoDto>> ObtenerPorUsuarioAsync(Guid usuarioId)
    {
        var prestamos = await _prestamoRepository.ObtenerPorUsuarioAsync(usuarioId);
        return prestamos.Select(MapearADto);
    }

    public async Task<PrestamoDto> RegistrarPrestamoAsync(RegistrarPrestamoDto dto)
    {
        var fechaPrestamo = dto.FechaPrestamo ?? DateTime.UtcNow;

        // RN-04: Fecha esperada de devolución posterior o igual a la fecha de préstamo
        ValidadorEntrada.ValidarRangoFechas(fechaPrestamo.Date, dto.FechaEsperadaDevolucion.Date, "Fecha de devolución");

        // 2. Validación de Usuario Responsable (RN-05)
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(dto.UsuarioId)
            ?? throw new RecursoNoEncontradoException("Usuario", dto.UsuarioId);

        if (!usuario.Activo)
        {
            throw new ReglaNegocioException("RN-05", $"El colaborador '{usuario.NombreCompleto}' se encuentra inactivo y no puede recibir préstamos.");
        }

        // 3. Validación de Equipo y Disponibilidad (RN-01, RN-02, RN-03)
        var equipo = await _equipoRepository.ObtenerPorIdAsync(dto.EquipoId)
            ?? throw new RecursoNoEncontradoException("Equipo", dto.EquipoId);

        ValidarDisponibilidadEquipo(equipo);

        var observaciones = dto.Observaciones ?? dto.ObservacionEntrega ?? dto.MotivoPrestamo;
        var motivo = !string.IsNullOrWhiteSpace(dto.MotivoPrestamo)
            ? dto.MotivoPrestamo.Trim()
            : (!string.IsNullOrWhiteSpace(observaciones) ? observaciones.Trim() : "Solicitud de equipo tecnológico");

        // 4. Toda solicitud nace con estado 'Pendiente' (el equipo permanece 'Disponible' hasta la aprobación)
        var nuevoPrestamo = new Prestamo
        {
            UsuarioId = usuario.Id,
            EquipoId = equipo.Id,
            FechaPrestamo = fechaPrestamo,
            FechaEsperadaDevolucion = dto.FechaEsperadaDevolucion,
            EstadoPrestamo = "Pendiente",
            MotivoPrestamo = motivo,
            ObservacionEntrega = observaciones?.Trim()
        };

        var creado = await _prestamoRepository.CrearAsync(nuevoPrestamo);
        creado.Usuario = usuario;
        creado.Equipo = equipo;

        return MapearADto(creado);
    }

    public async Task<PrestamoDto> AprobarPrestamoAsync(Guid id, Guid? aprobadorId = null)
    {
        var prestamo = await _prestamoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Préstamo", id);

        if (prestamo.EstadoPrestamo != "Pendiente")
        {
            throw new ReglaNegocioException("RN-APROBACION", $"Solo se pueden aprobar préstamos en estado Pendiente (estado actual: {prestamo.EstadoPrestamo}).");
        }

        var equipo = await _equipoRepository.ObtenerPorIdAsync(prestamo.EquipoId)
            ?? throw new RecursoNoEncontradoException("Equipo", prestamo.EquipoId);

        ValidarDisponibilidadEquipo(equipo);

        prestamo.EstadoPrestamo = "Activo";
        await _prestamoRepository.ActualizarAsync(prestamo);

        var estadoAnterior = equipo.Estado;
        equipo.Estado = "Prestado";
        await _equipoRepository.ActualizarAsync(equipo);

        await _equipoRepository.RegistrarMovimientoAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioId = prestamo.UsuarioId,
            TipoMovimiento = "Prestamo",
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = "Prestado",
            Motivo = $"Préstamo aprobado: {prestamo.MotivoPrestamo}",
            FechaMovimiento = DateTime.UtcNow
        });

        return MapearADto(prestamo);
    }

    public async Task<PrestamoDto> RechazarPrestamoAsync(Guid id, Guid? rechazadorId = null, string? motivo = null)
    {
        var prestamo = await _prestamoRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Préstamo", id);

        if (prestamo.EstadoPrestamo != "Pendiente")
        {
            throw new ReglaNegocioException("RN-RECHAZO", $"Solo se pueden rechazar préstamos en estado Pendiente (estado actual: {prestamo.EstadoPrestamo}).");
        }

        prestamo.EstadoPrestamo = "Rechazado";
        if (!string.IsNullOrWhiteSpace(motivo))
        {
            prestamo.ObservacionDevolucion = $"Rechazado: {motivo.Trim()}";
        }
        await _prestamoRepository.ActualizarAsync(prestamo);

        var equipo = await _equipoRepository.ObtenerPorIdAsync(prestamo.EquipoId);
        if (equipo != null && equipo.Estado != "Prestado")
        {
            equipo.Estado = "Disponible";
            await _equipoRepository.ActualizarAsync(equipo);
        }

        return MapearADto(prestamo);
    }

    public async Task<PrestamoDto> DevolverPrestamoAsync(Guid prestamoId, DevolverPrestamoDto dto)
    {
        var prestamo = await _prestamoRepository.ObtenerPorIdAsync(prestamoId)
            ?? throw new RecursoNoEncontradoException("Préstamo", prestamoId);

        if (prestamo.EstadoPrestamo != "Activo" && prestamo.EstadoPrestamo != "Aprobado")
        {
            throw new ReglaNegocioException("RN-ESTADO", "Solo se pueden registrar devoluciones de préstamos activos.");
        }

        // RN-10: Observaciones obligatorias al registrar la devolución
        var observacion = ValidadorEntrada.ValidarTextoObligatorio(
            dto.ObservacionDevolucion,
            "Observación de devolución",
            5,
            500);

        var ahora = DateTime.UtcNow;
        prestamo.FechaDevolucion = ahora;
        prestamo.EstadoPrestamo = "Devuelto";
        prestamo.ObservacionDevolucion = observacion;

        // Actualizar el estado del equipo
        var equipo = await _equipoRepository.ObtenerPorIdAsync(prestamo.EquipoId);
        if (equipo != null)
        {
            var estadoAnterior = equipo.Estado;
            var nuevoEstado = string.Equals(dto.NuevoEstadoEquipo, "En Mantenimiento", StringComparison.OrdinalIgnoreCase)
                ? "En Mantenimiento"
                : "Disponible";

            equipo.Estado = nuevoEstado;
            equipo.ObservacionesTecnicas = $"Devuelto el {ahora:yyyy-MM-dd HH:mm}: {observacion}";
            await _equipoRepository.ActualizarAsync(equipo);

            await _equipoRepository.RegistrarMovimientoAsync(new MovimientoEquipo
            {
                EquipoId = equipo.Id,
                UsuarioId = prestamo.UsuarioId,
                TipoMovimiento = "Devolucion",
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = nuevoEstado,
                Motivo = observacion,
                FechaMovimiento = ahora
            });
        }

        await _prestamoRepository.ActualizarAsync(prestamo);
        return MapearADto(prestamo);
    }

    private static void ValidarDisponibilidadEquipo(Equipo equipo)
    {
        if (equipo.Estado == "Prestado")
        {
            throw new ReglaNegocioException("RN-01", $"El equipo '{equipo.CodigoPatrimonial} - {equipo.Nombre}' ya cuenta con un préstamo activo.");
        }

        if (equipo.Estado == "En Mantenimiento")
        {
            throw new ReglaNegocioException("RN-02", $"El equipo '{equipo.CodigoPatrimonial}' está en mantenimiento y no puede ser asignado.");
        }

        if (equipo.Estado == "De Baja")
        {
            throw new ReglaNegocioException("RN-03", $"El equipo '{equipo.CodigoPatrimonial}' ha sido dado de baja definitivamente.");
        }
    }

    private static PrestamoDto MapearADto(Prestamo p)
    {
        return new PrestamoDto
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            UsuarioNombre = p.Usuario != null ? $"{p.Usuario.Nombres} {p.Usuario.Apellidos}".Trim() : "Desconocido",
            UsuarioCorreo = p.Usuario?.Correo ?? string.Empty,
            UsuarioArea = p.Usuario?.Area ?? string.Empty,
            EquipoId = p.EquipoId,
            EquipoCodigoPatrimonial = p.Equipo?.CodigoPatrimonial ?? string.Empty,
            EquipoNombre = p.Equipo?.Nombre ?? string.Empty,
            EquipoCategoria = p.Equipo?.Categoria ?? string.Empty,
            EquipoMarca = p.Equipo?.Marca ?? string.Empty,
            EquipoModelo = p.Equipo?.Modelo ?? string.Empty,
            FechaPrestamo = p.FechaPrestamo,
            FechaEsperadaDevolucion = p.FechaEsperadaDevolucion,
            FechaDevolucion = p.FechaDevolucion,
            EstadoPrestamo = p.EstadoPrestamo,
            MotivoPrestamo = p.MotivoPrestamo ?? string.Empty,
            ObservacionEntrega = p.ObservacionEntrega,
            ObservacionDevolucion = p.ObservacionDevolucion,
            CreadoEn = p.CreadoEn
        };
    }
}
