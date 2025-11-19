export interface Proveedor {
  id_proveedor: number;
  nombre_prov: string;
  contacto_prov: string | null;
  direccion_prov: string | null;
  estado_prov: 'Activo' | 'Inactivo';
}

export interface ProveedorCrear {
  nombre_prov: string;
  contacto_prov?: string;
  direccion_prov?: string;
  estado_prov?: 'Activo' | 'Inactivo';
}

export interface ProveedorActualizar {
  nombre_prov?: string;
  contacto_prov?: string;
  direccion_prov?: string;
  estado_prov?: 'Activo' | 'Inactivo';
}
