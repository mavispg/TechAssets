-- =====================================================================
-- TechAsset – Sistema de Gestión de Inventario y Préstamo de Equipos
-- Innovatech Solutions S.A.C.
-- Script Unificado e Idempotente de Instalación (database/instalar.sql)
-- Limpia y carga exactamente los datos solicitados:
-- 5 Usuarios (1 Admin, 1 Resp. Tecnología, 3 Colaboradores)
-- 10 Equipos Tecnológicos
-- 5 Préstamos asociados únicamente a Colaboradores
-- =====================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    area VARCHAR(80) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Colaborador',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash VARCHAR(200) NOT NULL DEFAULT '',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_nombres_longitud CHECK (char_length(trim(nombres)) >= 2),
    CONSTRAINT chk_usuario_apellidos_longitud CHECK (char_length(trim(apellidos)) >= 2),
    CONSTRAINT chk_usuario_correo_formato CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('Administrador', 'Responsable de Tecnología', 'Colaborador'))
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200) NOT NULL DEFAULT '';

-- 3. TABLA: equipos
CREATE TABLE IF NOT EXISTS equipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_patrimonial VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    numero_serie VARCHAR(80) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Disponible',
    observaciones_tecnicas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipo_codigo_minimo CHECK (char_length(trim(codigo_patrimonial)) >= 4),
    CONSTRAINT chk_equipo_nombre_minimo CHECK (char_length(trim(nombre)) >= 3)
);

-- Actualizar restricción de estados en equipos
ALTER TABLE equipos DROP CONSTRAINT IF EXISTS chk_equipo_estado;
ALTER TABLE equipos ADD CONSTRAINT chk_equipo_estado CHECK (estado IN ('Disponible', 'Prestado', 'En Mantenimiento', 'En mantenimiento', 'De Baja', 'Dado de baja'));

-- 4. TABLA: prestamos
CREATE TABLE IF NOT EXISTS prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    equipo_id UUID NOT NULL,
    fecha_prestamo TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_esperada_devolucion TIMESTAMPTZ NOT NULL,
    fecha_devolucion TIMESTAMPTZ,
    estado_prestamo VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    motivo_prestamo VARCHAR(250),
    observacion_entrega TEXT,
    observacion_devolucion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_prestamo_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT,
    CONSTRAINT chk_prestamo_fechas CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_prestamo),
    CONSTRAINT chk_prestamo_fecha_esperada CHECK (fecha_esperada_devolucion >= fecha_prestamo)
);

ALTER TABLE prestamos ALTER COLUMN motivo_prestamo DROP NOT NULL;
ALTER TABLE prestamos ALTER COLUMN estado_prestamo SET DEFAULT 'Pendiente';
ALTER TABLE prestamos DROP CONSTRAINT IF EXISTS chk_prestamo_estado;
ALTER TABLE prestamos ADD CONSTRAINT chk_prestamo_estado CHECK (estado_prestamo IN ('Pendiente', 'Activo', 'Aprobado', 'Rechazado', 'Devuelto', 'Vencido'));

-- 5. TABLA: historial_movimientos
CREATE TABLE IF NOT EXISTS historial_movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipo_id UUID NOT NULL,
    usuario_id UUID,
    tipo_movimiento VARCHAR(50) NOT NULL, -- 'CambioEstado', 'Prestamo', 'Devolucion', 'Aprobacion', 'Rechazo'
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    motivo TEXT,
    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_equipos_estado ON equipos(estado);
CREATE INDEX IF NOT EXISTS idx_equipos_categoria ON equipos(categoria);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado_prestamo);
CREATE INDEX IF NOT EXISTS idx_prestamos_usuario ON prestamos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_equipo ON prestamos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_fechas ON prestamos(fecha_prestamo, fecha_devolucion);
CREATE INDEX IF NOT EXISTS idx_historial_equipo ON historial_movimientos(equipo_id);

