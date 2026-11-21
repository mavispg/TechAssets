namespace TechAsset.Domain.Exceptions;

public class RecursoNoEncontradoException : Exception
{
    public RecursoNoEncontradoException(string entidad, object id) 
        : base($"No se encontró el recurso '{entidad}' con identificador '{id}'.")
    {
    }
}
