namespace TechAsset.Domain.Entities;

public class Equipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string Estado { get; set; } = "Disponible";
    public string? ObservacionesTecnicas { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Relaciones
    public ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();
}
