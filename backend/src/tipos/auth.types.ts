// Tipos para Perfil (Roles)
export interface Perfil {
  id_perfil: number;
  rol: string;
}

// Tipos para Usuario
export interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  contraseña_usu?: string; // Opcional para no enviar al frontend
  email_usuario?: string;
  id_perfil: number;
  rol?: string; // Agregado por JOIN con PERFIL
}

export interface UsuarioCrear {
  nombre_usuario: string;
  contraseña_usu: string;
  id_perfil: number;
  email_usuario?: string;
}

export interface UsuarioActualizar {
  nombre_usuario?: string;
  contraseña_usu?: string;
  id_perfil?: number;
  email_usuario?: string;
}

// Tipos para recuperación de contraseña
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  nueva_contraseña: string;
}

// Tipos para Login
export interface Login {
  id_login: number;
  id_usuario: number;
  fecha_hora_acceso: Date;
  estado_sesion: string;
}

export interface LoginCredenciales {
  nombre_usuario: string;
  contraseña_usu: string;
}

export interface LoginRespuesta {
  mensaje: string;
  token: string;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    id_perfil: number;
    rol: string;
  };
}

// Tipos para JWT Payload
export interface JWTPayload {
  id_usuario: number;
  nombre_usuario: string;
  id_perfil: number;
  rol: string;
}
