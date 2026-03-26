import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Categoria, CategoriaCrear, CategoriaActualizar } from '../tipos/categoria.types';

const COLOR_VALIDOS = ['blue', 'purple', 'orange', 'teal', 'green', 'red', 'gray', 'cyan', 'pink', 'yellow'];

export const getCategorias = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [categorias] = await pool.query<Categoria[]>('SELECT * FROM CATEGORIAS ORDER BY nombre');
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CategoriaCrear = req.body;

    if (!data.nombre || !data.nombre.trim()) {
      res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      return;
    }

    const color = data.color ?? 'gray';
    if (!COLOR_VALIDOS.includes(color)) {
      res.status(400).json({ error: 'Color inválido', opciones: COLOR_VALIDOS });
      return;
    }

    const [inserted] = await pool.query<Categoria[]>(
      'INSERT INTO CATEGORIAS (nombre, color) VALUES (?, ?) RETURNING *',
      [data.nombre.trim(), color]
    );

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      return;
    }
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: CategoriaActualizar = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      if (!data.nombre.trim()) {
        res.status(400).json({ error: 'El nombre no puede estar vacío' });
        return;
      }
      fields.push('nombre = ?');
      values.push(data.nombre.trim());
    }

    if (data.color !== undefined) {
      if (!COLOR_VALIDOS.includes(data.color)) {
        res.status(400).json({ error: 'Color inválido', opciones: COLOR_VALIDOS });
        return;
      }
      fields.push('color = ?');
      values.push(data.color);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    const [, meta] = await pool.query<any[]>(
      `UPDATE CATEGORIAS SET ${fields.join(', ')} WHERE id_categoria = ?`,
      values
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    const [updated] = await pool.query<Categoria[]>(
      'SELECT * FROM CATEGORIAS WHERE id_categoria = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      return;
    }
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const [catRows] = await pool.query<Categoria[]>(
      'SELECT * FROM CATEGORIAS WHERE id_categoria = ?',
      [id]
    );

    if (catRows.length === 0) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    // Verificar que no haya productos usando esta categoría
    const [countRows] = await pool.query<{ total: number }[]>(
      'SELECT COUNT(*) as total FROM PRODUCTOS WHERE categoria = ?',
      [catRows[0].nombre]
    );

    const cantidad = Number(countRows[0].total);
    if (cantidad > 0) {
      res.status(409).json({
        error: `No se puede eliminar: hay ${cantidad} producto(s) en esta categoría`,
        cantidad,
      });
      return;
    }

    await pool.query('DELETE FROM CATEGORIAS WHERE id_categoria = ?', [id]);

    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
