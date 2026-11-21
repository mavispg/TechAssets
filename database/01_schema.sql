-- =====================================================================
-- TechAsset - Sistema de Gestión de Inventario y Préstamo de Equipos
-- Innovatech Solutions S.A.C.
-- Script 01: Creación de Esquema de Base de Datos (PostgreSQL 16)
-- Conforme a la Rúbrica UPLA (Semanas 01 a 11) y Reglas RN-01 a RN-10
-- =====================================================================

-- Extensión para generación de identificadores únicos UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABLA: usuarios
-- Registra a los colaboradores, responsables técnicos y administradores (RF-01 a RF-04)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE, -- RN-08: Correo electrónico único
    area VARCHAR(80) NOT NULL,          -- Ej: TI, Desarrollo, Administración, Finanzas, RRHH
    rol VARCHAR(50) NOT NULL DEFAULT 'Colaborador', -- Administrador, Responsable de Tecnología, Colaborador
    activo BOOLEAN NOT NULL DEFAULT TRUE,           -- RN-09: Solo admin deshabilita
    password_hash VARCHAR(200) NOT NULL DEFAULT '',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_nombres_longitud CHECK (char_length(trim(nombres)) >= 2),
    CONSTRAINT chk_usuario_apellidos_longitud CHECK (char_length(trim(apellidos)) >= 2),
    CONSTRAINT chk_usuario_correo_formato CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('Administrador', 'Responsable de Tecnología', 'Colaborador'))
);

-- 2. TABLA: equipos
-- Catálogo patrimonial de activos tecnológicos (RF-05 a RF-08)
CREATE TABLE IF NOT EXISTS equipos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_patrimonial VARCHAR(50) NOT NULL UNIQUE, -- RN-07: Código patrimonial único (ej. EQ-LAP-001)
    nombre VARCHAR(150) NOT NULL,                   -- Ej. Laptop Dell Latitude 5420
    categoria VARCHAR(80) NOT NULL,                 -- Laptop, Monitor, Proyector, Tablet, Servidor, Periférico
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    numero_serie VARCHAR(80) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Disponible', -- RN-02 y RN-03: Disponible, Prestado, En Mantenimiento, De Baja
    observaciones_tecnicas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipo_codigo_minimo CHECK (char_length(trim(codigo_patrimonial)) >= 4),
    CONSTRAINT chk_equipo_nombre_minimo CHECK (char_length(trim(nombre)) >= 3),
    CONSTRAINT chk_equipo_estado CHECK (estado IN ('Disponible', 'Prestado', 'En Mantenimiento', 'De Baja'))
);

-- 3. TABLA: prestamos
-- Control operativo de asignaciones de equipos (RF-09 a RF-12)
CREATE TABLE IF NOT EXISTS prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,                       -- RN-05: Responsable obligatorio
    equipo_id UUID NOT NULL,                        -- RN-01: Equipo asignado
    fecha_prestamo TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_esperada_devolucion TIMESTAMPTZ NOT NULL, -- Fecha límite programada
    fecha_devolucion TIMESTAMPTZ,                   -- Fecha real de retorno (null si sigue prestado)
    estado_prestamo VARCHAR(20) NOT NULL DEFAULT 'Activo', -- Activo, Devuelto, Vencido
    motivo_prestamo VARCHAR(250) NOT NULL,
    observacion_entrega TEXT,                       -- Estado en el que se entrega el equipo
    observacion_devolucion TEXT,                    -- RN-10: Obligatoria al registrar la devolución
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Integridad referencial con RN-06: No se pueden eliminar registros con historial de préstamos
    CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_prestamo_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT,
    -- RN-04: Fecha devolución posterior o igual a la fecha de préstamo
    CONSTRAINT chk_prestamo_fechas CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_prestamo),
    CONSTRAINT chk_prestamo_fecha_esperada CHECK (fecha_esperada_devolucion >= fecha_prestamo),
    CONSTRAINT chk_prestamo_estado CHECK (estado_prestamo IN ('Activo', 'Devuelto', 'Vencido'))
);

-- Índices para optimización de consultas de salida y KPIs (Semanas 09-10)
CREATE INDEX IF NOT EXISTS idx_equipos_estado ON equipos(estado);
CREATE INDEX IF NOT EXISTS idx_equipos_categoria ON equipos(categoria);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado_prestamo);
CREATE INDEX IF NOT EXISTS idx_prestamos_usuario ON prestamos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_equipo ON prestamos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_fechas ON prestamos(fecha_prestamo, fecha_devolucion);
