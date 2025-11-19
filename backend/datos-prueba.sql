-- ================================================================
-- Script de Datos de Prueba para Sistema de Ventas CentroHogar
-- ================================================================
USE SISTEMA_VENTAS;

-- Limpiar datos existentes (excepto usuarios y perfiles)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM CUOTAS;
DELETE FROM PAGO;
DELETE FROM DETALLE_DEV_VENTA;
DELETE FROM DEVOLUCION_VENTA;
DELETE FROM PAGO_PROVEEDOR;
DELETE FROM DETALLE_COMPRA;
DELETE FROM COMPRA;
DELETE FROM DETALLE_VENTA;
DELETE FROM VENTA;
DELETE FROM PRODUCTOS;
DELETE FROM PROVEEDORES;
DELETE FROM CLIENTE WHERE id_cliente > 0;
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- CLIENTES (30 clientes)
-- ================================================================
INSERT INTO CLIENTE (nombre_cliente, apell_cliente, DNI_cliente, telefono_cliente, mail_cliente, direccion_cliente, estado_cliente) VALUES
('Juan', 'Pérez', '20123456', '3512345678', 'juan.perez@email.com', 'Av. Colón 1234', 'Activo'),
('María', 'González', '27234567', '3513456789', 'maria.gonzalez@email.com', 'Calle San Martín 567', 'Activo'),
('Carlos', 'Rodríguez', '30345678', '3514567890', 'carlos.rodriguez@email.com', 'Bv. Las Heras 890', 'Activo'),
('Ana', 'Martínez', '33456789', '3515678901', 'ana.martinez@email.com', 'Av. Vélez Sarsfield 234', 'Activo'),
('Luis', 'López', '25567890', '3516789012', 'luis.lopez@email.com', 'Calle Duarte Quirós 456', 'Activo'),
('Laura', 'Fernández', '28678901', '3517890123', 'laura.fernandez@email.com', 'Av. Hipólito Yrigoyen 789', 'Activo'),
('Roberto', 'García', '31789012', '3518901234', 'roberto.garcia@email.com', 'Calle Laprida 123', 'Activo'),
('Patricia', 'Sánchez', '29890123', '3519012345', 'patricia.sanchez@email.com', 'Bv. San Juan 345', 'Activo'),
('Diego', 'Ramírez', '32901234', '3510123456', 'diego.ramirez@email.com', 'Av. Rafael Núñez 678', 'Activo'),
('Silvia', 'Torres', '26012345', '3511234567', 'silvia.torres@email.com', 'Calle Belgrano 901', 'Activo'),
('Martín', 'Flores', '34123456', '3512345679', 'martin.flores@email.com', 'Av. Recta Martinoli 234', 'Activo'),
('Gabriela', 'Díaz', '22234567', '3513456780', 'gabriela.diaz@email.com', 'Calle Obispo Trejo 567', 'Activo'),
('Fernando', 'Romero', '35345678', '3514567891', 'fernando.romero@email.com', 'Bv. Chacabuco 890', 'Activo'),
('Claudia', 'Morales', '24456789', 'NULL', 'claudia.morales@email.com', 'Av. Sabattini 123', 'Activo'),
('Andrés', 'Castro', '36567890', '3516789013', 'andres.castro@email.com', 'Calle Humberto Primo 456', 'Bloqueado'),
('Valeria', 'Ruiz', '23678901', '3517890124', 'valeria.ruiz@email.com', 'Av. Gral. Paz 789', 'Activo'),
('Javier', 'Ortiz', '37789012', '3518901235', 'javier.ortiz@email.com', 'Calle Dean Funes 234', 'Activo'),
('Carolina', 'Vega', '21890123', '3519012346', 'carolina.vega@email.com', 'Bv. Illia 567', 'Activo'),
('Pablo', 'Herrera', '38901234', '3510123457', 'pablo.herrera@email.com', 'Av. Circunvalación 890', 'Activo'),
('Mónica', 'Silva', '27012345', '3511234568', 'monica.silva@email.com', 'Calle 9 de Julio 123', 'Activo'),
('Ricardo', 'Campos', '39123456', '3512345680', 'ricardo.campos@email.com', 'Av. Richieri 456', 'Activo'),
('Alejandra', 'Medina', '28234567', '3513456781', 'alejandra.medina@email.com', 'Calle Paso de los Andes 789', 'Activo'),
('Gustavo', 'Ríos', '40345678', '3514567892', 'gustavo.rios@email.com', 'Bv. Los Granaderos 234', 'Activo'),
('Natalia', 'Navarro', '26456789', '3515678903', 'natalia.navarro@email.com', 'Av. Donato Álvarez 567', 'Activo'),
('Eduardo', 'Gutiérrez', '41567890', '3516789014', 'eduardo.gutierrez@email.com', 'Calle Ituzaingó 890', 'Activo'),
('Verónica', 'Molina', '29678901', '3517890125', 'veronica.molina@email.com', 'Av. Poeta Lugones 123', 'Bloqueado'),
('Sergio', 'Vargas', '42789012', '3518901236', 'sergio.vargas@email.com', 'Calle Santa Rosa 456', 'Activo'),
('Sandra', 'Cabrera', '25890123', '3519012347', 'sandra.cabrera@email.com', 'Bv. Los Alemanes 789', 'Activo'),
('Daniel', 'Acosta', '43901234', '3510123458', 'daniel.acosta@email.com', 'Av. Monseñor Pablo Cabrera 234', 'Activo'),
('Liliana', 'Benitez', '24012345', '3511234569', 'liliana.benitez@email.com', 'Calle Rivera Indarte 567', 'Activo');

