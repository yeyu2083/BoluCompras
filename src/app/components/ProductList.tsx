import React from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';

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
    <div className="w-full max-w-4xl mt-8 mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center bg-gradient-to-r from-gray-200 to-gray-300 py-2 rounded-lg shadow-md flex items-center justify-center gap-2">
        <MdOutlineShoppingCart className="text-blue-500 animate-bounce" />
        Explora Tu Inventario
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-black rounded-lg shadow-md p-3 border border-gray-300 hover:shadow-lg transition-shadow duration-300 w-72 h-auto"
            >
              <h3 className="text-lg font-bold mb-2 text-center">{product.name}</h3>
              <p className="text-sm mb-1"><span className="font-semibold">Cantidad:</span> {product.quantity}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Categoría:</span> {product.categoria}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Prioridad:</span> {product.prioridad}</p>
              <p className="text-sm mb-1"><span className="font-semibold">Creado:</span> {new Date(product.createdAt).toLocaleDateString()}</p>
              <div className="flex justify-between mt-3">
                <button
                  onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md"
                >
                  +1
                </button>
                <button
                  onClick={() => onUpdatePurchased(product.id, !product.purchased)}
                  className={`px-3 py-1 ${product.purchased ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white font-semibold rounded-lg shadow-md`}
                >
                  {product.purchased ? 'Comprado' : 'Pendiente'}
                </button>
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No hay productos disponibles.</p>
        )}
      </div>
      <div className="flex justify-center mt-8 gap-4">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={onNextPage}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md transition-all duration-300"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ProductList;
