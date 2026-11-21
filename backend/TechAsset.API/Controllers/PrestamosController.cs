using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TechAsset.Application.DTOs;
using TechAsset.Application.Interfaces;

namespace TechAsset.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PrestamosController : ControllerBase
{
    private readonly IPrestamoService _prestamoService;

    public PrestamosController(IPrestamoService prestamoService)
    {
        _prestamoService = prestamoService;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos([FromQuery] FiltroPrestamoDto filtro)
    {
        if (User.IsInRole("Colaborador") && Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId))
            filtro.UsuarioId = usuarioId;
        var prestamos = (await _prestamoService.ObtenerTodosAsync(filtro)).ToList();
        var total = prestamos.Count;
        Response.Headers.Append("X-Total-Count", total.ToString());

        if (filtro.Pagina.HasValue && filtro.Pagina.Value > 0)
        {
            var tamano = filtro.Tamano.GetValueOrDefault(10);
            if (tamano <= 0) tamano = 10;
            var paginados = prestamos.Skip((filtro.Pagina.Value - 1) * tamano).Take(tamano).ToList();
            return Ok(new PaginaResultadoDto<PrestamoDto>
            {
                Elementos = paginados,
                TotalElementos = total,
                Pagina = filtro.Pagina.Value,
                Tamano = tamano
            });
        }

        return Ok(prestamos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PrestamoDto>> ObtenerPorId(Guid id)
    {
        var prestamo = await _prestamoService.ObtenerPorIdAsync(id);
        if (User.IsInRole("Colaborador") && !string.Equals(User.FindFirstValue(ClaimTypes.NameIdentifier), prestamo.UsuarioId.ToString(), StringComparison.OrdinalIgnoreCase)) return Forbid();
        return Ok(prestamo);
    }

    [HttpGet("usuario/{usuarioId:guid}")]
    public async Task<ActionResult<IEnumerable<PrestamoDto>>> ObtenerPorUsuario(Guid usuarioId)
    {
        if (User.IsInRole("Colaborador") && !string.Equals(User.FindFirstValue(ClaimTypes.NameIdentifier), usuarioId.ToString(), StringComparison.OrdinalIgnoreCase)) return Forbid();
        var prestamos = await _prestamoService.ObtenerPorUsuarioAsync(usuarioId);
        return Ok(prestamos);
    }

    [HttpPost]
    public async Task<ActionResult<PrestamoDto>> Registrar([FromBody] RegistrarPrestamoDto dto)
    {
        if (User.IsInRole("Colaborador") && Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId)) dto.UsuarioId = usuarioId;
        var nuevo = await _prestamoService.RegistrarPrestamoAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = nuevo.Id }, nuevo);
    }

    [HttpPost("{id:guid}/aprobar")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<PrestamoDto>> Aprobar(Guid id)
    {
        var guidAprobador = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : (Guid?)null;
        var aprobado = await _prestamoService.AprobarPrestamoAsync(id, guidAprobador);
        return Ok(aprobado);
    }

    [HttpPost("{id:guid}/rechazar")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<PrestamoDto>> Rechazar(Guid id, [FromBody] RechazarPrestamoDto? dto)
    {
        var guidRechazador = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : (Guid?)null;
        var rechazado = await _prestamoService.RechazarPrestamoAsync(id, guidRechazador, dto?.Motivo);
        return Ok(rechazado);
    }

    [HttpPost("{id:guid}/devolver")]
    [Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<ActionResult<PrestamoDto>> Devolver(Guid id, [FromBody] DevolverPrestamoDto dto)
    {
        var devuelto = await _prestamoService.DevolverPrestamoAsync(id, dto);
        return Ok(devuelto);
    }
}