-- ================================================================
-- PROVEEDORES (8 proveedores)
-- ================================================================
INSERT INTO PROVEEDORES (nombre_prov, contacto_prov, direccion_prov, estado_prov) VALUES
('Muebles del Sur SA', '0351-4567890', 'Zona Industrial Ferreyra', 'Activo'),
('Electrohogar Mayorista', '0351-4678901', 'Av. Circunvalación Km 8', 'Activo'),
('Colchones Premium', '0351-4789012', 'Bv. Los Granaderos 2345', 'Activo'),
('Importadora ABC', '0351-4890123', 'Av. Donato Álvarez 1234', 'Activo'),
('Maderas y Diseño', '0351-4901234', 'Calle Rondeau 567', 'Activo'),
('TecnoElectro SRL', '0351-5012345', 'Zona Franca Córdoba', 'Activo'),
('Descanso Confort', '0351-5123456', 'Av. Recta Martinoli 3456', 'Activo'),
('Hogar y Estilo', '0351-5234567', 'Bv. San Juan 890', 'Bloqueado');

-- ================================================================
-- PRODUCTOS (50 productos variados)
-- ================================================================
-- MUEBLES (20 productos)
INSERT INTO PRODUCTOS (nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito) VALUES
('Juego de Living 3 piezas', 'Sofá 3 cuerpos + 2 sillones individuales en tela chenille', 'muebles', 15, 285000, 342000),
('Mesa de Comedor Extensible', 'Mesa de madera maciza 1.60m extensible a 2.00m', 'muebles', 8, 125000, 150000),
('Sillas Modernas x4', 'Set de 4 sillas tapizadas con patas de metal', 'muebles', 25, 68000, 81600),
('Rack para TV 55"', 'Mueble para TV con cajones y estantes', 'muebles', 12, 45000, 54000),
('Placard 3 puertas', 'Placard de melamina 2.40m alto x 1.80m ancho', 'muebles', 6, 195000, 234000),
('Cama Matrimonial 2 plazas', 'Sommier y respaldo tapizado', 'muebles', 10, 115000, 138000),
('Mesa de Luz x2', 'Par de mesas de luz con 2 cajones', 'muebles', 18, 32000, 38400),
('Escritorio Juvenil', 'Escritorio con cajonera incorporada', 'muebles', 14, 58000, 69600),
('Biblioteca 5 estantes', 'Estantería de melamina 1.80m alto', 'muebles', 9, 42000, 50400),
('Sillón Relax Reclinable', 'Sillón individual con mecanismo reclinable', 'muebles', 7, 95000, 114000),
('Mesa Ratona Moderna', 'Mesa de centro con vidrio templado', 'muebles', 20, 38000, 45600),
('Aparador Buffet', 'Mueble auxiliar con puertas y cajones', 'muebles', 5, 78000, 93600),
('Cama Cucheta', 'Cama marinera de pino con escalera', 'muebles', 4, 145000, 174000),
('Zapatera 2 puertas', 'Organizador de calzado con espejo', 'muebles', 11, 35000, 42000),
('Comoda 6 cajones', 'Cómoda para dormitorio en melamina', 'muebles', 8, 52000, 62400),
('Perchero de Pie', 'Perchero metálico con 8 ganchos', 'muebles', 22, 15000, 18000),
('Banqueta Cocina x2', 'Par de banquetas regulables en altura', 'muebles', 16, 28000, 33600),
('Espejo Grande Marco', 'Espejo decorativo 1.20m x 0.80m', 'muebles', 13, 22000, 26400),
('Mesa Auxiliar Redonda', 'Mesa redonda plegable 0.80m diámetro', 'muebles', 19, 18000, 21600),
('Repisa Flotante x3', 'Set de 3 repisas de diferentes tamaños', 'muebles', 30, 12000, 14400);

