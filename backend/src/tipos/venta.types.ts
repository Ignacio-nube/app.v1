// Tipos para Venta
export interface Venta {
  id_venta: number;
  id_cliente: number;
  id_usuario: number;
  fecha_venta: Date;
  total_venta: number;
  tipo_venta: 'Contado' | 'Credito';
  estado_vta: string;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  id_venta: number;
  id_productos: number;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaCrear {
  id_cliente: number;
  tipo_venta: 'Contado' | 'Credito';
  detalles: DetalleVentaCrear[];
  configuracion_cuotas?: ConfiguracionCuotas;
  id_tipo_pago?: number; // Para ventas al contado
}

export interface DetalleVentaCrear {
  id_productos: number;
  cantidad: number;
  precio_unitario: number;
}

export interface ConfiguracionCuotas {
  cantidad_cuotas: number;
  frecuencia: 'Semanal' | 'Mensual';
  fecha_primer_vencimiento: string; // ISO date string
}

export interface VentaCompleta extends Venta {
  nombre_cliente: string;
  apell_cliente: string;
  detalles: DetalleVentaConProducto[];
}

export interface DetalleVentaConProducto extends DetalleVenta {
  nombre_productos: string;
}
