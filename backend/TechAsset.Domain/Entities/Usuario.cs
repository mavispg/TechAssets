namespace TechAsset.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Rol { get; set; } = "Colaborador";
    public bool Activo { get; set; } = true;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Relaciones
    public ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();

    public string NombreCompleto => $"{Nombres} {Apellidos}".Trim();
}
