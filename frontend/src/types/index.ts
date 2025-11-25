// ============================================
// TIPOS DE AUTENTICACIÓN
// ============================================
export interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  id_perfil: number;
  rol: 'Administrador' | 'Vendedor' | 'Encargado de Stock';
  contraseña_usu?: string;
}

export interface LoginCredenciales {
  nombre_usuario: string;
  contraseña_usu: string;
}

export interface LoginRespuesta {
  mensaje: string;
  token: string;
  usuario: Usuario;
}

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (credenciales: LoginCredenciales) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// ============================================
// TIPOS DE CLIENTES
// ============================================
export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  apell_cliente: string;
  DNI_cliente: string;
  telefono_cliente?: string;
  mail_cliente?: string;
  direccion_cliente?: string;
  estado_cliente: 'Activo' | 'Bloqueado' | 'Inactivo';
}

export interface ClienteConDeuda extends Cliente {
  tiene_deuda: boolean;
  total_deuda: number;
  cuotas_vencidas: number;
}

export interface ClienteFormData {
  nombre_cliente: string;
  apell_cliente: string;
  DNI_cliente: string;
  telefono_cliente?: string;
  mail_cliente?: string;
  direccion_cliente?: string;
}

// ============================================
// TIPOS DE PRODUCTOS
// ============================================
export interface Producto {
  id_productos: number;
  nombre_productos: string;
  descripcion?: string;
  categoria: 'muebles' | 'electrodomesticos' | 'colchones';
  stock: number;
  precio_contado: number;
  precio_credito: number;
  estado_productos: 'Activo' | 'Inactivo';
  id_proveedor?: number;
}

export interface ProductoFormData {
  nombre_productos: string;
  descripcion?: string;
  categoria: 'muebles' | 'electrodomesticos' | 'colchones';
  stock: number;
  precio_contado: number;
  precio_credito: number;
  id_proveedor?: number;
}

// ============================================
// TIPOS DE PROVEEDORES
// ============================================
export interface Proveedor {
  id_proveedor: number;
  nombre_prov: string;
  contacto_prov: string;
  direccion_prov: string;
  estado_prov: 'Activo' | 'Inactivo';
}

// ============================================
// TIPOS DE VENTAS
// ============================================
export interface Venta {
  id_venta: number;
  id_cliente: number;
  fecha_venta: string;
  total_venta: number;
  tipo_venta: 'Contado' | 'Credito';
  estado_vta: string;
  nombre_cliente?: string;
  apell_cliente?: string;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  id_venta: number;
  id_productos: number;
  cantidad: number;
  precio_unitario: number;
  nombre_productos?: string;
}

export interface VentaConDetalles extends Venta {
  detalles: DetalleVenta[];
}

export interface VentaCrear {
  id_cliente: number;
  tipo_venta: 'Contado' | 'Credito';
  detalles: {
    id_productos: number;
    cantidad: number;
    precio_unitario: number;
  }[];
  configuracion_cuotas?: {
    cantidad_cuotas: number;
    frecuencia: 'Semanal' | 'Mensual';
    fecha_primer_vencimiento: string;
  };
}

// ============================================
// TIPOS DE PAGOS Y CUOTAS
// ============================================
export interface TipoPago {
  id_tipo_pago: number;
  descripcion: string;
}

export interface Pago {
  id_pago: number;
  id_venta: number;
  id_tipo_pago: number;
  fecha_pago: string;
  monto: number;
  comprobante_pago?: string;
  estado: string;
}

export interface Cuota {
  id_cuota: number;
  id_venta: number;
  id_pago?: number;
  numero_cuota: number;
  monto_cuota: number;
  fecha_vencimiento: string;
  estado_cuota: 'Pendiente' | 'Vencida' | 'Pagada';
  tipo_venta?: 'Contado' | 'Credito';
  nombre_cliente?: string;
  apell_cliente?: string;
  DNI_cliente?: string;
}

export interface PagoCrear {
  id_venta: number;
  id_tipo_pago: number;
  monto: number;
  comprobante_pago?: string;
  cuotas_a_pagar: number[];
}

export interface PagoHistorial {
  id_pago: number;
  id_venta: number;
  id_tipo_pago: number;
  fecha_pago: string;
  monto: number;
  comprobante_pago?: string;
  estado: string;
  descripcion_tipo_pago: string;
  id_cliente: number;
  total_venta: number;
  tipo_venta: 'Contado' | 'Credito';
  nombre_cliente: string;
  apell_cliente: string;
  cuotas_pagadas: number;
}

// ============================================
// TIPOS DE REPORTES Y DASHBOARD
// ============================================
export interface VentasMes {
  total_ventas: number;
  cantidad_ventas: number;
}

export interface VentaDia {
  fecha: string;
  cantidad: number;
  total: number;
}

export interface DashboardData {
  ventas_mes: VentasMes;
  clientes_deuda: number;
  productos_stock_bajo: number;
  total_usuarios: number;
  ventas_ultimos_dias: VentaDia[];
  cuotas_hoy: Cuota[];
}

export interface ClienteMoroso {
  id_cliente: number;
  nombre_cliente: string;
  apell_cliente: string;
  DNI_cliente: string;
  telefono_cliente?: string;
  total_deuda: number;
  cuotas_vencidas: number;
  dias_atraso: number;
}

export interface ReporteVentas {
  periodo: string;
  total_ventas: number;
  cantidad_ventas: number;
  ventas_contado: number;
  ventas_credito: number;
}

export interface CategoriaInventario {
  categoria: string;
  total_productos: number;
  total_stock: number;
  valor_inventario_contado: number;
  valor_inventario_credito: number;
  productos_stock_bajo: number;
}

export interface ProductoMasVendido {
  id_productos: number;
  nombre_productos: string;
  categoria: string;
  total_vendido: number;
  total_ingresos: number;
}

export interface ReporteInventario {
  por_categoria: CategoriaInventario[];
  mas_vendidos: ProductoMasVendido[];
}

export interface MovimientoFlujo {
  fecha: string;
  tipo: string;
  total: number;
}

export interface ResumenFlujo {
  total_ingresos: number;
  total_egresos: number;
  saldo: number;
}

export interface ReporteFlujo {
  ingresos: MovimientoFlujo[];
  egresos: MovimientoFlujo[];
  resumen: ResumenFlujo;
}

// ============================================
// TIPOS DE PERFIL
// ============================================
export interface Perfil {
  id_perfil: number;
  rol: string;
}
