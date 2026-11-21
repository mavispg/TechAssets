namespace TechAsset.Domain.Entities;

public class Prestamo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public Guid EquipoId { get; set; }
    public DateTime FechaPrestamo { get; set; } = DateTime.UtcNow;
    public DateTime FechaEsperadaDevolucion { get; set; }
    public DateTime? FechaDevolucion { get; set; }
    public string EstadoPrestamo { get; set; } = "Pendiente";
    public string? MotivoPrestamo { get; set; } = string.Empty;
    public string? ObservacionEntrega { get; set; }
    public string? ObservacionDevolucion { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public Usuario? Usuario { get; set; }
    public Equipo? Equipo { get; set; }
}