-- =====================================================================
-- LIMPIEZA COMPLETA DE DATOS EXISTENTES (Punto 6: Datos de prueba)
-- =====================================================================
TRUNCATE TABLE historial_movimientos CASCADE;
TRUNCATE TABLE prestamos CASCADE;
TRUNCATE TABLE equipos CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- =====================================================================
-- 6. Semilla de Usuarios: EXACTAMENTE 5 usuarios (@innovatech.pe)
-- 1 Administrador, 1 Responsable de Tecnología, 3 Colaboradores
-- =====================================================================
INSERT INTO usuarios (id, nombres, apellidos, correo, area, rol, activo, password_hash) VALUES
('a0000000-0000-0000-0000-000000000001', 'Fabián', 'Gómez', 'fabian.gomez@innovatech.pe', 'Tecnologías de Información', 'Administrador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000002', 'Valeria', 'Rios Mendoza', 'valeria.rios@innovatech.pe', 'Soporte Técnico', 'Responsable de Tecnología', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000003', 'Carlos', 'Mendoza Sánchez', 'carlos.mendoza@innovatech.pe', 'Desarrollo de Software', 'Colaborador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000004', 'Lucía', 'Fernández Vega', 'lucia.fernandez@innovatech.pe', 'Diseño UX/UI', 'Colaborador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000005', 'Rodrigo', 'Paredes Castro', 'rodrigo.paredes@innovatech.pe', 'Desarrollo de Software', 'Colaborador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10)));

-- =====================================================================
-- 7. Semilla de Equipos: EXACTAMENTE 10 equipos tecnológicos variados
-- Coherentes con los préstamos (2 Prestados, 6 Disponibles, 1 Mantenimiento, 1 De Baja)
-- =====================================================================
INSERT INTO equipos (id, codigo_patrimonial, nombre, categoria, marca, modelo, numero_serie, estado, observaciones_tecnicas) VALUES
('b0000000-0000-0000-0000-000000000001', 'EQ-LAP-001', 'Laptop Dell Latitude 5420', 'Laptop', 'Dell', 'Latitude 5420 Core i7 16GB', 'SN-DELL-5420-01', 'Prestado', 'Entregada con cargador original y funda protectora'),
('b0000000-0000-0000-0000-000000000002', 'EQ-LAP-002', 'Laptop Lenovo ThinkPad T14', 'Laptop', 'Lenovo', 'ThinkPad T14 Gen 3', 'SN-LEN-T14-02', 'Disponible', 'Operativa, batería al 98% de vida útil'),
('b0000000-0000-0000-0000-000000000003', 'EQ-LAP-003', 'MacBook Pro 14 M2 Pro', 'Laptop', 'Apple', 'MacBook Pro 14"', 'SN-APL-MBP14-03', 'Prestado', 'Asignada para diseño de interfaces de alta resolución'),
('b0000000-0000-0000-0000-000000000004', 'EQ-MON-001', 'Monitor LG UltraFine 27" 4K', 'Monitor', 'LG', '27UN850-W IPS', 'SN-LG-274K-01', 'Disponible', 'Incluye cable USB-C y base ergonómica regulable'),
('b0000000-0000-0000-0000-000000000005', 'EQ-MON-002', 'Monitor Dell 24" P2419H', 'Monitor', 'Dell', 'P2419H FHD', 'SN-DELL-24FHD-02', 'Disponible', 'Solicitud de préstamo pendiente de aprobación'),
('b0000000-0000-0000-0000-000000000006', 'EQ-PRJ-001', 'Proyector Láser Epson PowerLite', 'Proyector', 'Epson', 'PowerLite L520U 5200Lm', 'SN-EPS-L520-01', 'Disponible', 'Ubicado en Almacén TI - Préstamo concluido'),
('b0000000-0000-0000-0000-000000000007', 'EQ-PRJ-002', 'Proyector Portátil Anker Nebula', 'Proyector', 'Anker', 'Nebula Capsule Max', 'SN-ANK-CAP-02', 'En Mantenimiento', 'RN-02: En revisión técnica por recalentamiento de lente'),
('b0000000-0000-0000-0000-000000000008', 'EQ-TAB-001', 'iPad Pro 11" 256GB WiFi', 'Tablet', 'Apple', 'iPad Pro 4ta Gen', 'SN-APL-IPD11-01', 'Disponible', 'Retornado de préstamo conforme con Apple Pencil'),
('b0000000-0000-0000-0000-000000000009', 'EQ-SRV-001', 'Servidor NAS Synology DiskStation', 'Servidor', 'Synology', 'DS923+ 4 Bahías', 'SN-SYN-923-01', 'Disponible', 'Configurado con 4 discos de 8TB en RAID 5'),
('b0000000-0000-0000-0000-000000000010', 'EQ-LAP-004', 'Laptop HP ProBook 450 G8', 'Laptop', 'HP', 'ProBook 450 G8 Core i5', 'SN-HP-PB450-04', 'De Baja', 'RN-03: Tarjeta madre dañada por sobretensión eléctrica');

