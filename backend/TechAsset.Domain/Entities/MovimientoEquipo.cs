namespace TechAsset.Domain.Entities;

public class MovimientoEquipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EquipoId { get; set; }
    public Guid? UsuarioId { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty; // 'CambioEstado', 'Prestamo', 'Devolucion'
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;

    public Equipo? Equipo { get; set; }
    public Usuario? Usuario { get; set; }
}
