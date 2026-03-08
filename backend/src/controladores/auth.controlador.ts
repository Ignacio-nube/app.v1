import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/baseDatos';
import { LoginCredenciales, LoginRespuesta, Usuario, JWTPayload } from '../tipos/auth.types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_usuario, contraseña_usu }: LoginCredenciales = req.body;

    if (!nombre_usuario || !contraseña_usu) {
      res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
      return;
    }

    const [users] = await pool.query<Usuario>(
      `SELECT u.id_usuario, u.nombre_usuario, u.contraseña_usu, u.id_perfil, p.rol
       FROM USUARIO u
       INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
       WHERE LOWER(u.nombre_usuario) = LOWER($1)`,
      [nombre_usuario]
    );

    if (users.length === 0) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    const user = users[0];

    const validPassword = await bcrypt.compare(contraseña_usu, user.contraseña_usu!);
    if (!validPassword) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    await pool.query(
      'INSERT INTO LOGIN (id_usuario, fecha_hora_acceso, estado_sesion) VALUES ($1, NOW(), $2)',
      [user.id_usuario, 'Activa']
    );

    const payload: JWTPayload = {
      id_usuario: user.id_usuario,
      nombre_usuario: user.nombre_usuario,
      id_perfil: user.id_perfil,
      rol: user.rol!
    };

    const secret = process.env.JWT_SECRET || 'secreto_por_defecto';
    const token = jwt.sign(payload, secret, { expiresIn: '8h' });

    const response: LoginRespuesta = {
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        id_perfil: user.id_perfil,
        rol: user.rol!
      }
    };

    res.json(response);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      mensaje: 'Error en el servidor',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado' });
      return;
    }

    await pool.query(
      `UPDATE LOGIN
       SET estado_sesion = 'Inactiva'
       WHERE id_login = (
         SELECT id_login FROM (
           SELECT id_login FROM LOGIN WHERE id_usuario = $1
           ORDER BY fecha_hora_acceso DESC LIMIT 1
         ) AS sub
       )`,
      [req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

export const verifySession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado' });
      return;
    }

    res.json({
      mensaje: 'Sesión válida',
      usuario: req.usuario
    });
  } catch (error) {
    console.error('Error en verifySession:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
