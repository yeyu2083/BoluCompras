import React from 'react';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  name: string;
  quantity: number;
  categoria: string;
  prioridad: number;
  purchased: boolean;
  createdAt: string;
}

interface ProductListProps {
  products: Product[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onUpdatePurchased: (id: number, purchased: boolean) => void;
  onDeleteProduct: (id: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPage: number;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onUpdateQuantity,
  onUpdatePurchased,
  onDeleteProduct,
  onNextPage,
  onPreviousPage,
  currentPage,
}) => {
  return (
    <div className="w-full max-w-4xl mt-8">
      <h2 className="text-2xl font-bold text-gray-200 mb-4 text-center bg-gradient-to-r from-gray-800 to-gray-700 py-2 rounded-lg shadow-md">Explora Tu Inventario</h2>
      <table className="min-w-full bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-black">
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Nombre</th>
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Cantidad</th>
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Categoría</th>
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Prioridad</th>
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Comprado</th>
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Creado</th>
            <th className="px-6 py-3 text-left font-semibold shadow-md border-b border-gray-300">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'
                } hover:bg-gray-200 transition-colors shadow-sm`}
              >
                <td className="px-6 py-3 text-gray-800 shadow-sm">{product.name}</td>
                <td className="px-6 py-3 text-gray-800 shadow-sm">
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value, 10))}
                    className="w-16 bg-gray-100 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-3 text-gray-800 shadow-sm">{product.categoria}</td>
                <td className="px-6 py-3 text-gray-800 shadow-sm">{product.prioridad}</td>
                <td className="px-6 py-3 text-gray-800 shadow-sm">
                  <select
                    value={product.purchased ? 'Sí' : 'No'}
                    onChange={(e) => onUpdatePurchased(product.id, e.target.value === 'Sí')}
                    className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-gray-800 shadow-sm">{new Date(product.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-3 text-center text-gray-500 shadow-sm">
                No hay productos disponibles.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="text-center py-4">
              <button
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={onNextPage}
                className="px-4 py-2 mx-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
              >
                Siguiente
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ProductList;