-- ELECTRODOMESTICOS (20 productos)
INSERT INTO PRODUCTOS (nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito) VALUES
('Heladera No Frost 330L', 'Heladera con freezer, clasificación A+', 'electrodomesticos', 5, 385000, 462000),
('Lavarropas Automático 7kg', 'Lavarropas carga frontal 1200rpm', 'electrodomesticos', 7, 295000, 354000),
('Aire Acondicionado 3500W', 'Split frío/calor inverter', 'electrodomesticos', 9, 425000, 510000),
('Smart TV 55" 4K', 'Televisor LED con sistema operativo Android', 'electrodomesticos', 12, 485000, 582000),
('Microondas 28L Digital', 'Microondas con grill y 10 niveles', 'electrodomesticos', 15, 68000, 81600),
('Cocina 4 Hornallas', 'Cocina a gas con horno eléctrico', 'electrodomesticos', 6, 255000, 306000),
('Secarropas 8kg', 'Secarropas con sensor de humedad', 'electrodomesticos', 4, 315000, 378000),
('Lavavajillas 12 Cubiertos', 'Lavavajillas con 6 programas de lavado', 'electrodomesticos', 3, 395000, 474000),
('Freezer Vertical 250L', 'Freezer con 6 cajones plásticos', 'electrodomesticos', 8, 285000, 342000),
('Ventilador de Pie', 'Ventilador 20" con control remoto', 'electrodomesticos', 25, 38000, 45600),
('Licuadora 1.5L', 'Licuadora con jarra de vidrio 5 velocidades', 'electrodomesticos', 18, 28000, 33600),
('Cafetera Express', 'Cafetera con molinillo integrado', 'electrodomesticos', 14, 95000, 114000),
('Plancha a Vapor', 'Plancha vertical con depósito 2L', 'electrodomesticos', 20, 42000, 50400),
('Aspiradora Robot', 'Aspiradora inteligente con mapeo', 'electrodomesticos', 6, 185000, 222000),
('Batidora de Mano', 'Minipimer con accesorios', 'electrodomesticos', 22, 32000, 38400),
('Tostadora 4 Ranuras', 'Tostadora de acero inoxidable', 'electrodomesticos', 17, 25000, 30000),
('Pava Eléctrica 2L', 'Pava de vidrio con luz LED', 'electrodomesticos', 28, 18000, 21600),
('Procesadora Alimentos', 'Procesadora multifunción 1000W', 'electrodomesticos', 11, 78000, 93600),
('Calefactor Turbo', 'Caloventor con termostato regulable', 'electrodomesticos', 16, 35000, 42000),
('Purificador de Aire', 'Purificador con filtro HEPA', 'electrodomesticos', 9, 125000, 150000);

