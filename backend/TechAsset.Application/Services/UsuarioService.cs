using TechAsset.Application.Common;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Exceptions;
using BCrypt.Net;

namespace TechAsset.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<UsuarioDto>> ObtenerTodosAsync(bool? soloActivos = null)
    {
        var usuarios = await _usuarioRepository.ObtenerTodosAsync(soloActivos);
        return usuarios.Select(MapearADto);
    }

    public async Task<UsuarioDto> ObtenerPorIdAsync(Guid id)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Usuario", id);

        return MapearADto(usuario);
    }

    public async Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto)
    {
        // 1. Validaciones en capa de Aplicación (S5-S6 completitud y exactitud)
        var nombres = ValidadorEntrada.ValidarTextoObligatorio(dto.Nombres, "Nombres", 2, 100);
        var apellidos = ValidadorEntrada.ValidarTextoObligatorio(dto.Apellidos, "Apellidos", 2, 100);
        var correo = ValidadorEntrada.ValidarCorreo(dto.Correo);
        var area = ValidadorEntrada.ValidarTextoObligatorio(dto.Area, "Área", 2, 80);
        var rol = string.IsNullOrWhiteSpace(dto.Rol) ? "Colaborador" : dto.Rol.Trim();

        // 2. Regla de Negocio RN-08: Correo electrónico único
        if (await _usuarioRepository.ExisteCorreoAsync(correo))
        {
            throw new ReglaNegocioException("RN-08", $"Ya existe un usuario registrado con el correo '{correo}'.");
        }

        // La persona administradora define la contraseña inicial; solo se guarda su hash.
        var passwordPlano = ValidadorEntrada.ValidarContrasena(dto.PasswordInicial);

        var nuevo = new Usuario
        {
            Nombres = nombres,
            Apellidos = apellidos,
            Correo = correo,
            Area = area,
            Rol = rol,
            Activo = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordPlano, workFactor: 10)
        };

        var creado = await _usuarioRepository.CrearAsync(nuevo);
        return MapearADto(creado);
    }

    public async Task<UsuarioDto> ActualizarAsync(Guid id, ActualizarUsuarioDto dto)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Usuario", id);

        usuario.Nombres = ValidadorEntrada.ValidarTextoObligatorio(dto.Nombres, "Nombres", 2, 100);
        usuario.Apellidos = ValidadorEntrada.ValidarTextoObligatorio(dto.Apellidos, "Apellidos", 2, 100);
        usuario.Area = ValidadorEntrada.ValidarTextoObligatorio(dto.Area, "Área", 2, 80);
        usuario.Rol = string.IsNullOrWhiteSpace(dto.Rol) ? usuario.Rol : dto.Rol.Trim();
        usuario.Activo = dto.Activo;

        await _usuarioRepository.ActualizarAsync(usuario);
        return MapearADto(usuario);
    }

    public async Task CambiarEstadoAsync(Guid id, bool activo)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id)
            ?? throw new RecursoNoEncontradoException("Usuario", id);

        // RN-09: Solo administrador deshabilita (la política se refuerza en controlador/servicio)
        usuario.Activo = activo;
        await _usuarioRepository.ActualizarAsync(usuario);
    }

    private static UsuarioDto MapearADto(Usuario u)
    {
        return new UsuarioDto
        {
            Id = u.Id,
            Nombres = u.Nombres,
            Apellidos = u.Apellidos,
            Correo = u.Correo,
            Area = u.Area,
            Rol = u.Rol,
            Activo = u.Activo,
            CreadoEn = u.CreadoEn,
            PrestamosActivosCount = u.Prestamos.Count(p => p.EstadoPrestamo == "Activo")
        };
    }
}
