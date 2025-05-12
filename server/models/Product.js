// Modificar el modelo para que coincida con la base de datos
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {  // Cambiado de producto a name
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  precio: {
    type: Number,
    default: null
  },
  cantidad_predeterminada: {
    type: Number,
    default: 1
  },
  quantity: {  // Cambiado de cantidad a quantity
    type: Number,
    required: true,
    default: 1
  },
  categoria: {
    type: String,
    default: 'General'
  },
  prioridad: {
    type: Number,
    default: 1
  },
  purchased: {  // Cambiado de comprado a purchased
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'createdAt',  // Cambiado a los nombres que usa MongoDB
    updatedAt: 'updatedAt'
  }
});

export default mongoose.model('Product', ProductSchema);