import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const normalizeString = (str: string) => {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .trim();
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

interface UpdateOptions {
  categoria?: string;
  prioridad?: number;
}

interface AddProductFormProps {
  onAddProduct: (name: string, category: string, priority: number) => void;
  isLoading?: boolean;
  onToggleList: () => void;
  isTableVisible: boolean;
  products: Product[];
  onUpdateQuantity: (id: string, quantity: number, options?: UpdateOptions) => void;
  onUpdatePurchased: (id: string, purchased: boolean) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ 
  onAddProduct, 
  isLoading, 
  onToggleList, 
  isTableVisible, 
  products, 
  onUpdateQuantity 
}) => {  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('General');
  const [productPriority, setProductPriority] = useState(1);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [forceAdd, setForceAdd] = useState(false);

  // Función para obtener el ID correcto del producto
  const getProductId = (product: Product): string => {
    return product._id || product.id;
  };

  // Actualizar el producto existente cuando cambie la lista de productos
  useEffect(() => {
    if (existingProduct && products.length > 0) {
      const productId = getProductId(existingProduct);
      const updatedProduct = products.find(p => 
        getProductId(p) === productId
      );
      if (updatedProduct) {
        setExistingProduct(updatedProduct);
      }
    }
  }, [products, existingProduct]);

  const handleAddProductClick = () => {
    const trimmedName = productName.trim();
    if (!trimmedName) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un nombre de producto.',
        variant: 'destructive',
      });
      return;
    }

    const duplicate = products.find((product: Product) => 
      normalizeString(product.name).toLowerCase() === normalizeString(trimmedName).toLowerCase()
    );
    
    if (duplicate && !forceAdd) {
      setIsDuplicate(true);
      setExistingProduct(duplicate);
      // Establecer los valores actuales del producto existente
      setProductCategory(duplicate.categoria);
      setProductPriority(duplicate.prioridad);
      return;
    }

    onAddProduct(trimmedName, productCategory, productPriority);
    resetForm();
  };

  const resetForm = () => {
    setProductName('');
    setProductCategory('General');
    setProductPriority(1);
    setForceAdd(false);
    setEditMode(false);
    setIsDuplicate(false);
    setExistingProduct(null);
  };

  const handleConfirmDuplicate = async () => {
    if (!existingProduct) return;

    try {
      const productId = getProductId(existingProduct);
      
      console.log('=== Actualizando Producto ===');
      console.log('ID del producto:', productId);
      console.log('Categoría actual:', existingProduct.categoria, '-> Nueva:', productCategory);
      console.log('Prioridad actual:', existingProduct.prioridad, '-> Nueva:', productPriority);

      // Llamar a la función de actualización del componente padre
      await onUpdateQuantity(productId, existingProduct.quantity, {
        categoria: productCategory.trim(),
        prioridad: Number(productPriority)
      });
      
      toast({
        title: "¡Producto actualizado!",
        description: `${existingProduct.name} se ha actualizado correctamente.`,
      });

      resetForm();

    } catch (error) {
      console.error('Error al actualizar:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive"
      });
    }
  };

  const handleCancelDuplicate = () => {
    resetForm();
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setProductName(suggestion.name);
    setExistingProduct(suggestion);
    setProductCategory(suggestion.categoria);
    setProductPriority(suggestion.prioridad);
    setEditMode(true);
    setIsDuplicate(true);
    setShowSuggestions(false);
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (!existingProduct) return;
    
    try {
      await onUpdateQuantity(productId, newQuantity);
      // El estado se actualizará automáticamente via useEffect
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const categories = [
    "General", "Alimentos", "Lácteos", "Ropa", "Bebidas", 
    "Frutas y Verduras", "Panadería", "Congelados", 
    "Cereales y Granos", "Condimentos y Salsas", 
    "Productos de Despensa", "Mascotas", "Cuidado Personal", "Otros"
  ];
  
  return (
    <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
      <div className="relative">        <Input
          type="text"
          placeholder="Ingresa el nombre del producto..."
          data-testid="product-name-input"
          value={productName}
          onChange={(e) => {
            const value = e.target.value;
            setProductName(value);
            if (value.trim().length > 0) {              // More flexible product filtering
              const searchTerm = normalizeString(value);
              const filtered = products.filter((p) => {
                const normalizedName = normalizeString(p.name);
                return normalizedName.includes(searchTerm) || 
                       searchTerm.includes(normalizedName) ||
                       normalizedName.startsWith(searchTerm) ||
                       normalizedName.endsWith(searchTerm);
              });
              setSuggestions(filtered);
              setShowSuggestions(filtered.length > 0);
            } else {
              setShowSuggestions(false);
              setSuggestions([]);
            }
            setIsDuplicate(false);
            setEditMode(false);
            setForceAdd(false);
          }}
          disabled={isLoading}
          className="border-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm bg-gray-700 text-white transition-all duration-300 w-full pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        {productName.length > 0 && (
          <button 
            onClick={() => {
              setProductName('');
              setShowSuggestions(false);
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {showSuggestions && (
        <div className="fixed left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md flex flex-col items-center" 
             style={{top: '70px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto'}}
             onClick={(e) => e.stopPropagation()}>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-blue-400/80 animate-fade-in-up w-[95%] overflow-hidden"
               style={{animation: 'fadeInDown 0.3s ease-out'}}>
            
            <div className="bg-gradient-to-r from-blue-600 to-green-600 py-3 px-4 sticky top-0">
              <h3 className="text-white font-bold text-center text-lg">
                Sugerencias ({suggestions.length})
              </h3>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto py-2" style={{scrollbarWidth: 'thin'}}>
              {suggestions.map((s) => (
                <div
                  key={getProductId(s)}
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-400/90 hover:to-green-400/90 group hover:text-white transition-all duration-300 border-b border-blue-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(s)}
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-lg text-left group-hover:text-white transition-colors duration-300">{s.name}</span>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs bg-blue-100 group-hover:bg-blue-200 text-blue-800 rounded-md px-2 py-1 font-semibold transition-colors duration-300">{s.categoria}</span>
                      <span className="text-xs bg-amber-100 group-hover:bg-amber-200 text-amber-800 rounded-md px-2 py-1 font-semibold transition-colors duration-300">
                        Prioridad: {s.prioridad} {'★'.repeat(s.prioridad)}
                      </span>
                      <span className="text-xs bg-green-100 group-hover:bg-green-200 text-green-800 rounded-md px-2 py-1 font-semibold transition-colors duration-300">
                        Cantidad: {s.quantity}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="ml-4 text-white bg-gradient-to-r from-blue-500 to-green-500 group-hover:from-blue-600 group-hover:to-green-600 px-4 py-2 rounded-lg font-bold shadow-lg border border-white hover:scale-105 transition-all duration-300 whitespace-nowrap flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuggestionClick(s);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editar
                  </button>
                </div>
              ))}
            </div>
            
            <div className="py-3 px-4 bg-gray-50 border-t border-gray-200">
              <button 
                onClick={() => setShowSuggestions(false)}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                </svg>
                Cerrar sugerencias
              </button>
            </div>
          </div>
        </div>
      )}

      {existingProduct && !editMode && normalizeString(productName) === normalizeString(existingProduct.name) && (
        <div className="mt-2 text-sm text-red-500 font-semibold">
          Este producto ya está en tu lista (Categoría: {existingProduct.categoria} | Prioridad: {existingProduct.prioridad}). ¿Deseas editarlo?
        </div>
      )}

      {/* Solo mostrar detalles si NO es duplicado ni editando */}
      {!editMode && !existingProduct && (
        <>
          <div className="mt-4">
            <label htmlFor="category" className="block text-gray-300 mb-2 font-semibold">Categoría</label>            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="category-buttons-container">
              {categories.map((category) => (<button
                  key={category}
                  data-testid={`category-button-${category}`}
                  onClick={() => setProductCategory(category)}
                  className={`px-4 py-2 rounded-lg shadow-md font-semibold transition-transform transform hover:scale-105 w-full text-center ${
                    productCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-300 mb-2 font-semibold">Prioridad</label>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">Baja</span>              <input
                type="range"
                min="1"
                max="5"
                data-testid="priority-slider"
                value={productPriority}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductPriority(parseInt(e.target.value, 10))}
                className="flex-grow appearance-none h-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-300 text-sm">Alta</span>
            </div>
          </div>
        </>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between mt-4 gap-4">
        <Button          data-testid="add-product-button"
          onClick={() => {
            if (editMode && existingProduct) {
              setIsDuplicate(true);
            } else if (suggestions.some((p) => normalizeString(p.name) === normalizeString(productName)) && !forceAdd) {
              setExistingProduct(suggestions.find((p) => normalizeString(p.name) === normalizeString(productName))!);
              setIsDuplicate(true);
            } else {
              handleAddProductClick();
            }
          }}
          disabled={isLoading || !productName.trim()}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto border border-green-400 hover:border-blue-500 transform hover:-translate-y-[2px]"
        >
          <span className="flex items-center justify-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : editMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar Producto
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Producto
              </>
            )}
          </span>
        </Button>        <Button
          onClick={onToggleList}
          data-testid="toggle-list-button"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto border border-blue-400 hover:border-purple-500 transform hover:-translate-y-[2px]"
        >
          <span className="flex items-center justify-center">
            {isTableVisible ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 000 2h6a1 1 100-2H7zM4 7a1 1 011-1h10a1 1 110 2H5a1 1 01-1-1zM2 11a2 2 012-2h12a2 2 012 2v4a2 2 01-2 2H4a2 2 01-2-2v-4z" />
                </svg>
              </>
            )}
            {isTableVisible ? 'Cerrar Lista' : 'Ver Lista'}
          </span>
        </Button>
      </div>

      {isDuplicate && (
        <Dialog open={isDuplicate} modal>
          <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 p-4 bg-transparent border-none shadow-none max-w-lg w-full">
            <div className="animate-in fade-in-0 slide-in-from-bottom-5">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-400 overflow-hidden">
                <DialogTitle className="bg-gradient-to-r from-blue-600 to-green-600 py-4 px-6 text-white text-xl font-bold text-center">
                  {editMode ? 'Editar Producto' : 'Producto Existente'}
                </DialogTitle>
                
                <div className="p-6 space-y-4">
                  {existingProduct && (
                    <>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <span className="text-sm text-gray-600 block mb-1">Nombre</span>
                          <span className="text-lg font-bold text-blue-600">{existingProduct.name}</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-sm text-gray-600 block mb-2">Categoría</span>
                            <div className="grid grid-cols-2 gap-2">
                              {categories.map((category) => (
                                <button
                                  key={category}
                                  onClick={() => setProductCategory(category)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    productCategory === category
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-gray-600 block mb-2">Prioridad</span>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Baja</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={productPriority}
                                  onChange={(e) => setProductPriority(parseInt(e.target.value, 10))}
                                  className="mx-4 flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="text-sm text-gray-500">Alta</span>
                              </div>
                              <div className="text-center font-medium text-amber-500 text-lg">
                                {'★'.repeat(productPriority)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm text-gray-600 block mb-2">Cantidad actual: {existingProduct.quantity}</span>
                            <div className="flex items-center justify-center gap-4 mt-2">
                              <button
                                onClick={() => {
                                  const id = getProductId(existingProduct);
                                  handleQuantityChange(id, Math.max(0, existingProduct.quantity - 1));
                                }}
                                className="bg-red-100 hover:bg-red-200 text-red-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="text-2xl font-bold text-green-700 min-w-[3ch] text-center">
                                {existingProduct.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  const id = getProductId(existingProduct);
                                  handleQuantityChange(id, existingProduct.quantity + 1);
                                }}
                                className="bg-green-100 hover:bg-green-200 text-green-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 011-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <Button
                          onClick={handleCancelDuplicate}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleConfirmDuplicate}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                        >
                          Guardar cambios
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AddProductForm;