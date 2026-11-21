namespace TechAsset.Domain.Exceptions;

public class ReglaNegocioException : Exception
{
    public string CodigoRegla { get; }

    public ReglaNegocioException(string codigoRegla, string mensaje) : base(mensaje)
    {
        CodigoRegla = codigoRegla;
    }
}
