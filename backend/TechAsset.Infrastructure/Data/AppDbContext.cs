using Microsoft.EntityFrameworkCore;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Equipo> Equipos => Set<Equipo>();
    public DbSet<Prestamo> Prestamos => Set<Prestamo>();
    public DbSet<MovimientoEquipo> HistorialMovimientos => Set<MovimientoEquipo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigurarUsuario(modelBuilder);
        ConfigurarEquipo(modelBuilder);
        ConfigurarPrestamo(modelBuilder);
        ConfigurarHistorialMovimientos(modelBuilder);
    }

    private static void ConfigurarUsuario(ModelBuilder modelBuilder)
    {
        var e = modelBuilder.Entity<Usuario>();
        e.ToTable("usuarios");
        e.HasKey(u => u.Id);

        e.Property(u => u.Id).HasColumnName("id");
        e.Property(u => u.Nombres).HasColumnName("nombres").HasMaxLength(100).IsRequired();
        e.Property(u => u.Apellidos).HasColumnName("apellidos").HasMaxLength(100).IsRequired();
        e.Property(u => u.Correo).HasColumnName("correo").HasMaxLength(150).IsRequired();
        e.Property(u => u.Area).HasColumnName("area").HasMaxLength(80).IsRequired();
        e.Property(u => u.Rol).HasColumnName("rol").HasMaxLength(50).IsRequired();
        e.Property(u => u.Activo).HasColumnName("activo").IsRequired().HasDefaultValue(true);
        e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(200).IsRequired();
        e.Property(u => u.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamptz").HasDefaultValueSql("CURRENT_TIMESTAMP");

        e.HasIndex(u => u.Correo).IsUnique();
    }

    private static void ConfigurarEquipo(ModelBuilder modelBuilder)
    {
        var e = modelBuilder.Entity<Equipo>();
        e.ToTable("equipos");
        e.HasKey(eq => eq.Id);

        e.Property(eq => eq.Id).HasColumnName("id");
        e.Property(eq => eq.CodigoPatrimonial).HasColumnName("codigo_patrimonial").HasMaxLength(50).IsRequired();
        e.Property(eq => eq.Nombre).HasColumnName("nombre").HasMaxLength(150).IsRequired();
        e.Property(eq => eq.Categoria).HasColumnName("categoria").HasMaxLength(80).IsRequired();
        e.Property(eq => eq.Marca).HasColumnName("marca").HasMaxLength(80).IsRequired();
        e.Property(eq => eq.Modelo).HasColumnName("modelo").HasMaxLength(80).IsRequired();
        e.Property(eq => eq.NumeroSerie).HasColumnName("numero_serie").HasMaxLength(80).IsRequired();
        e.Property(eq => eq.Estado).HasColumnName("estado").HasMaxLength(30).IsRequired().HasDefaultValue("Disponible");
        e.Property(eq => eq.ObservacionesTecnicas).HasColumnName("observaciones_tecnicas");
        e.Property(eq => eq.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamptz").HasDefaultValueSql("CURRENT_TIMESTAMP");

        e.HasIndex(eq => eq.CodigoPatrimonial).IsUnique();
        e.HasIndex(eq => eq.Estado);
        e.HasIndex(eq => eq.Categoria);
    }

    private static void ConfigurarPrestamo(ModelBuilder modelBuilder)
    {
        var e = modelBuilder.Entity<Prestamo>();
        e.ToTable("prestamos");
        e.HasKey(p => p.Id);

        e.Property(p => p.Id).HasColumnName("id");
        e.Property(p => p.UsuarioId).HasColumnName("usuario_id").IsRequired();
        e.Property(p => p.EquipoId).HasColumnName("equipo_id").IsRequired();
        e.Property(p => p.FechaPrestamo).HasColumnName("fecha_prestamo").HasColumnType("timestamptz").HasDefaultValueSql("CURRENT_TIMESTAMP");
        e.Property(p => p.FechaEsperadaDevolucion).HasColumnName("fecha_esperada_devolucion").HasColumnType("timestamptz").IsRequired();
        e.Property(p => p.FechaDevolucion).HasColumnName("fecha_devolucion").HasColumnType("timestamptz");
        e.Property(p => p.EstadoPrestamo).HasColumnName("estado_prestamo").HasMaxLength(20).IsRequired().HasDefaultValue("Activo");
        e.Property(p => p.MotivoPrestamo).HasColumnName("motivo_prestamo").HasMaxLength(250).IsRequired();
        e.Property(p => p.ObservacionEntrega).HasColumnName("observacion_entrega");
        e.Property(p => p.ObservacionDevolucion).HasColumnName("observacion_devolucion");
        e.Property(p => p.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamptz").HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Relaciones con Restrict (RN-06)
        e.HasOne(p => p.Usuario)
            .WithMany(u => u.Prestamos)
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        e.HasOne(p => p.Equipo)
            .WithMany(eq => eq.Prestamos)
            .HasForeignKey(p => p.EquipoId)
            .OnDelete(DeleteBehavior.Restrict);

        e.HasIndex(p => p.EstadoPrestamo);
        e.HasIndex(p => p.UsuarioId);
        e.HasIndex(p => p.EquipoId);
    }

    private static void ConfigurarHistorialMovimientos(ModelBuilder modelBuilder)
    {
        var e = modelBuilder.Entity<MovimientoEquipo>();
        e.ToTable("historial_movimientos");
        e.HasKey(m => m.Id);

        e.Property(m => m.Id).HasColumnName("id");
        e.Property(m => m.EquipoId).HasColumnName("equipo_id").IsRequired();
        e.Property(m => m.UsuarioId).HasColumnName("usuario_id");
        e.Property(m => m.TipoMovimiento).HasColumnName("tipo_movimiento").HasMaxLength(50).IsRequired();
        e.Property(m => m.EstadoAnterior).HasColumnName("estado_anterior").HasMaxLength(50);
        e.Property(m => m.EstadoNuevo).HasColumnName("estado_nuevo").HasMaxLength(50).IsRequired();
        e.Property(m => m.Motivo).HasColumnName("motivo");
        e.Property(m => m.FechaMovimiento).HasColumnName("fecha_movimiento").HasColumnType("timestamptz").HasDefaultValueSql("CURRENT_TIMESTAMP");

        e.HasOne(m => m.Equipo).WithMany().HasForeignKey(m => m.EquipoId).OnDelete(DeleteBehavior.Cascade);
        e.HasOne(m => m.Usuario).WithMany().HasForeignKey(m => m.UsuarioId).OnDelete(DeleteBehavior.SetNull);
    }
}
