using System.Text.RegularExpressions;
using TechAsset.Domain.Exceptions;

namespace TechAsset.Application.Common;

/// <summary>
/// Clase utilitaria reutilizable para validación de entrada de datos (Semanas 05 a 08).
/// Garantiza completitud, exactitud y consistencia semántica antes de persistir.
/// </summary>
public static class ValidadorEntrada
{
    private static readonly Regex CorreoRegex = new(
        @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public static string ValidarTextoObligatorio(string? valor, string nombreCampo, int minLongitud = 2, int maxLongitud = 150)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            throw new ArgumentException($"El campo '{nombreCampo}' es obligatorio y no puede contener únicamente espacios.", nombreCampo);
        }

        var limpio = valor.Trim();
        if (limpio.Length < minLongitud)
        {
            throw new ArgumentException($"El campo '{nombreCampo}' debe tener al menos {minLongitud} caracteres.", nombreCampo);
        }

        if (limpio.Length > maxLongitud)
        {
            throw new ArgumentException($"El campo '{nombreCampo}' no puede exceder los {maxLongitud} caracteres.", nombreCampo);
        }

        return limpio;
    }

    public static string ValidarCorreo(string? correo)
    {
        var correoLimpio = ValidarTextoObligatorio(correo, "Correo electrónico", 5, 150);
        if (!CorreoRegex.IsMatch(correoLimpio))
        {
            throw new ArgumentException("El correo electrónico ingresado no tiene un formato válido (ej. usuario@innovatech.pe).", nameof(correo));
        }

        return correoLimpio.ToLowerInvariant();
    }

    public static string ValidarContrasena(string? contrasena)
    {
        if (string.IsNullOrEmpty(contrasena) || contrasena.Length < 8)
            throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.", nameof(contrasena));
        if (contrasena.Length > 100)
            throw new ArgumentException("La contraseña no puede exceder los 100 caracteres.", nameof(contrasena));
        if (!Regex.IsMatch(contrasena, "[A-Z]", RegexOptions.CultureInvariant))
            throw new ArgumentException("La contraseña debe incluir una letra mayúscula (A-Z).", nameof(contrasena));
        if (!Regex.IsMatch(contrasena, "[a-z]", RegexOptions.CultureInvariant))
            throw new ArgumentException("La contraseña debe incluir una letra minúscula (a-z).", nameof(contrasena));
        if (!Regex.IsMatch(contrasena, "[0-9]", RegexOptions.CultureInvariant))
            throw new ArgumentException("La contraseña debe incluir un número (0-9).", nameof(contrasena));
        if (!Regex.IsMatch(contrasena, "[^A-Za-z0-9\\s]", RegexOptions.CultureInvariant))
            throw new ArgumentException("La contraseña debe incluir un símbolo, por ejemplo: ! @ # $ %.", nameof(contrasena));

        return contrasena;
    }

    public static void ValidarRangoFechas(DateTime fechaInicio, DateTime fechaFin, string nombreFin = "Fecha de devolución")
    {
        if (fechaFin < fechaInicio)
        {
            throw new ReglaNegocioException("RN-04", $"La {nombreFin} ({fechaFin:yyyy-MM-dd HH:mm}) no puede ser anterior a la fecha de inicio ({fechaInicio:yyyy-MM-dd HH:mm}).");
        }
    }
}
