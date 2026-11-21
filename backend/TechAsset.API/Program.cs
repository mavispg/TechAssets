using System.Text.Json.Serialization;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using TechAsset.API.Filters;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Interfaces.Repositories;
using TechAsset.Application.Services;
using TechAsset.Infrastructure.Data;
using TechAsset.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de Base de Datos PostgreSQL con EF Core (Semana 11)
var connectionString = builder.Configuration.GetConnectionString("TechAssetDB")
    ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'TechAssetDB'.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var jwt = builder.Configuration.GetSection("Jwt");
var jwtKey = jwt["Key"] ?? throw new InvalidOperationException("Configura la clave de firma JWT mediante Jwt:Key.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters { ValidateIssuer = true, ValidateAudience = true, ValidateIssuerSigningKey = true, ValidateLifetime = true, ValidIssuer = jwt["Issuer"], ValidAudience = jwt["Audience"], IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), ClockSkew = TimeSpan.FromSeconds(30) };
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", p => p.RequireRole("Administrador"));
    options.AddPolicy("Tecnologia", p => p.RequireRole("Administrador", "Responsable de Tecnología"));
});

// 2. Registro de Repositorios (Capa de Infraestructura)
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IEquipoRepository, EquipoRepository>();
builder.Services.AddScoped<IPrestamoRepository, PrestamoRepository>();

// 3. Registro de Servicios de Aplicación (Capa de Aplicación - POO y Fowler)
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IEquipoService, EquipoService>();
builder.Services.AddScoped<IPrestamoService, PrestamoService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IReporteService, ReporteService>();

// 4. Controladores y Filtro Global de Excepciones
builder.Services.AddControllers(options =>
{
    options.Filters.Add<FiltroExcepcionesGlobal>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// 5. Configuración de CORS para el Frontend (React + Vite)
const string CorsPolicyName = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("X-Total-Count");
    });
});

// 6. Swagger / OpenAPI para documentación técnica y pruebas interactivas
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "TechAsset API – Innovatech Solutions S.A.C.",
        Version = "v1",
        Description = "API RESTful para la Gestión de Inventario y Préstamo de Equipos Tecnológicos (Construcción de Software UPLA)."
    });
});

var app = builder.Build();

// Configuración de Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TechAsset API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors(CorsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
