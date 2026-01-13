-- Estructura consolidada para PostgreSQL
-- Este archivo reemplaza db.sql y las migraciones anteriores

-- Limpiar esquema public (Opcional, usar con cuidado)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;

-- ENUMS
DO $$ BEGIN
    CREATE TYPE tipo_venta_enum AS ENUM ('Contado', 'Credito');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TABLAS

CREATE TABLE IF NOT EXISTS PERFIL (
  id_perfil SERIAL PRIMARY KEY,
  rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS USUARIO (
  id_usuario SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
  contraseña_usu VARCHAR(255) NOT NULL,
  id_perfil INT NOT NULL,
  CONSTRAINT fk_usuario_perfil FOREIGN KEY (id_perfil) REFERENCES PERFIL(id_perfil)
);

CREATE TABLE IF NOT EXISTS LOGIN (
  id_login SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha_hora_acceso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado_sesion VARCHAR(20) NOT NULL,
  CONSTRAINT fk_login_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

CREATE TABLE IF NOT EXISTS CLIENTE (
  id_cliente SERIAL PRIMARY KEY,
  nombre_cliente VARCHAR(100) NOT NULL,
  apell_cliente VARCHAR(100) NOT NULL,
  dni_cliente VARCHAR(20) NOT NULL UNIQUE,
  telefono_cliente VARCHAR(50),
  mail_cliente VARCHAR(100),
  direccion_cliente VARCHAR(255),
  estado_cliente VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS PROVEEDORES (
  id_proveedor SERIAL PRIMARY KEY,
  nombre_prov VARCHAR(100) NOT NULL,
  contacto_prov VARCHAR(100),
  direccion_prov VARCHAR(255),
  estado_prov VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS PRODUCTOS (
  id_productos SERIAL PRIMARY KEY,
  nombre_productos VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  precio_contado NUMERIC(10,2) NOT NULL,
  precio_credito NUMERIC(10,2) NOT NULL,
  estado_productos VARCHAR(20) NOT NULL DEFAULT 'Activo',
  id_proveedor INT,
  CONSTRAINT fk_productos_proveedor FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor)
);

CREATE TABLE IF NOT EXISTS VENTA (
  id_venta SERIAL PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha_venta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_venta NUMERIC(10,2) NOT NULL,
  tipo_venta tipo_venta_enum NOT NULL,
  estado_vta VARCHAR(50) NOT NULL,
  porcentaje_interes NUMERIC(5,2) DEFAULT 0.00,
  total_con_interes NUMERIC(10,2),
  CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
  CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- Indice para optimización
CREATE INDEX IF NOT EXISTS idx_venta_tipo_interes ON VENTA(tipo_venta, porcentaje_interes);

CREATE TABLE IF NOT EXISTS DETALLE_VENTA (
  id_detalle_venta SERIAL PRIMARY KEY,
  id_venta INT NOT NULL,
  id_productos INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_detalle_venta_venta FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_venta_producto FOREIGN KEY (id_productos) REFERENCES PRODUCTOS(id_productos)
);

CREATE TABLE IF NOT EXISTS COMPRA (
  id_compra SERIAL PRIMARY KEY,
  id_proveedor INT NOT NULL,
  fecha_compra TIMESTAMP WITH TIME ZONE NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor)
);

CREATE TABLE IF NOT EXISTS DETALLE_COMPRA (
  id_det_compr SERIAL PRIMARY KEY,
  id_compra INT NOT NULL,
  id_productos INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unit NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_detalle_compra_compra FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_compra_producto FOREIGN KEY (id_productos) REFERENCES PRODUCTOS(id_productos)
);

CREATE TABLE IF NOT EXISTS PAGO_PROVEEDOR (
  id_pago_prov SERIAL PRIMARY KEY,
  id_compra INT NOT NULL,
  fecha_pago DATE NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  CONSTRAINT fk_pago_proveedor_compra FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra)
);

CREATE TABLE IF NOT EXISTS DEVOLUCION_VENTA (
  id_devolucion SERIAL PRIMARY KEY,
  id_venta INT NOT NULL,
  motivo TEXT,
  fecha_dev DATE NOT NULL,
  CONSTRAINT fk_devolucion_venta FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta)
);

CREATE TABLE IF NOT EXISTS DETALLE_DEV_VENTA (
  id_detalle_dev SERIAL PRIMARY KEY,
  id_devolucion INT NOT NULL,
  id_productos INT NOT NULL,
  cantidad INT NOT NULL,
  observacion TEXT,
  CONSTRAINT fk_detalle_dev_devolucion FOREIGN KEY (id_devolucion) REFERENCES DEVOLUCION_VENTA(id_devolucion) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_dev_producto FOREIGN KEY (id_productos) REFERENCES PRODUCTOS(id_productos)
);

CREATE TABLE IF NOT EXISTS TIPOS_PAGO (
  id_tipo_pago SERIAL PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS PAGO (
  id_pago SERIAL PRIMARY KEY,
  id_venta INT NOT NULL,
  id_tipo_pago INT NOT NULL,
  fecha_pago DATE NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  comprobante_pago VARCHAR(255),
  estado VARCHAR(50) NOT NULL,
  CONSTRAINT fk_pago_venta FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta),
  CONSTRAINT fk_pago_tipo FOREIGN KEY (id_tipo_pago) REFERENCES TIPOS_PAGO(id_tipo_pago)
);

CREATE TABLE IF NOT EXISTS CUOTAS (
  id_cuota SERIAL PRIMARY KEY,
  id_venta INT NOT NULL,
  id_pago INT NULL,
  numero_cuota INT NOT NULL,
  monto_cuota NUMERIC(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado_cuota VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  CONSTRAINT fk_cuotas_venta FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta) ON DELETE CASCADE,
  CONSTRAINT fk_cuotas_pago FOREIGN KEY (id_pago) REFERENCES PAGO(id_pago) ON DELETE SET NULL
);
