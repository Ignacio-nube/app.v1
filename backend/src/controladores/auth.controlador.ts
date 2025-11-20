import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/baseDatos';
import { LoginCredenciales, LoginRespuesta, Usuario, JWTPayload } from '../tipos/auth.types';
import { RowDataPacket } from 'mysql2';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_usuario, contraseña_usu }: LoginCredenciales = req.body;

    // Validar datos
    if (!nombre_usuario || !contraseña_usu) {
      res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
      return;
    }

    // Buscar usuario con su rol
    const [usuarios] = await pool.query<(Usuario & RowDataPacket)[]>(
      `SELECT u.id_usuario, u.nombre_usuario, u.contraseña_usu, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE u.nombre_usuario = ?`,
      [nombre_usuario]
    );

    if (usuarios.length === 0) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña_usu, usuario.contraseña_usu!);
    if (!contraseñaValida) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    // Registrar login en la tabla LOGIN
    await pool.query(
      'INSERT INTO LOGIN (id_usuario, fecha_hora_acceso, estado_sesion) VALUES (?, NOW(), ?)',
      [usuario.id_usuario, 'Activa']
    );

    // Generar token JWT con expiración de 8 horas
    const payload: JWTPayload = {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      id_perfil: usuario.id_perfil,
      rol: usuario.rol!
    };

    const secreto = process.env.JWT_SECRET || 'secreto_por_defecto';
    const token = jwt.sign(payload, secreto, { expiresIn: '8h' });

    // Respuesta
    const respuesta: LoginRespuesta = {
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        id_perfil: usuario.id_perfil,
        rol: usuario.rol!
      }
    };

    res.json(respuesta);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado' });
      return;
    }

    // Actualizar el último login a estado Inactiva
    await pool.query(
      `UPDATE LOGIN 
       SET estado_sesion = 'Inactiva' 
       WHERE id_usuario = ? 
       ORDER BY fecha_hora_acceso DESC 
       LIMIT 1`,
      [req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

export const verificarSesion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado' });
      return;
    }

    // Devolver información del usuario actual
    res.json({
      mensaje: 'Sesión válida',
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Error en verificarSesion:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
