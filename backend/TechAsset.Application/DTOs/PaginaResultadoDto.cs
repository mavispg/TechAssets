namespace TechAsset.Application.DTOs;

public class PaginaResultadoDto<T>
{
    public IEnumerable<T> Elementos { get; set; } = new List<T>();
    public int TotalElementos { get; set; }
    public int Pagina { get; set; }
    public int Tamano { get; set; }
    public int TotalPaginas => Tamano > 0 ? (int)Math.Ceiling((double)TotalElementos / Tamano) : 0;
}
