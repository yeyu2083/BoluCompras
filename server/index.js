import express from 'express';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 9002;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas básicas
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando correctamente');
});

// Use product routes
app.use('/api/products', productRoutes);

// Connect to MongoDB
connectDB();

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});