-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas usando DELETE en lugar de TRUNCATE para evitar problemas de FK
DELETE FROM DETALLE_VENTA;
ALTER TABLE DETALLE_VENTA AUTO_INCREMENT = 1;

DELETE FROM CUOTAS;
ALTER TABLE CUOTAS AUTO_INCREMENT = 1;

DELETE FROM PAGO;
ALTER TABLE PAGO AUTO_INCREMENT = 1;

DELETE FROM VENTA;
ALTER TABLE VENTA AUTO_INCREMENT = 1;

DELETE FROM PRODUCTOS;
ALTER TABLE PRODUCTOS AUTO_INCREMENT = 1;

DELETE FROM PROVEEDORES;
ALTER TABLE PROVEEDORES AUTO_INCREMENT = 1;

DELETE FROM CLIENTE;
ALTER TABLE CLIENTE AUTO_INCREMENT = 1;

DELETE FROM LOGIN;
ALTER TABLE LOGIN AUTO_INCREMENT = 1;

DELETE FROM USUARIO;
ALTER TABLE USUARIO AUTO_INCREMENT = 1;

DELETE FROM PERFIL;
ALTER TABLE PERFIL AUTO_INCREMENT = 1;

DELETE FROM TIPOS_PAGO;
ALTER TABLE TIPOS_PAGO AUTO_INCREMENT = 1;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insertar Perfiles
INSERT INTO PERFIL (id_perfil, rol) VALUES 
(1, 'Administrador'),
(2, 'Vendedor'),
(3, 'Encargado de Stock');

-- 2. Insertar Usuarios (Contraseña por defecto: '123456' hasheada con bcrypt)
-- Nota: En un entorno real, estas contraseñas deben generarse con la aplicación para tener el hash correcto.
-- Aquí usaremos un hash de ejemplo de bcrypt para '123456': $2b$10$5u.qj.X/z.X/z.X/z.X/z.X/z.X/z.X/z.X/z.X/z.X/z.X/z.X/z
INSERT INTO USUARIO (id_usuario, nombre_usuario, contraseña_usu, id_perfil) VALUES 
(1, 'admin', '$2b$10$P.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m', 1),
(2, 'vendedor1', '$2b$10$P.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m', 2),
(3, 'vendedor2', '$2b$10$P.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m', 2),
(4, 'stock1', '$2b$10$P.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m.t.m', 3);

-- 3. Insertar Proveedores
INSERT INTO PROVEEDORES (id_proveedor, nombre_prov, contacto_prov, direccion_prov, estado_prov) VALUES 
(1, 'Samsung Electronics', 'contacto@samsung.com', 'Av. Corrientes 1234, CABA', 'Activo'),
(2, 'LG Argentina', 'ventas@lg.com.ar', 'Calle Falsa 123, Cordoba', 'Activo'),
(3, 'Muebles del Norte', 'info@mueblesnorte.com', 'Ruta 9 Km 50, Tucuman', 'Activo'),
(4, 'Distribuidora Global', 'pedidos@global.com', 'Parque Industrial, Rosario', 'Activo');

-- 4. Insertar Productos
INSERT INTO PRODUCTOS (id_productos, nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito, estado_productos, id_proveedor) VALUES 
(1, 'Smart TV 50" 4K', 'Televisor Samsung 50 pulgadas 4K UHD', 'Electronica', 15, 450000.00, 550000.00, 'Activo', 1),
(2, 'Heladera No Frost', 'Heladera LG Inverter 300L Plateada', 'Electrodomesticos', 8, 850000.00, 1000000.00, 'Activo', 2),
(3, 'Lavarropas Automático', 'Lavarropas Samsung 8kg Carga Frontal', 'Electrodomesticos', 12, 600000.00, 720000.00, 'Activo', 1),
(4, 'Juego de Comedor', 'Mesa de algarrobo con 6 sillas', 'Muebles', 5, 350000.00, 420000.00, 'Activo', 3),
(5, 'Sillón 3 Cuerpos', 'Sillón chenille gris premium', 'Muebles', 4, 400000.00, 480000.00, 'Activo', 3),
(6, 'Aire Acondicionado', 'Split LG 3000 Frigorías Frio/Calor', 'Climatizacion', 20, 550000.00, 660000.00, 'Activo', 2);

-- 5. Insertar Clientes
INSERT INTO CLIENTE (id_cliente, nombre_cliente, apell_cliente, DNI_cliente, telefono_cliente, mail_cliente, direccion_cliente, estado_cliente) VALUES 
(1, 'Juan', 'Perez', '30123456', '3814123456', 'juan.perez@email.com', 'San Martin 400', 'Activo'),
(2, 'Maria', 'Gonzalez', '28987654', '3815987654', 'maria.g@email.com', 'Belgrano 200', 'Activo'),
(3, 'Carlos', 'Rodriguez', '35678901', '3816543210', 'carlos.r@email.com', 'Mitre 800', 'Activo'),
(4, 'Ana', 'Lopez', '40111222', '3813334444', 'ana.lopez@email.com', 'Sarmiento 150', 'Activo');

-- 6. Insertar Tipos de Pago
INSERT INTO TIPOS_PAGO (id_tipo_pago, descripcion) VALUES 
(1, 'Efectivo'),
(2, 'Tarjeta de Débito'),
(3, 'Tarjeta de Crédito'),
(4, 'Transferencia');

-- 7. Insertar Ventas (Históricas)

-- Venta 1: Contado, Vendedor 1, Cliente 1
INSERT INTO VENTA (id_venta, id_cliente, id_usuario, fecha_venta, total_venta, tipo_venta, estado_vta) VALUES 
(1, 1, 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 450000.00, 'Contado', 'Completada');

INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario) VALUES 
(1, 1, 1, 450000.00);

INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, estado) VALUES 
(1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), 450000.00, 'Aprobado');


-- Venta 2: Crédito, Vendedor 2, Cliente 2
INSERT INTO VENTA (id_venta, id_cliente, id_usuario, fecha_venta, total_venta, tipo_venta, estado_vta) VALUES 
(2, 2, 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 1000000.00, 'Credito', 'Completada');

INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario) VALUES 
(2, 2, 1, 1000000.00);

-- Cuotas para Venta 2 (3 cuotas)
INSERT INTO CUOTAS (id_venta, numero_cuota, monto_cuota, fecha_vencimiento, estado_cuota) VALUES 
(2, 1, 333333.33, DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 1 MONTH), 'Pendiente'),
(2, 2, 333333.33, DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 2 MONTH), 'Pendiente'),
(2, 3, 333333.34, DATE_ADD(DATE_SUB(NOW(), INTERVAL 5 DAY), INTERVAL 3 MONTH), 'Pendiente');


-- Venta 3: Contado, Vendedor 1, Cliente 3
INSERT INTO VENTA (id_venta, id_cliente, id_usuario, fecha_venta, total_venta, tipo_venta, estado_vta) VALUES 
(3, 3, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), 750000.00, 'Contado', 'Completada');

INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario) VALUES 
(3, 4, 1, 350000.00),
(3, 5, 1, 400000.00);

INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, estado) VALUES 
(3, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), 750000.00, 'Aprobado');


-- Venta 4: Contado, Admin, Cliente 4
INSERT INTO VENTA (id_venta, id_cliente, id_usuario, fecha_venta, total_venta, tipo_venta, estado_vta) VALUES 
(4, 4, 1, NOW(), 550000.00, 'Contado', 'Completada');

INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario) VALUES 
(4, 6, 1, 550000.00);

INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, estado) VALUES 
(4, 2, NOW(), 550000.00, 'Aprobado');
