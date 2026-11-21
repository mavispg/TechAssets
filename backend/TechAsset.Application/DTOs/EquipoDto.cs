namespace TechAsset.Application.DTOs;

public class EquipoDto
{
    public Guid Id { get; set; }
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string Estado { get; set; } = "Disponible";
    public string? ObservacionesTecnicas { get; set; }
    public DateTime CreadoEn { get; set; }

    // Estado del préstamo actual si estuviera prestado
    public Guid? PrestamoActualId { get; set; }
    public string? UsuarioActualNombre { get; set; }
    public string? UsuarioActualArea { get; set; }
    public DateTime? FechaEsperadaDevolucion { get; set; }
}

public class CrearEquipoDto
{
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string Estado { get; set; } = "Disponible";
    public string? ObservacionesTecnicas { get; set; }
}

public class ActualizarEquipoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string Estado { get; set; } = "Disponible";
    public string? ObservacionesTecnicas { get; set; }
}

public class FiltroEquipoDto
{
    public string? Termino { get; set; }
    public string? Categoria { get; set; }
    public string? Estado { get; set; }
    public int? Pagina { get; set; }
    public int? Tamano { get; set; }
}
