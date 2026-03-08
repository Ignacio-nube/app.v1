-- Datos de prueba e inicialización
-- Ejecutar después de estructura.sql

-- 1. Insertar Perfiles (Roles)
INSERT INTO PERFIL (id_perfil, rol) VALUES 
  (1, 'Administrador'),
  (2, 'Vendedor'),
  (3, 'Encargado de Stock')
ON CONFLICT (id_perfil) DO UPDATE SET rol = EXCLUDED.rol;
-- Nota: Usamos id explícito para asegurar que Admin sea 1

-- 2. Insertar Tipos de Pago
INSERT INTO TIPOS_PAGO (descripcion) VALUES 
  ('Efectivo'),
  ('Tarjeta de Débito'),
  ('Tarjeta de Crédito'),
  ('Transferencia Bancaria')
ON CONFLICT DO NOTHING;

-- 3. Insertar Usuario Administrador
-- Usuario: admin
-- Contraseña: admin123
-- Hash generado con bcrypt: $2a$10$HWVzXCvwBCtcCTHEzz7aWeEDFS7Hk9Sfd1DyTu6g1.lCF8tg/RWXC
INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil)
VALUES ('admin', '$2a$10$HWVzXCvwBCtcCTHEzz7aWeEDFS7Hk9Sfd1DyTu6g1.lCF8tg/RWXC', 1)
ON CONFLICT (nombre_usuario) 
DO UPDATE SET 
  contraseña_usu = EXCLUDED.contraseña_usu,
  id_perfil = EXCLUDED.id_perfil;

-- 4. Insertar Usuario Vendedor de prueba
INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil)
VALUES ('vendedor', '$2a$10$HWVzXCvwBCtcCTHEzz7aWeEDFS7Hk9Sfd1DyTu6g1.lCF8tg/RWXC', 2)
ON CONFLICT (nombre_usuario) DO NOTHING;

-- 5. Insertar Proveedor de prueba
INSERT INTO PROVEEDORES (nombre_prov, contacto_prov, direccion_prov) VALUES 
('Muebles del Sur', 'Juan Perez', 'Av. Siempre Viva 123'),
('Madera Fina S.A.', 'Ana Gomez', 'Calle Roble 456');

-- 6. Insertar Productos de prueba
-- Asegurarse de que los proveedores existan (Ids 1 y 2 si es autoincremental fresco, o usar subqueries si es necesario)
-- Aquí asumimos IDs seriales que empiezan en 1 si la tabla estaba vacía.
INSERT INTO PRODUCTOS (nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito, id_proveedor) VALUES 
('Silla de Pino', 'Silla resistente de madera de pino', 'Sillas', 50, 1500.00, 1800.00, 1),
('Mesa de Comedor', 'Mesa para 6 personas', 'Mesas', 10, 12000.00, 15000.00, 1),
('Sillón 2 Cuerpos', 'Sillón cómodo tapizado en tela', 'Sillones', 5, 25000.00, 30000.00, 2);

-- 7. Insertar Cliente de prueba
INSERT INTO CLIENTE (nombre_cliente, apell_cliente, dni_cliente, telefono_cliente, mail_cliente, direccion_cliente) VALUES 
('Carlos', 'Lopez', '12345678', '555-1234', 'carlos@example.com', 'Calle Falsa 123');
