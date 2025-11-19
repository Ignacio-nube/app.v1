import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/baseDatos';
import { Usuario, UsuarioCrear, UsuarioActualizar } from '../tipos/auth.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Obtener todos los usuarios con su rol
export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const [usuarios] = await pool.query<(Usuario & RowDataPacket)[]>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       ORDER BY u.nombre_usuario`
    );

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query<(Usuario & RowDataPacket)[]>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.id_usuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Crear nuevo usuario
export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_usuario, contraseña_usu, id_perfil }: UsuarioCrear = req.body;

    // Validar datos
    if (!nombre_usuario || !contraseña_usu || !id_perfil) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    // Verificar si el usuario ya existe
    const [usuariosExistentes] = await pool.query<RowDataPacket[]>(
      'SELECT id_usuario FROM USUARIO WHERE nombre_usuario = ?',
      [nombre_usuario]
    );

    if (usuariosExistentes.length > 0) {
      res.status(400).json({ error: 'El nombre de usuario ya existe' });
      return;
    }

    // Hashear contraseña
    const contraseñaHash = await bcrypt.hash(contraseña_usu, 10);

    // Insertar usuario
    const [resultado] = await pool.query<ResultSetHeader>(
      'INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil) VALUES (?, ?, ?)',
      [nombre_usuario, contraseñaHash, id_perfil]
    );

    // Obtener el usuario creado con su rol
    const [nuevoUsuario] = await pool.query<(Usuario & RowDataPacket)[]>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.id_usuario = ?`,
      [resultado.insertId]
    );

    res.status(201).json(nuevoUsuario[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_usuario, contraseña_usu, id_perfil }: UsuarioActualizar = req.body;

    // Verificar que el usuario existe
    const [usuarioExistente] = await pool.query<RowDataPacket[]>(
      'SELECT id_usuario FROM USUARIO WHERE id_usuario = ?',
      [id]
    );

    if (usuarioExistente.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Construir query dinámicamente
    const campos: string[] = [];
    const valores: any[] = [];

    if (nombre_usuario) {
      campos.push('nombre_usuario = ?');
      valores.push(nombre_usuario);
    }

    if (contraseña_usu) {
      const contraseñaHash = await bcrypt.hash(contraseña_usu, 10);
      campos.push('contraseña_usu = ?');
      valores.push(contraseñaHash);
    }

    if (id_perfil) {
      campos.push('id_perfil = ?');
      valores.push(id_perfil);
    }

    if (campos.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    valores.push(id);

    await pool.query(
      `UPDATE USUARIO SET ${campos.join(', ')} WHERE id_usuario = ?`,
      valores
    );

    // Obtener usuario actualizado
    const [usuarioActualizado] = await pool.query<(Usuario & RowDataPacket)[]>(
      `SELECT u.id_usuario, u.nombre_usuario, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.id_usuario = ?`,
      [id]
    );

    res.json(usuarioActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que no sea el mismo usuario
    if (req.usuario && req.usuario.id_usuario === parseInt(id)) {
      res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
      return;
    }

    const [resultado] = await pool.query<ResultSetHeader>(
      'DELETE FROM USUARIO WHERE id_usuario = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener todos los perfiles (roles)
export const obtenerPerfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const [perfiles] = await pool.query<RowDataPacket[]>(
      'SELECT id_perfil, rol FROM PERFIL ORDER BY rol'
    );

    res.json(perfiles);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
