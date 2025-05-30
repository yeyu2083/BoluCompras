import express from 'express';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const router = express.Router();

// Add pagination for fetching products
router.get('/', async (req, res) => {
  try {    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6; // Cambiado a 6 productos por página
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();    // Convertir los nombres de campo para el frontend
    const formattedProducts = products.map(product => ({
      id: product._id.toString(), // Convertir ObjectId a string
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

    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp('^' + req.body.name + '$', 'i') }
    });

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
    console.log('=== PATCH REQUEST ===');
    console.log('ID recibido (raw):', req.params.id);
    
    // Asegurar que el ID es válido para MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('ID inválido para MongoDB');
      return res.status(400).json({ 
        message: 'ID de producto inválido',
        receivedId: req.params.id 
      });
    }

    console.log('ID validado para MongoDB:', req.params.id);
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Producto no encontrado con ID:', req.params.id);
      return res.status(404).json({ message: 'Producto no encontrado' });
    }    console.log('Producto encontrado:', product);
    
    // Definir los campos permitidos para actualización
    const allowedFields = ['quantity', 'purchased', 'categoria', 'prioridad'];
    console.log('Campos permitidos:', allowedFields);
    console.log('Campos recibidos:', Object.keys(req.body));      // Validar y aplicar actualizaciones
    const updates = {};
    for (const [field, value] of Object.entries(req.body)) {
      if (!allowedFields.includes(field)) {
        console.log(`Campo no permitido: ${field}`);
        continue;
      }

      if (field === 'prioridad') {
        updates[field] = parseInt(value, 10);
      } else if (field === 'categoria') {
        updates[field] = String(value).trim();
      } else {
        updates[field] = value;
      }
      console.log(`Campo ${field} actualizado a:`, updates[field]);
    }

    // Aplicar las actualizaciones al producto
    Object.assign(product, updates);
    
    // Forzar que se marquen los campos como modificados
    if (updates.categoria !== undefined) product.markModified('categoria');
    if (updates.prioridad !== undefined) product.markModified('prioridad');

    console.log('Producto modificado antes de guardar:', JSON.stringify(product.toObject(), null, 2));

  
    
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
