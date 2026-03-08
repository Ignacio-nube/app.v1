import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../tipos/auth.types';

declare global {
  namespace Express {
    interface Request {
      usuario?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ mensaje: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'secreto_por_defecto';

    const payload = jwt.verify(token, secret) as JWTPayload;
    req.usuario = payload;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ mensaje: 'Token expirado' });
      return;
    }
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.usuario.rol)) {
      res.status(403).json({
        mensaje: 'No tienes permisos para realizar esta acción',
        rol_requerido: allowedRoles,
        tu_rol: req.usuario.rol
      });
      return;
    }

    next();
  };
};

export const adminOnly = requireRole('Administrador');
export const salesOrAdmin = requireRole('Vendedor', 'Administrador');
export const stockOrAdmin = requireRole('Encargado de Stock', 'Administrador');
