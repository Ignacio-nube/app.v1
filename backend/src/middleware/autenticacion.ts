import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../tipos/auth.types';

// Extender el tipo Request de Express para incluir usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: JWTPayload;
    }
  }
}

export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ mensaje: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    const secreto = process.env.JWT_SECRET || 'secreto_por_defecto';

    const payload = jwt.verify(token, secreto) as JWTPayload;
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

// Middleware para verificar roles específicos
export const verificarRol = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado' });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ 
        mensaje: 'No tienes permisos para realizar esta acción',
        rol_requerido: rolesPermitidos,
        tu_rol: req.usuario.rol
      });
      return;
    }

    next();
  };
};

// Middleware para verificar que es Administrador
export const soloAdministrador = verificarRol('Administrador');

// Middleware para verificar que es Vendedor o Administrador
export const vendedorOAdmin = verificarRol('Vendedor', 'Administrador');

// Middleware para verificar que es Encargado de Stock o Administrador
export const encargadoStockOAdmin = verificarRol('Encargado de Stock', 'Administrador');
