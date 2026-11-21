namespace TechAsset.Application.DTOs;

public class PrestamoDto
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioCorreo { get; set; } = string.Empty;
    public string UsuarioArea { get; set; } = string.Empty;

    public Guid EquipoId { get; set; }
    public string EquipoCodigoPatrimonial { get; set; } = string.Empty;
    public string EquipoNombre { get; set; } = string.Empty;
    public string EquipoCategoria { get; set; } = string.Empty;
    public string EquipoMarca { get; set; } = string.Empty;
    public string EquipoModelo { get; set; } = string.Empty;

    public DateTime FechaPrestamo { get; set; }
    public DateTime FechaEsperadaDevolucion { get; set; }
    public DateTime? FechaDevolucion { get; set; }
    public string EstadoPrestamo { get; set; } = "Pendiente";
    public string MotivoPrestamo { get; set; } = string.Empty;
    public string? ObservacionEntrega { get; set; }
    public string? ObservacionDevolucion { get; set; }
    public DateTime CreadoEn { get; set; }
}

public class RegistrarPrestamoDto
{
    public Guid UsuarioId { get; set; }
    public Guid EquipoId { get; set; }
    public DateTime? FechaPrestamo { get; set; }
    public DateTime FechaEsperadaDevolucion { get; set; }
    public string? MotivoPrestamo { get; set; }
    public string? Observaciones { get; set; }
    public string? ObservacionEntrega { get; set; }
}

public class DevolverPrestamoDto
{
    public string ObservacionDevolucion { get; set; } = string.Empty; // RN-10: Obligatoria
    public string? NuevoEstadoEquipo { get; set; } = "Disponible"; // Permite indicar si pasa a 'Disponible' o 'En Mantenimiento'
}

public class RechazarPrestamoDto
{
    public string? Motivo { get; set; }
}

public class FiltroPrestamoDto
{
    public string? Termino { get; set; }
    public string? EstadoPrestamo { get; set; }
    public Guid? UsuarioId { get; set; }
    public string? Area { get; set; }
    public DateTime? Desde { get; set; }
    public DateTime? Hasta { get; set; }
    public int? Pagina { get; set; }
    public int? Tamano { get; set; }
}
