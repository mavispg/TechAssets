using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;

namespace TechAsset.API.Controllers;

[ApiController]
[Authorize(Roles = "Administrador,Responsable de Tecnología")]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos([FromQuery] bool? soloActivos, [FromQuery] int? pagina, [FromQuery] int? tamano)
    {
        var usuarios = (await _usuarioService.ObtenerTodosAsync(soloActivos)).ToList();
        var total = usuarios.Count;
        Response.Headers.Append("X-Total-Count", total.ToString());

        if (pagina.HasValue && pagina.Value > 0)
        {
            var t = tamano.GetValueOrDefault(10);
            if (t <= 0) t = 10;
            var paginados = usuarios.Skip((pagina.Value - 1) * t).Take(t).ToList();
            return Ok(new PaginaResultadoDto<UsuarioDto>
            {
                Elementos = paginados,
                TotalElementos = total,
                Pagina = pagina.Value,
                Tamano = t
            });
        }

        return Ok(usuarios);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> ObtenerPorId(Guid id)
    {
        var usuario = await _usuarioService.ObtenerPorIdAsync(id);
        return Ok(usuario);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<UsuarioDto>> Crear([FromBody] CrearUsuarioDto dto)
    {
        var nuevo = await _usuarioService.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = nuevo.Id }, nuevo);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<ActionResult<UsuarioDto>> Actualizar(Guid id, [FromBody] ActualizarUsuarioDto dto)
    {
        var actualizado = await _usuarioService.ActualizarAsync(id, dto);
        return Ok(actualizado);
    }

    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] CambiarEstadoUsuarioRequest request)
    {
        await _usuarioService.CambiarEstadoAsync(id, request.Activo);
        return NoContent();
    }
}

public class CambiarEstadoUsuarioRequest
{
    public bool Activo { get; set; }
}
