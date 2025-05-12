import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Add pagination for fetching products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();

    // Convertir los nombres de campo para el frontend
    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      quantity: product.quantity,
      purchased: product.purchased,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      precio: product.precio,
      categoria: product.categoria,
      prioridad: product.prioridad,
      cantidad_predeterminada: product.cantidad_predeterminada
    }));

    res.json({
      data: formattedProducts,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Align field names with frontend
router.post('/', async (req, res) => {
  try {
    // Validar que name existe
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ message: "El campo 'name' es obligatorio y no puede estar vacío." });
    }

    const existingProduct = await Product.findOne({ name: req.body.name });

    if (existingProduct) {
      return res.status(400).json({
        message: 'Producto ya existe',
        exists: true,
        product: existingProduct,
      });
    }

    // Crear el producto con los campos correctos
    const product = new Product({
      name: req.body.name,
      quantity: req.body.quantity || 1,
      purchased: req.body.purchased || false,
      categoria: req.body.categoria || 'General',
      prioridad: req.body.prioridad || 1,
      precio: req.body.precio || null,
      cantidad_predeterminada: req.body.cantidad_predeterminada || 1
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un producto
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    if (req.body.quantity !== undefined) product.quantity = req.body.quantity;
    if (req.body.purchased !== undefined) product.purchased = req.body.purchased;
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
