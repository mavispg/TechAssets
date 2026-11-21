# TechAsset – Sistema de Gestión de Inventario y Préstamo de Equipos Tecnológicos
### Innovatech Solutions S.A.C. &bull; Construcción de Software (Universidad Peruana Los Andes - UPLA)

Sistema integral de gestión de inventario y trazabilidad operativa de activos tecnológicos, desarrollado conforme al silabo de **Construcción de Software (Semanas 01 a 11)**, la **Rúbrica de Evaluación de 20 Puntos**, el estándar **ISO 9241-210 (Diseño Centrado en el Usuario)**, las **10 Heurísticas de Nielsen** y las **8 Reglas de Oro de Shneiderman**.

---

## 🏗️ 1. Arquitectura del Sistema (Semana 11)

El proyecto adopta **Clean Architecture (Arquitectura Limpia)** desacoplada en cuatro capas independientes:

```
TechAsset/
├── database/                   # Scripts DDL, DML y permisos de menor privilegio (S11)
│   ├── 01_schema.sql           # Tablas: usuarios, equipos, prestamos con UUID y constraints
│   ├── 02_seed_data.sql        # Semilla con datos realistas para los 6 KPIs
│   └── 03_permisos_app.sql     # Rol de aplicación 'techasset_app' con permisos DML
├── backend/                    # Solución .NET 8 Web API
│   ├── TechAsset.Domain/       # Entidades puras, Enums y Excepciones de Negocio
│   ├── TechAsset.Application/  # DTOs, Interfaces, Validadores (S5-S8) y Servicios
│   ├── TechAsset.Infrastructure/ # AppDbContext (EF Core 8), Npgsql y Repositorios
│   └── TechAsset.API/          # Controladores REST, Filtro Global y Swagger OpenAPI
├── frontend/                   # Single Page Application (React 19 + Vite + Tailwind CSS)
│   └── src/
│       ├── components/         # Modales ergonómicos, Cards de KPIs, Badges y Tablas
│       ├── context/            # AuthContext con simulación de roles DCU (Admin, Tech, Colaborador)
│       ├── pages/              # Inicio (6 KPIs), Equipos, Préstamos, Usuarios, Reportes
│       └── services/           # Cliente API modular (Axios/Fetch)
└── README.md                   # Documentación técnica integral
```

---

## 📋 2. Mapeo de Requerimientos Funcionales (RF-01 a RF-17)

| Módulo | Códigos RF | Descripción Funcional | Implementación |
| :--- | :--- | :--- | :--- |
| **Usuarios** | RF-01 a RF-04 | Registro, edición, listado y habilitación/deshabilitación de colaboradores y encargados. | `UsuariosController.cs`, `UsuarioService.cs`, `ModalUsuario.jsx` |
| **Equipos** | RF-05 a RF-08 | Catálogo patrimonial, búsqueda por código, filtros por categoría y control de estados (Disponible, Prestado, Mantenimiento, Baja). | `EquiposController.cs`, `EquipoService.cs`, `ModalEquipo.jsx` |
| **Préstamos** | RF-09 a RF-12 | Registro de préstamos con fecha esperada, control de activos y devolución con observaciones técnicas obligatorias. | `PrestamosController.cs`, `PrestamoService.cs`, `ModalNuevoPrestamo.jsx`, `ModalDevolucion.jsx` |
| **Dashboard y Reportes** | RF-13 a RF-17 | Visualización de los **6 KPIs**, gráficos de distribución por categoría, demanda por áreas y reportes filtrables con exportación/impresión. | `DashboardController.cs`, `ReportesController.cs`, `DashboardPage.jsx`, `ReportesPage.jsx` |

---

## ⚖️ 3. Validación de las 10 Reglas de Negocio (RN-01 a RN-10)

1. **RN-01 (Un préstamo activo por equipo):** Validado en frontend y backend en `PrestamoService.ValidarDisponibilidadEquipo()`. Si un equipo está `'Prestado'`, la API rechaza la solicitud con código `RN-01`.
2. **RN-02 (No prestar en Mantenimiento):** Impide préstamos si el estado es `'En Mantenimiento'`.
3. **RN-03 (No prestar equipos De Baja):** Impide préstamos si el estado es `'De Baja'`.
4. **RN-04 (Fecha de retorno válida):** Exige que la fecha esperada de devolución sea igual o posterior a la fecha del préstamo (`chk_prestamo_fecha_esperada` en BD y `ValidadorEntrada.ValidarRangoFechas()`).
5. **RN-05 (Usuario responsable obligatorio y activo):** Bloquea préstamos a usuarios deshabilitados o no seleccionados.
6. **RN-06 (No eliminar con historial):** La BD aplica `ON DELETE RESTRICT` en claves foráneas. El servicio verifica previamente `TieneHistorialPrestamosAsync()` y lanza excepción clara recomendando dar de baja el activo.
7. **RN-07 (Código patrimonial único):** Restricción `UNIQUE` en PostgreSQL y verificación preventiva en `EquipoRepository.ExisteCodigoPatrimonialAsync()`.
8. **RN-08 (Correo único):** Restricción `UNIQUE` en BD y verificación previa en `UsuarioService`.
9. **RN-09 (Solo Administrador deshabilita):** Control de acceso por rol en interfaz y servicios.
10. **RN-10 (Observaciones obligatorias en devolución):** El formulario de devolución exige como mínimo 5 caracteres de detalle técnico sobre el estado del equipo devuelto; el backend rechaza cadenas vacías con `ArgumentException`.

