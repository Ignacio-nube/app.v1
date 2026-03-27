import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/baseDatos';
import { LoginCredenciales, LoginRespuesta, Usuario, JWTPayload, ForgotPasswordRequest, ResetPasswordRequest } from '../tipos/auth.types';
import { sendPasswordResetEmail } from '../config/email';

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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: ForgotPasswordRequest = req.body;

    if (!email) {
      res.status(400).json({ error: 'El email es requerido' });
      return;
    }

    const genericResponse = { message: 'Si el email existe, recibirás un correo en breve' };

    const [users] = await pool.query<Usuario>(
      'SELECT id_usuario, nombre_usuario, email_usuario FROM USUARIO WHERE LOWER(email_usuario) = LOWER(?)',
      [email]
    );

    if (users.length === 0) {
      res.json(genericResponse);
      return;
    }

    const user = users[0];
    const token = crypto.randomBytes(48).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      'UPDATE USUARIO SET reset_token = ?, reset_token_expiry = ? WHERE id_usuario = ?',
      [token, expiry, user.id_usuario]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email_usuario!, resetUrl);

    res.json(genericResponse);
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, nueva_contraseña }: ResetPasswordRequest = req.body;

    if (!token || !nueva_contraseña) {
      res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
      return;
    }

    if (nueva_contraseña.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const [users] = await pool.query<Usuario>(
      'SELECT id_usuario FROM USUARIO WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      res.status(400).json({ error: 'Token inválido o expirado' });
      return;
    }

    const passwordHash = await bcrypt.hash(nueva_contraseña, 10);

    await pool.query(
      'UPDATE USUARIO SET contraseña_usu = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id_usuario = ?',
      [passwordHash, users[0].id_usuario]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
