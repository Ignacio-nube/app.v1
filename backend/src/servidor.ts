import dotenv from 'dotenv';
import app from './app';
import { verificarConexion } from './config/baseDatos';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Verificar conexión a la base de datos
    const conexionExitosa = await verificarConexion();
    
    if (!conexionExitosa) {
      console.error('❌ No se pudo conectar a la base de datos. Abortando inicio del servidor.');
      process.exit(1);
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('\n🚀 ===================================');
      console.log(`   Servidor iniciado exitosamente`);
      console.log(`   Puerto: ${PORT}`);
      console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log('===================================\n');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

// Iniciar
iniciarServidor();

export default app;