-- COLCHONES (10 productos)
INSERT INTO PRODUCTOS (nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito) VALUES
('Colchón 2 Plazas Espuma', 'Colchón de espuma alta densidad 1.40x1.90m', 'colchones', 12, 85000, 102000),
('Colchón Resortes 2 Plazas', 'Colchón con resortes individuales', 'colchones', 10, 125000, 150000),
('Sommier 2 Plazas Completo', 'Base + colchón de resortes + respaldo', 'colchones', 8, 195000, 234000),
('Colchón 1 Plaza Juvenil', 'Colchón de espuma 0.90x1.90m', 'colchones', 15, 55000, 66000),
('Colchón King Size Pillow', 'Colchón pillow top premium 2.00x2.00m', 'colchones', 5, 285000, 342000),
('Colchón Viscoelástico', 'Colchón memory foam 1.40x1.90m', 'colchones', 7, 225000, 270000),
('Sommier 1 Plaza y Media', 'Base + colchón 1.10x1.90m', 'colchones', 9, 135000, 162000),
('Colchón Cuna 1.20x0.60m', 'Colchón de espuma para bebés', 'colchones', 18, 35000, 42000),
('Almohadas Viscoelásticas x2', 'Par de almohadas memory foam', 'colchones', 25, 22000, 26400),
('Protector de Colchón 2p', 'Funda impermeable acolchada', 'colchones', 30, 15000, 18000);

-- ================================================================
-- COMPRAS A PROVEEDORES (Después de insertar proveedores)
-- ================================================================
-- Primero obtenemos los IDs de los proveedores insertados
SET @prov1 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'Muebles del Sur SA');
SET @prov2 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'Electrohogar Mayorista');
SET @prov3 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'Colchones Premium');
SET @prov4 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'Importadora ABC');
SET @prov5 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'Maderas y Diseño');
SET @prov6 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'TecnoElectro SRL');
SET @prov7 = (SELECT id_proveedor FROM PROVEEDORES WHERE nombre_prov = 'Descanso Confort');

INSERT INTO COMPRA (id_proveedor, fecha_compra, total, estado) VALUES
(@prov1, '2025-09-15 10:30:00', 3450000, 'Completada'),
(@prov2, '2025-09-18 14:20:00', 5280000, 'Completada'),
(@prov3, '2025-09-22 09:15:00', 1850000, 'Completada'),
(@prov1, '2025-10-05 11:45:00', 2890000, 'Completada'),
(@prov4, '2025-10-10 16:30:00', 4120000, 'Completada'),
(@prov5, '2025-10-15 10:00:00', 1560000, 'Completada'),
(@prov2, '2025-10-20 13:30:00', 3850000, 'Completada'),
(@prov6, '2025-10-25 15:45:00', 2940000, 'Completada'),
(@prov3, '2025-11-01 09:30:00', 2150000, 'Completada'),
(@prov1, '2025-11-05 14:15:00', 3280000, 'Completada'),
(@prov7, '2025-11-08 11:20:00', 1890000, 'Completada'),
(@prov2, '2025-11-10 16:00:00', 4560000, 'Completada'),
(@prov4, '2025-11-12 10:45:00', 2780000, 'Completada'),
(@prov5, DATE_SUB(NOW(), INTERVAL 2 DAY), 1950000, 'Completada'),
(@prov6, DATE_SUB(NOW(), INTERVAL 1 DAY), 3120000, 'Completada');

-- ================================================================
-- DETALLE DE COMPRAS (muestras de algunas compras)
-- ================================================================
-- Obtener IDs dinámicamente
SET @compra1 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 1);
SET @compra2 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 1,1);
SET @compra3 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 2,1);

SET @prod1 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Juego de Living 3 piezas');
SET @prod2 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Mesa de Comedor Extensible');
SET @prod5 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Placard 3 puertas');
SET @prod21 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Heladera No Frost 330L');
SET @prod22 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Lavarropas Automático 7kg');
SET @prod24 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Smart TV 55" 4K');
SET @prod41 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Colchón 2 Plazas Espuma');
SET @prod42 = (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Colchón Resortes 2 Plazas');

INSERT INTO DETALLE_COMPRA (id_compra, id_productos, cantidad, precio_unit) VALUES
-- Compra 1 - Muebles
(@compra1, @prod1, 10, 250000),
(@compra1, @prod2, 8, 110000),
(@compra1, @prod5, 5, 170000),
-- Compra 2 - Electrodomésticos
(@compra2, @prod21, 5, 350000),
(@compra2, @prod22, 7, 260000),
(@compra2, @prod24, 10, 440000),
-- Compra 3 - Colchones
(@compra3, @prod41, 12, 75000),
(@compra3, @prod42, 10, 110000);

-- ================================================================
-- PAGOS A PROVEEDORES
-- ================================================================
-- Obtener IDs de compras dinámicamente
SET @c1 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 0,1);
SET @c2 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 1,1);
SET @c3 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 2,1);
SET @c4 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 3,1);
SET @c5 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 4,1);
SET @c6 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 5,1);
SET @c7 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 6,1);
SET @c8 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 7,1);
SET @c9 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 8,1);
SET @c10 = (SELECT id_compra FROM COMPRA ORDER BY id_compra LIMIT 9,1);

