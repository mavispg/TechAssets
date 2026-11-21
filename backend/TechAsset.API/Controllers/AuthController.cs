using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TechAsset.Infrastructure.Data;

namespace TechAsset.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Correo.ToLower() == request.Correo.Trim().ToLower());
        if (usuario is null || !usuario.Activo)
            return Unauthorized(new { campo = "correo", mensaje = "El correo ingresado es incorrecto o no está registrado." });

        if (string.IsNullOrWhiteSpace(usuario.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Contrasena, usuario.PasswordHash))
            return Unauthorized(new { campo = "contrasena", mensaje = "La contraseña es incorrecta." });

        var jwt = config.GetSection("Jwt");
        var jwtKey = jwt["Key"] ?? throw new InvalidOperationException("Configura la clave de firma JWT mediante Jwt:Key.");
        var expira = DateTime.UtcNow.AddHours(double.Parse(jwt["HorasValidez"]!));
        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()), new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()), new Claim(ClaimTypes.Name, usuario.NombreCompleto), new Claim(ClaimTypes.Role, usuario.Rol), new Claim("correo", usuario.Correo) };
        var creds = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(jwt["Issuer"], jwt["Audience"], claims, expires: expira, signingCredentials: creds);
        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token), expira, usuario = new { id = usuario.Id, nombres = usuario.Nombres, apellidos = usuario.Apellidos, correo = usuario.Correo, area = usuario.Area, rol = usuario.Rol, activo = usuario.Activo } });
    }

    [Authorize]
    [HttpGet("yo")]
    public async Task<IActionResult> Yo()
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized();
        var usuario = await db.Usuarios.AsNoTracking().Where(u => u.Id == id && u.Activo).Select(u => new { id = u.Id, nombres = u.Nombres, apellidos = u.Apellidos, correo = u.Correo, area = u.Area, rol = u.Rol, activo = u.Activo }).FirstOrDefaultAsync();
        return usuario is null ? Unauthorized() : Ok(usuario);
    }
}

public sealed record LoginRequest(string Correo, string Contrasena);
