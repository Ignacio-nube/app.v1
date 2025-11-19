// Tipos para Producto
export interface Producto {
  id_productos: number;
  nombre_productos: string;
  descripcion: string | null;
  categoria: 'muebles' | 'electrodomesticos' | 'colchones';
  stock: number;
  precio_contado: number;
  precio_credito: number;
  estado_productos: 'Activo' | 'Inactivo';
}

export interface ProductoCrear {
  nombre_productos: string;
  descripcion?: string;
  categoria: 'muebles' | 'electrodomesticos' | 'colchones';
  stock: number;
  precio_contado: number;
  precio_credito: number;
  estado_productos?: 'Activo' | 'Inactivo';
}

export interface ProductoActualizar {
  nombre_productos?: string;
  descripcion?: string;
  categoria?: 'muebles' | 'electrodomesticos' | 'colchones';
  stock?: number;
  precio_contado?: number;
  precio_credito?: number;
  estado_productos?: 'Activo' | 'Inactivo';
}
