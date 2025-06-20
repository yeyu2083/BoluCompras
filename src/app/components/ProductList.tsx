import React, { useState } from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';

// Helper function to get the correct product ID
const getProductId = (product: Product): string => {
  return product._id || product.id;
};

interface Product {
  id: string;
  _id?: string;
  name: string;
  quantity: number;
  categoria: string;
  prioridad: number;
  purchased: boolean;
  createdAt: string;
}

interface ProductListProps {
  products: Product[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePurchased: (id: string, purchased: boolean) => void;
  onDeleteProduct: (id: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPage: number;
  totalPages: number;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onUpdateQuantity,
  onUpdatePurchased,
  onDeleteProduct,
  onNextPage,
  onPreviousPage,
  currentPage,
  totalPages,
}) => {
  const [loadingQuantity, setLoadingQuantity] = useState<string | null>(null);

  const handleQuantityUpdate = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setLoadingQuantity(id);
    await onUpdateQuantity(id, newQuantity);
    setLoadingQuantity(null);
  };

  return (
    <div className="w-full max-w-4xl mt-8 mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-50 to-blue-100 py-3 rounded-2xl shadow-lg flex items-center justify-center gap-3">
        <MdOutlineShoppingCart className="text-blue-500 text-3xl animate-bounce" />
        Explora Tu Inventario
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
        {products.length > 0 ? (
          products.map((product) => (            <div
              key={getProductId(product)}
              data-testid={`product-card-${getProductId(product)}`}
              className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-800 rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-2xl hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300 w-full max-w-sm mx-auto relative overflow-hidden group"
            >
              {product.purchased && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-lg transform translate-x-2 -translate-y-2 rotate-12 shadow-md">
                  ✓ Comprado
                </div>
              )}
              <h3 
                data-testid={`product-name-${getProductId(product)}`}
                className="text-xl font-bold mb-4 text-center text-blue-800 group-hover:text-blue-600 transition-colors"
              >
                {product.name}
              </h3>
              <div className="space-y-4">
                <div className={`bg-blue-50 rounded-xl p-4 transform transition-all duration-300 ${loadingQuantity === getProductId(product) ? 'animate-pulse' : 'hover:scale-105'}`}>
                  <div className="flex justify-center items-center gap-4">                    <button
                      onClick={() => handleQuantityUpdate(getProductId(product), product.quantity - 1)}
                      data-testid={`decrease-quantity-${getProductId(product)}`}
                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors"
                      disabled={loadingQuantity === getProductId(product)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <p className="text-center">                      <span 
                        data-testid={`quantity-value-${getProductId(product)}`}
                        className={`text-3xl font-bold text-blue-600 transition-all duration-300 ${loadingQuantity === getProductId(product) ? 'opacity-50' : ''}`}
                      >
                        {product.quantity}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">unidades</span>
                    </p>                    <button
                      onClick={() => handleQuantityUpdate(getProductId(product), product.quantity + 1)}
                      data-testid={`increase-quantity-${getProductId(product)}`}
                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 transition-colors"
                      disabled={loadingQuantity === getProductId(product)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                    <p className="text-gray-500 text-sm">Categoría</p>
                    <p className="font-semibold text-gray-800 truncate" title={product.categoria}>{product.categoria}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
                    <p className="text-gray-500 text-sm">Prioridad</p>                    <p className="font-semibold text-gray-800 flex flex-wrap gap-0.5" data-testid={`priority-${getProductId(product)}`}>
                      {Array.from({ length: product.prioridad }).map((_, index) => (
                        <span key={index} className="text-amber-400">⭐</span>
                      ))}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Creado: {new Date(product.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">                <button
                  onClick={() => onUpdatePurchased(getProductId(product), !product.purchased)}
                  data-testid={`purchase-status-${getProductId(product)}`}
                  className={`px-4 py-2 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2
                    ${product.purchased 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white'
                    }`}
                >
                  {product.purchased ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Comprado</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pendiente</span>
                    </>
                  )}
                </button>                <button
                  onClick={() => onDeleteProduct(getProductId(product))}
                  data-testid={`delete-product-${getProductId(product)}`}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <MdOutlineShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay productos disponibles.</p>
            </div>
          </div>
        )}
      </div>
      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <button              onClick={onPreviousPage}
              disabled={currentPage <= 1}
              data-testid="previous-page"
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Página anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-4 font-medium text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button              onClick={onNextPage}
              disabled={currentPage >= totalPages}
              data-testid="next-page"
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Página siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {products.length === 0 
              ? 'No hay productos' 
              : `Mostrando ${products.length} ${products.length === 1 ? 'producto' : 'productos'}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
