import pool from './src/config/baseDatos';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const crearAdmin = async () => {
  try {
    console.log('Iniciando creación de usuario administrador...');

    // 1. Configuración del usuario (permite override vía variables de entorno)
    const nombreUsuario = (process.env.ADMIN_USER || 'admin').trim();
    const passwordPlano = (process.env.ADMIN_PASSWORD || 'admin123').trim();
    const idPerfilAdmin = Number(process.env.ADMIN_PROFILE_ID || 1);

    if (!nombreUsuario || !passwordPlano) {
      console.error('❌ ADMIN_USER y ADMIN_PASSWORD no pueden estar vacíos.');
      return;
    }

    // 2. Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlano, salt);

    // 3. Verificar si ya existe
    const [existente]: any = await pool.query(
      'SELECT id_usuario FROM USUARIO WHERE nombre_usuario = ?',
      [nombreUsuario]
    );

    if (existente.length > 0) {
      await pool.query(
        'UPDATE USUARIO SET contraseña_usu = ?, id_perfil = ? WHERE nombre_usuario = ?',
        [passwordHash, idPerfilAdmin, nombreUsuario]
      );
      console.log(`🔁 Usuario administrador "${nombreUsuario}" actualizado. Contraseña regenerada.`);
    } else {
      await pool.query(
        'INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil) VALUES (?, ?, ?)',
        [nombreUsuario, passwordHash, idPerfilAdmin]
      );
      console.log(`✅ Usuario administrador "${nombreUsuario}" creado.`);
    }

    console.log(`Contraseña configurada: ${passwordPlano}`);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    // Cerrar conexión
    await pool.end();
  }
};

crearAdmin();