INSERT INTO PAGO_PROVEEDOR (id_compra, fecha_pago, monto, metodo_pago) VALUES
(@c1, '2025-09-15', 3450000, 'Transferencia'),
(@c2, '2025-09-18', 5280000, 'Cheque'),
(@c3, '2025-09-22', 1850000, 'Transferencia'),
(@c4, '2025-10-05', 2890000, 'Efectivo'),
(@c5, '2025-10-10', 4120000, 'Transferencia'),
(@c6, '2025-10-15', 1560000, 'Cheque'),
(@c7, '2025-10-20', 3850000, 'Transferencia'),
(@c8, '2025-10-25', 2940000, 'Transferencia'),
(@c9, '2025-11-01', 2150000, 'Efectivo'),
(@c10, '2025-11-05', 3280000, 'Transferencia');

-- ================================================================
-- VENTAS (40 ventas entre septiembre y noviembre 2025)
-- ================================================================
-- Obtener IDs de clientes dinámicamente
SET @cli1 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 0,1);
SET @cli2 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 1,1);
SET @cli3 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 2,1);
SET @cli4 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 3,1);
SET @cli5 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 4,1);
SET @cli6 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 5,1);
SET @cli7 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 6,1);
SET @cli8 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 7,1);
SET @cli9 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 8,1);
SET @cli10 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 9,1);
SET @cli11 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 10,1);
SET @cli12 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 11,1);
SET @cli21 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 20,1);
SET @cli22 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 21,1);
SET @cli23 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 22,1);
SET @cli24 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 23,1);
SET @cli25 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 24,1);
SET @cli26 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 25,1);
SET @cli27 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 26,1);
SET @cli28 = (SELECT id_cliente FROM CLIENTE ORDER BY id_cliente LIMIT 27,1);

