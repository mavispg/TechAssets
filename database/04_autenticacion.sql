-- =====================================================================
-- TechAsset - 04_autenticacion.sql
-- Almacenamiento seguro de contraseñas con bcrypt (costo 10)
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(200) NOT NULL DEFAULT '';

-- Acceso de prueba con bcrypt costo 10: contraseña 'TechAsset2026!'
UPDATE usuarios
SET password_hash = crypt('TechAsset2026!', gen_salt('bf', 10))
WHERE password_hash = '' OR password_hash IS NULL;
