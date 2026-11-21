namespace TechAsset.Application.DTOs;

public class MovimientoDto
{
    public Guid Id { get; set; }
    public Guid EquipoId { get; set; }
    public string EquipoCodigoPatrimonial { get; set; } = string.Empty;
    public string EquipoNombre { get; set; } = string.Empty;
    public Guid? UsuarioId { get; set; }
    public string? UsuarioNombre { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public DateTime FechaMovimiento { get; set; }
}
