import express from 'express';
import connectDB from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 9002;

// Middleware
app.use(express.json());
app.use(cors());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

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