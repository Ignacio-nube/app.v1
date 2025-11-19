import pool from './src/config/baseDatos';
import bcrypt from 'bcryptjs';

const crearAdmin = async () => {
  try {
    console.log('Iniciando creación de usuario administrador...');

    // 1. Configuración del usuario
    const nombreUsuario = 'admin';
    const passwordPlano = 'admin123'; // Cambia esto por la contraseña deseada
    const idPerfilAdmin = 1; // ID para 'Administrador' según insertar.sql

    // 2. Verificar si ya existe
    const [existente]: any = await pool.query(
      'SELECT id_usuario FROM USUARIO WHERE nombre_usuario = ?',
      [nombreUsuario]
    );

    if (existente.length > 0) {
      console.log('⚠️ El usuario administrador ya existe.');
      process.exit(0);
    }

    // 3. Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlano, salt);

    // 4. Insertar usuario
    await pool.query(
      'INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil) VALUES (?, ?, ?)',
      [nombreUsuario, passwordHash, idPerfilAdmin]
    );

    console.log('✅ Usuario administrador creado exitosamente.');
    console.log(`Usuario: ${nombreUsuario}`);
    console.log(`Contraseña: ${passwordPlano}`);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    // Cerrar conexión
    await pool.end();
  }
};

crearAdmin();
