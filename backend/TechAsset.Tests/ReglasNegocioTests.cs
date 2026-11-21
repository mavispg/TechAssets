using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TechAsset.API.Controllers;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Application.Services;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Exceptions;
using TechAsset.Infrastructure.Data;

namespace TechAsset.Tests;

public class ReglasNegocioTests
{
    [Theory]
    [InlineData("Prestado", "RN-01")]
    [InlineData("En Mantenimiento", "RN-02")]
    [InlineData("De Baja", "RN-03")]
    public async Task Prestamo_RechazaEquipoNoDisponible(string estado, string regla)
    {
        var equipo = new Equipo { Id = Guid.NewGuid(), Estado = estado, CodigoPatrimonial = "EQ-1", Nombre = "Equipo" };
        var usuario = new Usuario { Id = Guid.NewGuid(), Activo = true };
        var servicio = CrearServicio(equipo, usuario);
        var ex = await Assert.ThrowsAsync<ReglaNegocioException>(() => servicio.RegistrarPrestamoAsync(new RegistrarPrestamoDto { UsuarioId = usuario.Id, EquipoId = equipo.Id, FechaEsperadaDevolucion = DateTime.UtcNow.AddDays(1), MotivoPrestamo = "Trabajo" }));
        Assert.Equal(regla, ex.CodigoRegla);
    }

    [Fact]
    public async Task Prestamo_RechazaFechaAnterior()
    {
        var servicio = CrearServicio(new Equipo { Estado = "Disponible" }, new Usuario { Activo = true });
        await Assert.ThrowsAsync<ReglaNegocioException>(() => servicio.RegistrarPrestamoAsync(new RegistrarPrestamoDto { FechaEsperadaDevolucion = DateTime.UtcNow.AddDays(-1), MotivoPrestamo = "Trabajo" }));
    }

    [Fact]
    public async Task Equipo_RechazaCodigoDuplicado()
    {
        var repo = new EquipoFalso { CodigoDuplicado = true };
        var servicio = new EquipoService(repo);
        await Assert.ThrowsAsync<ReglaNegocioException>(() => servicio.CrearAsync(new CrearEquipoDto { CodigoPatrimonial = "EQ-01", Nombre = "Laptop", Categoria = "Laptop", Marca = "Dell", Modelo = "X1", NumeroSerie = "SER-1" }));
    }

    [Fact]
    public async Task Equipo_NoSeEliminaConHistorial()
    {
        var repo = new EquipoFalso { Equipo = new Equipo { Id = Guid.NewGuid(), CodigoPatrimonial = "EQ-01" }, TieneHistorial = true };
        await Assert.ThrowsAsync<ReglaNegocioException>(() => new EquipoService(repo).EliminarAsync(repo.Equipo.Id));
    }

    [Fact]
    public async Task Usuario_RechazaCorreoDuplicado()
    {
        var servicio = new UsuarioService(new UsuarioFalso { CorreoDuplicado = true });
        var ex = await Assert.ThrowsAsync<ReglaNegocioException>(() => servicio.CrearAsync(new CrearUsuarioDto { Nombres = "Ana", Apellidos = "Torres", Correo = "ana@empresa.pe", Area = "Tecnología", Rol = "Colaborador" }));
        Assert.Equal("RN-08", ex.CodigoRegla);
    }

    [Fact]
    public async Task Devolucion_RequiereObservacion()
    {
        var equipo = new Equipo { Id = Guid.NewGuid(), Estado = "Prestado" };
        var prestamo = new Prestamo { Id = Guid.NewGuid(), EstadoPrestamo = "Activo", EquipoId = equipo.Id, Equipo = equipo, Usuario = new Usuario() };
        var servicio = new PrestamoService(new PrestamoFalso { Prestamo = prestamo }, new EquipoFalso { Equipo = equipo }, new UsuarioFalso());
        await Assert.ThrowsAsync<ArgumentException>(() => servicio.DevolverPrestamoAsync(prestamo.Id, new DevolverPrestamoDto { ObservacionDevolucion = "no" }));
    }

    [Fact]
    public void SoloAdministradorPuedeAdministrarUsuarios()
    {
        var method = typeof(UsuariosController).GetMethod(nameof(UsuariosController.CambiarEstado));
        var auth = Assert.Single(method!.GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());
        Assert.Equal("Administrador", auth.Roles);
    }

    [Fact]
    public async Task Login_CredencialesCorrectasEntregaToken()
    {
        await using var db = CrearDbConUsuario(activo: true);
        var result = await CrearAuth(db).Login(new LoginRequest("ana@empresa.pe", "Prueba2026!"));
        Assert.IsType<Microsoft.AspNetCore.Mvc.OkObjectResult>(result);
    }

