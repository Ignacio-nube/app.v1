import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/baseDatos';
import { Usuario, UsuarioCrear, UsuarioActualizar } from '../tipos/auth.types';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [totalResult] = await pool.query<{ total: number }>('SELECT COUNT(*) as total FROM USUARIO');
    const total = totalResult[0].total;

    const [users] = await pool.query<Usuario>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       ORDER BY u.nombre_usuario
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );

    res.json({
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [users] = await pool.query<Usuario>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.id_usuario = ?`,
      [id]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_usuario, contraseña_usu, id_perfil }: UsuarioCrear = req.body;

    if (!nombre_usuario || !contraseña_usu || !id_perfil) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    const [existing] = await pool.query<any[]>(
      'SELECT id_usuario FROM USUARIO WHERE nombre_usuario = ?',
      [nombre_usuario]
    );

    if (existing.length > 0) {
      res.status(400).json({ error: 'El nombre de usuario ya existe' });
      return;
    }

    const passwordHash = await bcrypt.hash(contraseña_usu, 10);

    const [inserted] = await pool.query<Usuario>(
      'INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil) VALUES (?, ?, ?) RETURNING id_usuario, nombre_usuario, id_perfil',
      [nombre_usuario, passwordHash, id_perfil]
    );

    const [newUser] = await pool.query<Usuario>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.id_usuario = ?`,
      [inserted[0].id_usuario]
    );

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_usuario, contraseña_usu, id_perfil }: UsuarioActualizar = req.body;

    if (req.usuario?.rol !== 'Administrador' && req.usuario?.id_usuario !== parseInt(id)) {
      res.status(403).json({ error: 'No tienes permiso para editar este usuario' });
      return;
    }

    const [existing] = await pool.query<any[]>(
      'SELECT id_usuario FROM USUARIO WHERE id_usuario = ?',
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (nombre_usuario) {
      fields.push('nombre_usuario = ?');
      values.push(nombre_usuario);
    }

    if (contraseña_usu) {
      const passwordHash = await bcrypt.hash(contraseña_usu, 10);
      fields.push('contraseña_usu = ?');
      values.push(passwordHash);
    }

    if (id_perfil && req.usuario?.rol === 'Administrador') {
      fields.push('id_perfil = ?');
      values.push(id_perfil);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    await pool.query(
      `UPDATE USUARIO SET ${fields.join(', ')} WHERE id_usuario = ?`,
      values
    );

    const [updated] = await pool.query<Usuario>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.id_usuario = ?`,
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.usuario && req.usuario.id_usuario === parseInt(id)) {
      res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
      return;
    }

    const [, meta] = await pool.query<any[]>(
      'DELETE FROM USUARIO WHERE id_usuario = ?',
      [id]
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const obtenerPerfiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [profiles] = await pool.query<any>(
      'SELECT id_perfil, rol FROM PERFIL ORDER BY rol'
    );

    res.json(profiles);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
