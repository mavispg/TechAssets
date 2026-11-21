namespace TechAsset.Application.DTOs;

/// <summary>
/// Módulo de Salida de Datos: Dashboard Ejecutivo (Semanas 09 y 10).
/// Responde con los 6 KPIs exigidos por el Caso Práctico Innovatech Solutions S.A.C.
/// </summary>
public class DashboardDto
{
    // KPI 1: Total de equipos
    public int TotalEquipos { get; set; }

    // KPI 2: Equipos disponibles
    public int EquiposDisponibles { get; set; }

    // KPI 3: Equipos prestados
    public int EquiposPrestados { get; set; }

    // KPI 4: Equipos en mantenimiento
    public int EquiposEnMantenimiento { get; set; }

    // Equipos de baja (auditoría)
    public int EquiposDeBaja { get; set; }

    // KPI 5: Total de préstamos registrados
    public int TotalPrestamos { get; set; }

    // Préstamos actualmente activos
    public int PrestamosActivos { get; set; }

    // Préstamos pendientes de aprobación
    public int PrestamosPendientes { get; set; }

    // KPI 6: Área con mayor uso de equipos
    public string AreaConMayorUso { get; set; } = "Sin registros";
    public int CantidadPrestamosAreaMayorUso { get; set; }

    // RF-15: Equipos más utilizados (Top de mayor demanda)
    public List<EquipoUsoResumenDto> EquiposMasUtilizados { get; set; } = new();

    // Desgloses analíticos para visualización gráfica (Nielsen #2 y #4)
    public List<CategoriaResumenDto> DistribucionPorCategoria { get; set; } = new();
    public List<AreaUsoResumenDto> PrestamosPorArea { get; set; } = new();
    public List<PrestamoDto> PrestamosRecientes { get; set; } = new();
}

public class EquipoUsoResumenDto
{
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public int TotalPrestamos { get; set; }
}

public class CategoriaResumenDto
{
    public string Categoria { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}

public class AreaUsoResumenDto
{
    public string Area { get; set; } = string.Empty;
    public int TotalPrestamos { get; set; }
    public int PrestamosActivos { get; set; }
}

public class ReportePrestamosAreaDto
{
    public string Area { get; set; } = string.Empty;
    public int TotalPrestamos { get; set; }
    public List<PrestamoDto> DetallePrestamos { get; set; } = new();
}
