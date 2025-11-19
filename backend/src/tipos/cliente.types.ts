// Tipos para Cliente
export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  apell_cliente: string;
  DNI_cliente: string;
  telefono_cliente: string | null;
  mail_cliente: string | null;
  direccion_cliente: string | null;
  estado_cliente: 'Activo' | 'Bloqueado';
}

export interface ClienteCrear {
  nombre_cliente: string;
  apell_cliente: string;
  DNI_cliente: string;
  telefono_cliente?: string;
  mail_cliente?: string;
  direccion_cliente?: string;
  estado_cliente?: 'Activo' | 'Bloqueado';
}

export interface ClienteActualizar {
  nombre_cliente?: string;
  apell_cliente?: string;
  DNI_cliente?: string;
  telefono_cliente?: string;
  mail_cliente?: string;
  direccion_cliente?: string;
  estado_cliente?: 'Activo' | 'Bloqueado';
}

export interface ClienteConDeuda extends Cliente {
  tiene_deuda: boolean;
  total_deuda: number;
  cuotas_vencidas: number;
}
