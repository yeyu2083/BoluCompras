import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/bolucompras';

async function testConnection() {
    try {
        console.log('Intentando conectar a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB!');
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
    }
}

testConnection();