---

## 📊 4. Módulo de Salida: Los 6 KPIs del Dashboard (Semanas 09-10)

1. **Total de Equipos:** Contador global de activos en inventario.
2. **Equipos Disponibles:** Activos listos para entrega inmediata.
3. **Equipos Prestados:** Activos en asignación operativa actual.
4. **Equipos en Mantenimiento:** Activos en revisión técnica o preventiva.
5. **Total de Préstamos Realizados:** Historial acumulado de asignaciones.
6. **Área con Mayor Uso:** Unidad funcional de Innovatech con mayor demanda de equipos.

---

## 🎨 5. Usabilidad y Diseño Centrado en el Usuario (DCU / ISO 9241)

- **Arquitectura de Información (IA):** Barra lateral compuesta exclusivamente por **sustantivos** (*Inicio*, *Equipos*, *Préstamos*, *Usuarios*, *Reportes*). Los verbos (*"Registrar"*, *"Devolver"*) son botones contextuales dentro de modales y vistas.
- **Ergonomía de Diálogo (ISO 9241-110):** Modales amplios (`min(96vw, 1150px)`), cierre rápido con tecla `ESC` o clic en el fondo oscuro.
- **Prevención de Errores (Nielsen #5):** Diálogos destructivos con foco inicial automático en el botón *"Cancelar"*.
- **Identidad Visual Corporativa:** Paleta ejecutiva en tonos azul marino `#0f172a` y `#1e3a8a` con contraste superior a 4.5:1 (WCAG 2.1 AA) y soporte nativo de Modo Claro / Modo Oscuro.
- **Simulador de Roles:** Barra superior que permite alternar en tiempo real entre *Administrador*, *Responsable de Tecnología* y *Colaborador* para evaluar la experiencia personalizada por rol.

---

## 🚀 6. Instrucciones de Ejecución

### Requisitos Previos
- PostgreSQL 16 instalado y en ejecución en el puerto `5432`.
- .NET SDK 8.0 o superior.
- Node.js 18+ y npm.

### Paso 1: Configurar Base de Datos
Si aún no se ha ejecutado, correr en una consola con superusuario `postgres`:
```powershell
$env:PGPASSWORD="postgres"
psql -U postgres -h localhost -c "CREATE DATABASE techassetdb;"
psql -U postgres -h localhost -d techassetdb -f "C:\Users\Fabián\Desktop\TechAsset\database\01_schema.sql"
psql -U postgres -h localhost -d techassetdb -f "C:\Users\Fabián\Desktop\TechAsset\database\02_seed_data.sql"
psql -U postgres -h localhost -d techassetdb -f "C:\Users\Fabián\Desktop\TechAsset\database\03_permisos_app.sql"
```

### Paso 2: Ejecutar Backend (.NET 8 Web API)
```powershell
cd C:\Users\Fabián\Desktop\TechAsset\backend\TechAsset.API
dotnet run --launch-profile "http"
```
*El backend quedará escuchando en `http://localhost:5265` con documentación interactiva en `http://localhost:5265/swagger`.*

### Paso 3: Ejecutar Frontend (React Vite)
En otra consola:
```powershell
cd C:\Users\Fabián\Desktop\TechAsset\frontend
npm run dev
```
*Abrir el navegador en `http://localhost:5173`.*

---

## 👥 Credenciales de Acceso y Datos de Prueba

> [!NOTE]
> Las contraseñas indicadas (`TechAsset2026!`) son credenciales predeterminadas para entorno de **desarrollo y demostración académica**. En producción, cada usuario define una clave robusta individual gestionada con hash Bcrypt (costo 10).

| Colaborador | Correo | Rol en el Sistema | Área | Contraseña (Solo Dev) |
| :--- | :--- | :--- | :--- | :--- |
| **Fabián Gómez** | `fabian.gomez@innovatech.pe` | Administrador | Tecnologías de Información | `TechAsset2026!` |
| **Valeria Rios** | `valeria.rios@innovatech.pe` | Responsable de Tecnología | Soporte Técnico | `TechAsset2026!` |
| **Carlos Mendoza** | `carlos.mendoza@innovatech.pe` | Colaborador | Desarrollo de Software | `TechAsset2026!` |
| **Lucía Fernández** | `lucia.fernandez@innovatech.pe` | Colaborador | Diseño UX/UI | `TechAsset2026!` |
| **Rodrigo Paredes** | `rodrigo.paredes@innovatech.pe` | Colaborador | Desarrollo de Software | `TechAsset2026!` |
