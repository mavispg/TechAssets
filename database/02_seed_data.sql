-- =====================================================================
-- TechAsset – Sistema de Gestión de Inventario y Préstamo de Equipos
-- Innovatech Solutions S.A.C.
-- Script 02: Datos de Prueba Semilla
-- =====================================================================

TRUNCATE TABLE historial_movimientos CASCADE;
TRUNCATE TABLE prestamos CASCADE;
TRUNCATE TABLE equipos CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- 1. Usuarios: 5 usuarios (@innovatech.pe)
INSERT INTO usuarios (id, nombres, apellidos, correo, area, rol, activo, password_hash) VALUES
('a0000000-0000-0000-0000-000000000001', 'Fabián', 'Gómez', 'fabian.gomez@innovatech.pe', 'Tecnologías de Información', 'Administrador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000002', 'Valeria', 'Rios Mendoza', 'valeria.rios@innovatech.pe', 'Soporte Técnico', 'Responsable de Tecnología', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000003', 'Carlos', 'Mendoza Sánchez', 'carlos.mendoza@innovatech.pe', 'Desarrollo de Software', 'Colaborador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000004', 'Lucía', 'Fernández Vega', 'lucia.fernandez@innovatech.pe', 'Diseño UX/UI', 'Colaborador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10))),
('a0000000-0000-0000-0000-000000000005', 'Rodrigo', 'Paredes Castro', 'rodrigo.paredes@innovatech.pe', 'Desarrollo de Software', 'Colaborador', TRUE, crypt('TechAsset2026!', gen_salt('bf', 10)));

-- 2. Equipos: 10 equipos
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

-- 3. Préstamos: 5 préstamos para colaboradores
INSERT INTO prestamos (id, usuario_id, equipo_id, fecha_prestamo, fecha_esperada_devolucion, fecha_devolucion, estado_prestamo, motivo_prestamo, observacion_entrega, observacion_devolucion) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '7 days', NULL, 'Activo', 'Desarrollo de módulos core del sistema TechAsset', 'Entregado con cargador original y maletín corporativo', NULL),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '8 days', NULL, 'Activo', 'Diseño y prototipado de interfaces en alta fidelidad', 'Entregado con adaptador de corriente MagSafe y funda protectora', NULL),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 days', NULL, 'Pendiente', 'Extensión de pantalla para pruebas de integración', 'Solicitud pendiente de aprobación por Soporte TI', NULL),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Devuelto', 'Demostración del prototipo ante el comité directivo', 'Cables HDMI y control remoto incluidos', 'RN-10: Equipo devuelto en perfectas condiciones operativas y con todos sus accesorios'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Devuelto', 'Validación de experiencia de usuario en dispositivos táctiles', 'Incluye Apple Pencil de 2da generación', 'RN-10: Devolución conforme, pantalla intacta y lápiz sincronizado');

-- 4. Movimientos
INSERT INTO historial_movimientos (id, equipo_id, usuario_id, tipo_movimiento, estado_anterior, estado_nuevo, motivo, fecha_movimiento) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado para presentación', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Devolucion', 'Prestado', 'Disponible', 'Devolución conforme de proyector', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado de tablet', CURRENT_TIMESTAMP - INTERVAL '20 days'),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 'Devolucion', 'Prestado', 'Disponible', 'Devolución conforme de tablet', CURRENT_TIMESTAMP - INTERVAL '14 days'),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado: Laptop Dell Latitude 5420', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Prestamo', 'Disponible', 'Prestado', 'Préstamo aprobado: MacBook Pro 14 M2 Pro', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', NULL, 'CambioEstado', 'Disponible', 'En Mantenimiento', 'RN-02: En revisión técnica por recalentamiento', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000010', NULL, 'CambioEstado', 'Disponible', 'De Baja', 'RN-03: Tarjeta madre dañada definitivamente', CURRENT_TIMESTAMP - INTERVAL '12 days');