-- =====================================================================
-- 8. Semilla de Préstamos: EXACTAMENTE 5 préstamos
-- Asociados ÚNICAMENTE a los 3 Colaboradores (Carlos, Lucía, Rodrigo)
-- Mezcla de estados: 2 Activos, 1 Pendiente, 2 Devueltos
-- =====================================================================
INSERT INTO prestamos (id, usuario_id, equipo_id, fecha_prestamo, fecha_esperada_devolucion, fecha_devolucion, estado_prestamo, motivo_prestamo, observacion_entrega, observacion_devolucion) VALUES
-- Préstamo 1: Activo -> Carlos Mendoza / Laptop Dell (Prestado)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '7 days', NULL, 'Activo', 'Desarrollo de módulos core del sistema TechAsset', 'Entregado con cargador original y maletín corporativo', NULL),

-- Préstamo 2: Activo -> Lucía Fernández / MacBook Pro (Prestado)
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Activo', 'Diseño y prototipado de interfaces en alta fidelidad', 'Entregado con adaptador de corriente MagSafe y funda protectora', NULL),

-- Préstamo 3: Pendiente -> Rodrigo Paredes / Monitor Dell (Disponible)
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 days', NULL, 'Pendiente', 'Extensión de pantalla para pruebas de integración', 'Solicitud pendiente de aprobación por Soporte TI', NULL),

-- Préstamo 4: Devuelto -> Carlos Mendoza / Proyector Epson (Disponible)
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Devuelto', 'Demostración del prototipo ante el comité directivo', 'Cables HDMI y control remoto incluidos', 'RN-10: Equipo devuelto en perfectas condiciones operativas y con todos sus accesorios'),

-- Préstamo 5: Devuelto -> Lucía Fernández / iPad Pro (Disponible)
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Devuelto', 'Validación de experiencia de usuario en dispositivos táctiles', 'Incluye Apple Pencil de 2da generación', 'RN-10: Devolución conforme, pantalla intacta y lápiz sincronizado');

-- =====================================================================
-- 9. Semilla de Historial de Movimientos
-- =====================================================================
INSERT INTO historial_movimientos (id, equipo_id, usuario_id, tipo_movimiento, estado_anterior, estado_nuevo, motivo, fecha_movimiento) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado para presentación', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Devolucion', 'Prestado', 'Disponible', 'Devolución conforme de proyector', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado de tablet', CURRENT_TIMESTAMP - INTERVAL '20 days'),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'Devolucion', 'Prestado', 'Disponible', 'Devolución conforme de tablet', CURRENT_TIMESTAMP - INTERVAL '14 days'),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado: Laptop Dell Latitude 5420', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado: MacBook Pro 14 M2 Pro', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', NULL, 'CambioEstado', 'Disponible', 'En Mantenimiento', 'RN-02: En revisión técnica por recalentamiento', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000010', NULL, 'CambioEstado', 'Disponible', 'De Baja', 'RN-03: Tarjeta madre dañada definitivamente', CURRENT_TIMESTAMP - INTERVAL '12 days');

-- 10. Permisos de rol de aplicación 'techasset_app'
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'techasset_app') THEN
      CREATE ROLE techasset_app WITH LOGIN PASSWORD 'TechAssetApp2026' NOSUPERUSER NOCREATEDB NOCREATEROLE;
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE techassetdb TO techasset_app;
GRANT USAGE ON SCHEMA public TO techasset_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO techasset_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO techasset_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO techasset_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO techasset_app;
