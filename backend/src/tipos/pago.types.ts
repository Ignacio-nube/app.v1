// Tipos para Cuota
export interface Cuota {
  id_cuota: number;
  id_venta: number;
  id_pago: number | null;
  numero_cuota: number;
  monto_cuota: number;
  fecha_vencimiento: Date;
  estado_cuota: 'Pendiente' | 'Pagada' | 'Vencida';
}

export interface CuotaConVenta extends Cuota {
  id_cliente: number;
  nombre_cliente: string;
  apell_cliente: string;
  total_venta: number;
  tipo_venta: string;
}

// Tipos para Tipo de Pago
export interface TipoPago {
  id_tipo_pago: number;
  descripcion: string;
}

// Tipos para Pago
export interface Pago {
  id_pago: number;
  id_venta: number;
  id_tipo_pago: number;
  fecha_pago: Date;
  monto: number;
  comprobante_pago: string | null;
  estado: string;
}

export interface PagoCrear {
  id_venta: number;
  id_tipo_pago: number;
  monto: number;
  comprobante_pago?: string;
  cuotas_a_pagar: number[]; // IDs de cuotas que se están pagando
}

export interface PagoCompleto extends Pago {
  descripcion_tipo_pago: string;
  cuotas_pagadas: Cuota[];
}
