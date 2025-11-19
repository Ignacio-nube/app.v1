USE `SISTEMA_VENTAS`;

-- Insertar roles por defecto
INSERT INTO PERFIL (rol) VALUES 
  ('Administrador'),
  ('Vendedor'),
  ('Encargado de Stock');

-- Insertar tipos de pago por defecto
INSERT INTO TIPOS_PAGO (descripcion) VALUES 
  ('Efectivo'),
  ('Tarjeta de Débito'),
  ('Tarjeta de Crédito'),
  ('Transferencia Bancaria');

-- Para crear el usuario administrador, ejecutar el script: crear-usuario-admin.ps1
