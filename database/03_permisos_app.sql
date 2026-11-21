-- =====================================================================
-- TechAsset - Sistema de Gestión de Inventario y Préstamo de Equipos
-- Innovatech Solutions S.A.C.
-- Script 03: Creación de Rol y Permisos de Aplicación (Semana 11)
-- Principio de Menor Privilegio (PoLP): La app solo tiene acceso DML
-- =====================================================================

DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'techasset_app') THEN
      CREATE ROLE techasset_app WITH LOGIN PASSWORD 'TechAssetApp2026' NOSUPERUSER NOCREATEDB NOCREATEROLE;
   END IF;
END
$do$;

-- Otorgar permisos sobre la base de datos techassetdb
GRANT CONNECT ON DATABASE techassetdb TO techasset_app;
GRANT USAGE ON SCHEMA public TO techasset_app;

-- Otorgar permisos DML en tablas e índices/secuencias
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO techasset_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO techasset_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO techasset_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO techasset_app;
