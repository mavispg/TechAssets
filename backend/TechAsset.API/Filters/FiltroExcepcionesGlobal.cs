using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TechAsset.Domain.Exceptions;

namespace TechAsset.API.Filters;

public class FiltroExcepcionesGlobal : IExceptionFilter
{
    private readonly ILogger<FiltroExcepcionesGlobal> _logger;

    public FiltroExcepcionesGlobal(ILogger<FiltroExcepcionesGlobal> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        switch (context.Exception)
        {
            case ReglaNegocioException ex:
                _logger.LogWarning("Violación de Regla de Negocio [{Codigo}]: {Mensaje}", ex.CodigoRegla, ex.Message);
                context.Result = new BadRequestObjectResult(new
                {
                    exito = false,
                    tipo = "ReglaNegocio",
                    codigoRegla = ex.CodigoRegla,
                    mensaje = ex.Message
                });
                context.ExceptionHandled = true;
                break;

            case RecursoNoEncontradoException ex:
                _logger.LogInformation("Recurso no encontrado: {Mensaje}", ex.Message);
                context.Result = new NotFoundObjectResult(new
                {
                    exito = false,
                    tipo = "NoEncontrado",
                    mensaje = ex.Message
                });
                context.ExceptionHandled = true;
                break;

            case ArgumentException ex:
                _logger.LogWarning("Error de validación de entrada: {Mensaje}", ex.Message);
                context.Result = new BadRequestObjectResult(new
                {
                    exito = false,
                    tipo = "ValidacionEntrada",
                    parametro = ex.ParamName,
                    mensaje = ex.Message
                });
                context.ExceptionHandled = true;
                break;

            default:
                _logger.LogError(context.Exception, "Error interno no controlado");
                context.Result = new ObjectResult(new
                {
                    exito = false,
                    tipo = "ErrorServidor",
                    mensaje = "Ocurrió un error inesperado al procesar la solicitud."
                })
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
                context.ExceptionHandled = true;
                break;
        }
    }
}