INSERT INTO VENTA (id_cliente, fecha_venta, total_venta, tipo_venta, estado_vta) VALUES
-- Septiembre 2025
(@cli1, '2025-09-20 10:15:00', 542400, 'Credito', 'Completada'),
(@cli2, '2025-09-21 14:30:00', 285000, 'Contado', 'Completada'),
(@cli3, '2025-09-23 11:45:00', 756000, 'Credito', 'Completada'),
(@cli4, '2025-09-25 16:20:00', 195000, 'Contado', 'Completada'),
(@cli5, '2025-09-26 09:30:00', 462000, 'Credito', 'Completada'),
(@cli6, '2025-09-28 13:15:00', 125000, 'Contado', 'Completada'),
(@cli7, '2025-09-29 15:45:00', 582000, 'Credito', 'Completada'),
(@cli8, '2025-09-30 10:00:00', 342000, 'Contado', 'Completada'),
-- Octubre 2025
(@cli9, '2025-10-02 11:30:00', 678000, 'Credito', 'Completada'),
(@cli10, '2025-10-05 14:15:00', 234000, 'Contado', 'Completada'),
(@cli11, '2025-10-07 16:45:00', 510000, 'Credito', 'Completada'),
(@cli12, '2025-10-09 09:20:00', 150000, 'Contado', 'Completada'),
(@cli3, '2025-10-12 13:30:00', 894000, 'Credito', 'Completada'),
(@cli4, '2025-10-15 10:45:00', 378000, 'Contado', 'Completada'),
(@cli5, '2025-10-17 15:10:00', 426000, 'Credito', 'Completada'),
(@cli6, '2025-10-19 11:25:00', 306000, 'Contado', 'Completada'),
(@cli7, '2025-10-22 14:40:00', 744000, 'Credito', 'Completada'),
(@cli8, '2025-10-24 16:55:00', 222000, 'Contado', 'Completada'),
(@cli9, '2025-10-26 10:10:00', 558000, 'Credito', 'Completada'),
(@cli10, '2025-10-28 13:35:00', 174000, 'Contado', 'Completada'),
-- Noviembre 2025
(@cli21, '2025-11-01 09:15:00', 612000, 'Credito', 'Completada'),
(@cli22, '2025-11-03 14:20:00', 270000, 'Contado', 'Completada'),
(@cli23, '2025-11-05 11:40:00', 828000, 'Credito', 'Completada'),
(@cli24, '2025-11-06 15:50:00', 198000, 'Contado', 'Completada'),
(@cli25, '2025-11-07 10:25:00', 486000, 'Credito', 'Completada'),
(@cli1, '2025-11-08 13:45:00', 342000, 'Contado', 'Completada'),
(@cli2, '2025-11-09 16:10:00', 714000, 'Credito', 'Completada'),
(@cli3, '2025-11-10 09:35:00', 258000, 'Contado', 'Completada'),
(@cli4, '2025-11-11 12:50:00', 534000, 'Credito', 'Completada'),
(@cli5, '2025-11-12 15:15:00', 390000, 'Contado', 'Completada'),
-- Últimos días (ventas pendientes de pago)
(@cli6, DATE_SUB(NOW(), INTERVAL 5 DAY), 876000, 'Credito', 'Completada'),
(@cli7, DATE_SUB(NOW(), INTERVAL 4 DAY), 318000, 'Contado', 'Completada'),
(@cli8, DATE_SUB(NOW(), INTERVAL 3 DAY), 642000, 'Credito', 'Completada'),
(@cli9, DATE_SUB(NOW(), INTERVAL 2 DAY), 294000, 'Contado', 'Completada'),
(@cli10, DATE_SUB(NOW(), INTERVAL 1 DAY), 768000, 'Credito', 'Completada'),
(@cli11, NOW(), 402000, 'Contado', 'Completada'),
(@cli12, NOW(), 954000, 'Credito', 'Completada'),
(@cli26, NOW(), 186000, 'Contado', 'Completada'),
(@cli27, NOW(), 618000, 'Credito', 'Completada'),
(@cli28, NOW(), 450000, 'Contado', 'Completada');

-- ================================================================
-- DETALLE DE VENTAS (muestras representativas)
-- ================================================================
-- Obtener IDs de ventas dinámicamente
SET @v1 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 0,1);
SET @v2 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 1,1);
SET @v3 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 2,1);
SET @v4 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 3,1);
SET @v5 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 4,1);
SET @v10 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 9,1);
SET @v15 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 14,1);
SET @v20 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 19,1);
SET @v25 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 24,1);
SET @v30 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 29,1);

INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario) VALUES
-- Venta 1 - Living + TV
(@v1, @prod1, 1, 342000),
(@v1, @prod2, 1, 54000),
(@v1, @prod24, 1, 582000),
-- Venta 2 - Mesa comedor
(@v2, @prod2, 1, 150000),
(@v2, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Sillas Modernas x4'), 1, 81600),
-- Venta 3 - Dormitorio completo
(@v3, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Cama Matrimonial 2 plazas'), 1, 138000),
(@v3, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Mesa de Luz x2'), 1, 38400),
(@v3, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Comoda 6 cajones'), 1, 62400),
(@v3, @prod41, 1, 102000),
(@v3, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Almohadas Viscoelásticas x2'), 1, 26400),
-- Venta 4 - Placard
(@v4, @prod5, 1, 234000),
-- Venta 5 - Electrodomésticos
(@v5, @prod21, 1, 462000),
-- Venta 10 - Productos varios
(@v10, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Biblioteca 5 estantes'), 1, 50400),
(@v10, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Repisa Flotante x3'), 2, 14400),
(@v10, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Ventilador de Pie'), 1, 45600),
(@v10, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Plancha a Vapor'), 2, 33600),
-- Venta 15 - Living
(@v15, @prod1, 1, 342000),
(@v15, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Mesa Ratona Moderna'), 1, 45600),
(@v15, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Calefactor Turbo'), 1, 45600),
-- Venta 20 - Colchones
(@v20, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Sommier 2 Plazas Completo'), 1, 234000),
-- Venta 25 - Cocina y accesorios
(@v25, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Cocina 4 Hornallas'), 1, 306000),
(@v25, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Licuadora 1.5L'), 1, 81600),
(@v25, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Batidora de Mano'), 1, 50400),
-- Venta 30 - Aire acondicionado
(@v30, (SELECT id_productos FROM PRODUCTOS WHERE nombre_productos = 'Aire Acondicionado 3500W'), 1, 510000);

-- ================================================================
-- PAGOS (algunos pagos completos y parciales)
-- ================================================================
SET @v6 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 5,1);
SET @v7 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 6,1);
SET @v8 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 7,1);
SET @v9 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 8,1);
SET @v11 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 10,1);
SET @v12 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 11,1);
SET @v13 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 12,1);
SET @v14 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 13,1);
SET @v16 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 15,1);
SET @v18 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 17,1);

INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, comprobante_pago, estado) VALUES
-- Ventas de contado (pagos completos)
(@v2, 1, '2025-09-21', 285000, 'REC-001', 'Completado'),
(@v4, 1, '2025-09-25', 195000, 'REC-002', 'Completado'),
(@v6, 2, '2025-09-28', 125000, 'TRANS-001', 'Completado'),
(@v8, 1, '2025-09-30', 342000, 'REC-003', 'Completado'),
(@v10, 1, '2025-10-05', 234000, 'REC-004', 'Completado'),
(@v12, 2, '2025-10-09', 150000, 'TRANS-002', 'Completado'),
(@v14, 1, '2025-10-15', 378000, 'REC-005', 'Completado'),
(@v16, 1, '2025-10-19', 306000, 'REC-006', 'Completado'),
(@v18, 2, '2025-10-24', 222000, 'TRANS-003', 'Completado'),
(@v20, 1, '2025-10-28', 174000, 'REC-007', 'Completado'),
-- Ventas a crédito (pagos parciales)
(@v1, 1, '2025-09-20', 135600, 'REC-008', 'Parcial'),
(@v1, 1, '2025-10-20', 135600, 'REC-009', 'Parcial'),
(@v3, 1, '2025-09-23', 189000, 'REC-010', 'Parcial'),
(@v3, 1, '2025-10-23', 189000, 'REC-011', 'Parcial'),
(@v5, 2, '2025-09-26', 115500, 'TRANS-004', 'Parcial'),
(@v5, 2, '2025-10-26', 115500, 'TRANS-005', 'Parcial'),
(@v7, 1, '2025-09-29', 145500, 'REC-012', 'Parcial'),
(@v9, 2, '2025-10-02', 169500, 'TRANS-006', 'Parcial'),
(@v11, 1, '2025-10-07', 127500, 'REC-013', 'Parcial'),
(@v13, 2, '2025-10-12', 223500, 'TRANS-007', 'Parcial');

-- ================================================================
-- CUOTAS (para ventas a crédito)
-- ================================================================
-- Obtener IDs de pagos dinámicamente
SET @p11 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 10,1);
SET @p12 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 11,1);
SET @p13 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 12,1);
SET @p14 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 13,1);
SET @p15 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 14,1);
SET @p16 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 15,1);
SET @p17 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 16,1);
SET @p18 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 17,1);
SET @p19 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 18,1);
SET @p20 = (SELECT id_pago FROM PAGO ORDER BY id_pago LIMIT 19,1);

SET @v17 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 16,1);
SET @v19 = (SELECT id_venta FROM VENTA ORDER BY id_venta LIMIT 18,1);

