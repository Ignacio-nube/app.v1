DROP DATABASE IF EXISTS `SISTEMA_VENTAS`;
CREATE DATABASE `SISTEMA_VENTAS` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `SISTEMA_VENTAS`;

CREATE TABLE PERFIL (
  id_perfil INT AUTO_INCREMENT PRIMARY KEY,
  rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE USUARIO (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
  contraseña_usu VARCHAR(255) NOT NULL,
  id_perfil INT NOT NULL,
  FOREIGN KEY (id_perfil) REFERENCES PERFIL(id_perfil)
);

CREATE TABLE LOGIN (
  id_login INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha_hora_acceso DATETIME NOT NULL,
  estado_sesion VARCHAR(20) NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

CREATE TABLE CLIENTE (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(100) NOT NULL,
  apell_cliente VARCHAR(100) NOT NULL,
  DNI_cliente VARCHAR(20) NOT NULL UNIQUE,
  telefono_cliente VARCHAR(50),
  mail_cliente VARCHAR(100),
  direccion_cliente VARCHAR(255),
  estado_cliente VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE PROVEEDORES (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre_prov VARCHAR(100) NOT NULL,
  contacto_prov VARCHAR(100),
  direccion_prov VARCHAR(255),
  estado_prov VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE PRODUCTOS (
  id_productos INT AUTO_INCREMENT PRIMARY KEY,
  nombre_productos VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  precio_contado DECIMAL(10,2) NOT NULL,
  precio_credito DECIMAL(10,2) NOT NULL,
  estado_productos VARCHAR(20) NOT NULL DEFAULT 'Activo',
  id_proveedor INT,
  FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor)
);

CREATE TABLE VENTA (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha_venta DATETIME NOT NULL,
  total_venta DECIMAL(10,2) NOT NULL,
  tipo_venta ENUM('Contado', 'Credito') NOT NULL,
  estado_vta VARCHAR(50) NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
  FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

CREATE TABLE DETALLE_VENTA (
  id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_productos INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta) ON DELETE CASCADE,
  FOREIGN KEY (id_productos) REFERENCES PRODUCTOS(id_productos)
);

CREATE TABLE COMPRA (
  id_compra INT AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT NOT NULL,
  fecha_compra DATETIME NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor)
);

CREATE TABLE DETALLE_COMPRA (
  id_det_compr INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT NOT NULL,
  id_productos INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra) ON DELETE CASCADE,
  FOREIGN KEY (id_productos) REFERENCES PRODUCTOS(id_productos)
);

CREATE TABLE PAGO_PROVEEDOR (
  id_pago_prov INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT NOT NULL,
  fecha_pago DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  FOREIGN KEY (id_compra) REFERENCES COMPRA(id_compra)
);

CREATE TABLE DEVOLUCION_VENTA (
  id_devolucion INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  motivo TEXT,
  fecha_dev DATE NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta)
);

CREATE TABLE DETALLE_DEV_VENTA (
  id_detalle_dev INT AUTO_INCREMENT PRIMARY KEY,
  id_devolucion INT NOT NULL,
  id_productos INT NOT NULL,
  cantidad INT NOT NULL,
  observacion TEXT,
  FOREIGN KEY (id_devolucion) REFERENCES DEVOLUCION_VENTA(id_devolucion) ON DELETE CASCADE,
  FOREIGN KEY (id_productos) REFERENCES PRODUCTOS(id_productos)
);

CREATE TABLE TIPOS_PAGO (
  id_tipo_pago INT AUTO_INCREMENT PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE PAGO (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_tipo_pago INT NOT NULL,
  fecha_pago DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  comprobante_pago VARCHAR(255),
  estado VARCHAR(50) NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta),
  FOREIGN KEY (id_tipo_pago) REFERENCES TIPOS_PAGO(id_tipo_pago)
);

CREATE TABLE CUOTAS (
  id_cuota INT AUTO_INCREMENT PRIMARY KEY,
  id_venta INT NOT NULL,
  id_pago INT NULL,
  numero_cuota INT NOT NULL,
  monto_cuota DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado_cuota VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  FOREIGN KEY (id_venta) REFERENCES VENTA(id_venta) ON DELETE CASCADE,
  FOREIGN KEY (id_pago) REFERENCES PAGO(id_pago) ON DELETE SET NULL
);