    [Fact]
    public async Task Login_ContrasenaIncorrectaSeRechaza()
    {
        await using var db = CrearDbConUsuario(activo: true);
        var result = await CrearAuth(db).Login(new LoginRequest("ana@empresa.pe", "incorrecta"));
        Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_UsuarioDeshabilitadoSeRechaza()
    {
        await using var db = CrearDbConUsuario(activo: false);
        var result = await CrearAuth(db).Login(new LoginRequest("ana@empresa.pe", "Prueba2026!"));
        Assert.IsType<Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult>(result);
    }

    private static AppDbContext CrearDbConUsuario(bool activo)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        var db = new AppDbContext(options);
        db.Usuarios.Add(new Usuario { Nombres = "Ana", Apellidos = "Torres", Correo = "ana@empresa.pe", Area = "TI", Rol = "Colaborador", Activo = activo, PasswordHash = BCrypt.Net.BCrypt.HashPassword("Prueba2026!") });
        db.SaveChanges();
        return db;
    }

    private static AuthController CrearAuth(AppDbContext db)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:Key"] = "Clave-De-Pruebas-TechAsset-2026-Longitud-Suficiente", ["Jwt:Issuer"] = "TechAsset", ["Jwt:Audience"] = "Pruebas", ["Jwt:HorasValidez"] = "8" }).Build();
        return new AuthController(db, config);
    }

    private static PrestamoService CrearServicio(Equipo equipo, Usuario usuario) => new(new PrestamoFalso(), new EquipoFalso { Equipo = equipo }, new UsuarioFalso { Usuario = usuario });

    private sealed class EquipoFalso : IEquipoRepository
    {
        public Equipo? Equipo { get; set; } public bool CodigoDuplicado { get; set; } public bool TieneHistorial { get; set; }
        public Task<IEnumerable<Equipo>> ObtenerTodosAsync(string? termino = null, string? categoria = null, string? estado = null) => Task.FromResult<IEnumerable<Equipo>>(Equipo is null ? [] : [Equipo]);
        public Task<Equipo?> ObtenerPorIdAsync(Guid id) => Task.FromResult(Equipo?.Id == id ? Equipo : null);
        public Task<Equipo?> ObtenerPorCodigoPatrimonialAsync(string codigo) => Task.FromResult<Equipo?>(null);
        public Task<bool> ExisteCodigoPatrimonialAsync(string codigo, Guid? excluirId = null) => Task.FromResult(CodigoDuplicado);
        public Task<Equipo> CrearAsync(Equipo equipo) => Task.FromResult(equipo);
        public Task ActualizarAsync(Equipo equipo) => Task.CompletedTask;
        public Task EliminarAsync(Equipo equipo) => Task.CompletedTask;
        public Task<bool> TieneHistorialPrestamosAsync(Guid equipoId) => Task.FromResult(TieneHistorial);
        public Task RegistrarMovimientoAsync(MovimientoEquipo movimiento) => Task.CompletedTask;
        public Task<IEnumerable<MovimientoEquipo>> ObtenerMovimientosAsync(Guid? equipoId = null, DateTime? desde = null, DateTime? hasta = null) => Task.FromResult<IEnumerable<MovimientoEquipo>>([]);
    }
    private sealed class UsuarioFalso : IUsuarioRepository
    {
        public Usuario? Usuario { get; set; }
        public Task<IEnumerable<Usuario>> ObtenerTodosAsync(bool? soloActivos = null) => Task.FromResult<IEnumerable<Usuario>>([]);
        public Task<Usuario?> ObtenerPorIdAsync(Guid id) => Task.FromResult(Usuario?.Id == id ? Usuario : null);
        public Task<Usuario?> ObtenerPorCorreoAsync(string correo) => Task.FromResult<Usuario?>(null);
        public bool CorreoDuplicado { get; set; }
        public Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId = null) => Task.FromResult(CorreoDuplicado);
        public Task<Usuario> CrearAsync(Usuario usuario) => Task.FromResult(usuario);
        public Task ActualizarAsync(Usuario usuario) => Task.CompletedTask;
    }
    private sealed class PrestamoFalso : IPrestamoRepository
    {
        public Prestamo? Prestamo { get; set; }
        public Task<IEnumerable<Prestamo>> ObtenerTodosAsync(string? termino = null, string? estadoPrestamo = null, Guid? usuarioId = null, string? area = null, DateTime? desde = null, DateTime? hasta = null) => Task.FromResult<IEnumerable<Prestamo>>([]);
        public Task<Prestamo?> ObtenerPorIdAsync(Guid id) => Task.FromResult(Prestamo?.Id == id ? Prestamo : null);
        public Task<Prestamo?> ObtenerPrestamoActivoPorEquipoAsync(Guid equipoId) => Task.FromResult<Prestamo?>(null);
        public Task<IEnumerable<Prestamo>> ObtenerPorUsuarioAsync(Guid usuarioId) => Task.FromResult<IEnumerable<Prestamo>>([]);
        public Task<Prestamo> CrearAsync(Prestamo prestamo) => Task.FromResult(prestamo);
        public Task ActualizarAsync(Prestamo prestamo) => Task.CompletedTask;
        public Task<int> ContarTotalPrestamosAsync() => Task.FromResult(0);
        public Task<int> ContarPrestamosActivosAsync() => Task.FromResult(0);
        public Task<int> ContarPrestamosPendientesAsync() => Task.FromResult(0);
        public Task<Dictionary<string, int>> ObtenerPrestamosPorAreaAsync() => Task.FromResult(new Dictionary<string, int>());
    }
}
