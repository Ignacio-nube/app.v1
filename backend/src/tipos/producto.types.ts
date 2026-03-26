// Tipos para Producto
export interface Producto {
  id_productos: number;
  nombre_productos: string;
  descripcion: string | null;
  categoria: string;
  stock: number;
  precio_contado: number;
  estado_productos: 'Activo' | 'Inactivo';
  id_proveedor?: number;
}

export interface ProductoCrear {
  nombre_productos: string;
  descripcion?: string;
  categoria: string;
  stock: number;
  precio_contado: number;
  estado_productos?: 'Activo' | 'Inactivo';
  id_proveedor?: number;
}

export interface ProductoActualizar {
  nombre_productos?: string;
  descripcion?: string;
  categoria?: 'Dormitorio' | 'Living' | 'Comedor' | 'Oficina' | 'Accesorios';
  stock?: number;
  precio_contado?: number;
  estado_productos?: 'Activo' | 'Inactivo';
  id_proveedor?: number;
}
