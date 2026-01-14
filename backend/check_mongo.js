require('dotenv').config();
const mongoose = require('mongoose');

console.log('Diagnóstico de conexión MongoDB...');
console.log('Intentando conectar a:', process.env.MONGODB_URI.split('@')[1]); // Log only the host part for security

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        console.log('✅ ÉXITO: Conexión a MongoDB establecida correctamente.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR: No se pudo conectar a MongoDB.');
        console.error('Detalles del error:', error.message);

        if (error.message.includes('bad auth')) {
            console.error('👉 Posible causa: Usuario o contraseña incorrectos en .env');
        } else if (error.message.includes('querySrv ETIMEOUT')) {
            console.error('👉 Posible causa: Problema de DNS o bloqueo de red (Firewall/ISP).');
        } else if (error.message.includes('connection timed out')) {
            console.error('👉 Posible causa: Tu IP no está en la Whitelist de MongoDB Atlas.');
        }

        process.exit(1);
    }
};

connectDB();