INSERT INTO CUOTAS (id_venta, id_pago, numero_cuota, monto_cuota, fecha_vencimiento, estado_cuota) VALUES
-- Venta 1 (4 cuotas)
(@v1, @p11, 1, 135600, '2025-10-20', 'Pagada'),
(@v1, @p12, 2, 135600, '2025-11-20', 'Pagada'),
(@v1, NULL, 3, 135600, '2025-12-20', 'Pendiente'),
(@v1, NULL, 4, 135600, '2026-01-20', 'Pendiente'),
-- Venta 3 (4 cuotas)
(@v3, @p13, 1, 189000, '2025-10-23', 'Pagada'),
(@v3, @p14, 2, 189000, '2025-11-23', 'Pagada'),
(@v3, NULL, 3, 189000, '2025-12-23', 'Pendiente'),
(@v3, NULL, 4, 189000, '2026-01-23', 'Pendiente'),
-- Venta 5 (4 cuotas)
(@v5, @p15, 1, 115500, '2025-10-26', 'Pagada'),
(@v5, @p16, 2, 115500, '2025-11-26', 'Pagada'),
(@v5, NULL, 3, 115500, '2025-12-26', 'Pendiente'),
(@v5, NULL, 4, 115500, '2026-01-26', 'Pendiente'),
-- Venta 7 (4 cuotas)
(@v7, @p17, 1, 145500, '2025-10-29', 'Pagada'),
(@v7, NULL, 2, 145500, '2025-11-29', 'Pendiente'),
(@v7, NULL, 3, 145500, '2025-12-29', 'Pendiente'),
(@v7, NULL, 4, 145500, '2026-01-29', 'Pendiente'),
-- Venta 9 (4 cuotas)
(@v9, @p18, 1, 169500, '2025-11-02', 'Pagada'),
(@v9, NULL, 2, 169500, '2025-12-02', 'Pendiente'),
(@v9, NULL, 3, 169500, '2026-01-02', 'Pendiente'),
(@v9, NULL, 4, 169500, '2026-02-02', 'Pendiente'),
-- Venta 11 (4 cuotas)
(@v11, @p19, 1, 127500, '2025-11-07', 'Pagada'),
(@v11, NULL, 2, 127500, '2025-12-07', 'Pendiente'),
(@v11, NULL, 3, 127500, '2026-01-07', 'Pendiente'),
(@v11, NULL, 4, 127500, '2026-02-07', 'Pendiente'),
-- Venta 13 (4 cuotas)
(@v13, @p20, 1, 223500, '2025-11-12', 'Pagada'),
(@v13, NULL, 2, 223500, '2025-12-12', 'Pendiente'),
(@v13, NULL, 3, 223500, '2026-01-12', 'Pendiente'),
(@v13, NULL, 4, 223500, '2026-02-12', 'Pendiente'),
-- Venta 15 (3 cuotas - vencidas)
(@v15, NULL, 1, 142000, '2025-11-17', 'Vencida'),
(@v15, NULL, 2, 142000, '2025-12-17', 'Pendiente'),
(@v15, NULL, 3, 142000, '2026-01-17', 'Pendiente'),
-- Venta 17 (6 cuotas)
(@v17, NULL, 1, 124000, '2025-11-22', 'Vencida'),
(@v17, NULL, 2, 124000, '2025-12-22', 'Pendiente'),
(@v17, NULL, 3, 124000, '2026-01-22', 'Pendiente'),
(@v17, NULL, 4, 124000, '2026-02-22', 'Pendiente'),
(@v17, NULL, 5, 124000, '2026-03-22', 'Pendiente'),
(@v17, NULL, 6, 124000, '2026-04-22', 'Pendiente'),
-- Venta 19 (3 cuotas)
(@v19, NULL, 1, 186000, '2025-11-26', 'Pendiente'),
(@v19, NULL, 2, 186000, '2025-12-26', 'Pendiente'),
(@v19, NULL, 3, 186000, '2026-01-26', 'Pendiente');

-- ================================================================
-- RESUMEN DE DATOS INSERTADOS
-- ================================================================
SELECT 'CLIENTES' as Tabla, COUNT(*) as Total FROM CLIENTE
UNION ALL
SELECT 'PROVEEDORES', COUNT(*) FROM PROVEEDORES
UNION ALL
SELECT 'PRODUCTOS', COUNT(*) FROM PRODUCTOS
UNION ALL
SELECT 'COMPRAS', COUNT(*) FROM COMPRA
UNION ALL
SELECT 'VENTAS', COUNT(*) FROM VENTA
UNION ALL
SELECT 'PAGOS', COUNT(*) FROM PAGO
UNION ALL
SELECT 'CUOTAS', COUNT(*) FROM CUOTAS;

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
