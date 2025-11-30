import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    precio?: number;
    cantidad_predeterminada: number;
    quantity: number;
    categoria: string;
    prioridad: number;
    purchased: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del producto es obligatorio'],
            trim: true,
        },
        precio: {
            type: Number,
            default: null,
        },
        cantidad_predeterminada: {
            type: Number,
            default: 1,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 0,
        },
        categoria: {
            type: String,
            default: 'General',
        },
        prioridad: {
            type: Number,
            default: 1,
            min: 1,
            max: 5,
        },
        purchased: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Evitar recompilación del modelo en hot reload
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
