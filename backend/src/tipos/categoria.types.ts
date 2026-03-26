export interface Categoria {
  id_categoria: number;
  nombre: string;
  color: string;
}

export interface CategoriaCrear {
  nombre: string;
  color?: string;
}

export interface CategoriaActualizar {
  nombre?: string;
  color?: string;
}
