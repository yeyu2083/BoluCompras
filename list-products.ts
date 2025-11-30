import mongoose from 'mongoose';
import Product from './src/models/Product';

const MONGODB_URI = 'mongodb://localhost:27017/bolucompras';

async function listProducts() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado exitosamente\n');

        const products = await Product.find({}).sort({ createdAt: -1 });

        console.log(`📦 Total de productos: ${products.length}\n`);
        console.log('='.repeat(80));

        if (products.length === 0) {
            console.log('⚠️  No hay productos en la base de datos');
        } else {
            products.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name}`);
                console.log(`   ID: ${product._id}`);
                console.log(`   Precio: ${product.precio ? `$${product.precio}` : 'No definido'}`);
                console.log(`   Cantidad: ${product.quantity}`);
                console.log(`   Cantidad predeterminada: ${product.cantidad_predeterminada}`);
                console.log(`   Categoría: ${product.categoria}`);
                console.log(`   Prioridad: ${product.prioridad}`);
                console.log(`   Comprado: ${product.purchased ? 'Sí' : 'No'}`);
                console.log(`   Creado: ${product.createdAt.toLocaleString()}`);
                console.log(`   Actualizado: ${product.updatedAt.toLocaleString()}`);
                console.log('-'.repeat(80));
            });
        }

        await mongoose.connection.close();
        console.log('\n✅ Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listProducts();
