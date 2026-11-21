using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;

namespace TechAsset.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class EquiposController : ControllerBase
{
    private readonly IEquipoService _equipoService;

    public EquiposController(IEquipoService equipoService)
    {
        _equipoService = equipoService;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos([FromQuery] FiltroEquipoDto filtro)
    {
        var equipos = (await _equipoService.ObtenerTodosAsync(filtro)).ToList();
        var total = equipos.Count;
        Response.Headers.Append("X-Total-Count", total.ToString());

        if (filtro.Pagina.HasValue && filtro.Pagina.Value > 0)
        {
            var tamano = filtro.Tamano.GetValueOrDefault(10);
            if (tamano <= 0) tamano = 10;
            var paginados = equipos.Skip((filtro.Pagina.Value - 1) * tamano).Take(tamano).ToList();
            return Ok(new PaginaResultadoDto<EquipoDto>
            {
                Elementos = paginados,
                TotalElementos = total,
                Pagina = filtro.Pagina.Value,
                Tamano = tamano
            });
        }

        return Ok(equipos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipoDto>> ObtenerPorId(Guid id)
    {
        var equipo = await _equipoService.ObtenerPorIdAsync(id);
        return Ok(equipo);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<EquipoDto>> Crear([FromBody] CrearEquipoDto dto)
    {
        var creado = await _equipoService.CrearAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<EquipoDto>> Actualizar(Guid id, [FromBody] ActualizarEquipoDto dto)
    {
        var actualizado = await _equipoService.ActualizarAsync(id, dto);
        return Ok(actualizado);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        await _equipoService.EliminarAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<IActionResult> CambiarEstado(Guid id, [FromBody] CambiarEstadoEquipoRequest request)
    {
        await _equipoService.CambiarEstadoAsync(id, request.NuevoEstado, request.Motivo);
        return NoContent();
    }

    [HttpGet("movimientos")]
    public async Task<ActionResult<IEnumerable<MovimientoDto>>> ObtenerMovimientos([FromQuery] Guid? equipoId)
    {
        var movimientos = await _equipoService.ObtenerMovimientosAsync(equipoId);
        return Ok(movimientos);
    }
}

public class CambiarEstadoEquipoRequest
{
    public string NuevoEstado { get; set; } = string.Empty;
    public string? Motivo { get; set; }
}
