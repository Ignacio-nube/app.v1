
import pool from './src/config/baseDatos';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
    try {
        const nombre_usuario = 'admin';
        const pass = 'admin123';

        console.log('Testing login for:', nombre_usuario);

        const [usuarios]: any = await pool.query(
            `SELECT u.id_usuario, u.nombre_usuario, u.contraseña_usu, u.id_perfil, p.rol
             FROM USUARIO u
             INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
             WHERE LOWER(u.nombre_usuario) = LOWER(?)`,
            [nombre_usuario]
        );

        console.log('Usuarios found:', usuarios.length);
        if (usuarios.length > 0) {
            console.log('User found:', usuarios[0]);
            const valid = await bcrypt.compare(pass, usuarios[0].contraseña_usu);
            console.log('Password valid:', valid);
            
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
            console.log('Token generated:', token);
        }

    } catch (err) {
        console.error('Error during test:', err);
    }
}

testLogin();
