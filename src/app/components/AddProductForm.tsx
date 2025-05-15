import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface Product {
  id: number;
  name: string;
  quantity: number;
  categoria: string;
  prioridad: number;
  purchased: boolean;
  createdAt: string;
}

interface AddProductFormProps {
  onAddProduct: (name: string, category: string, priority: number) => void;
  isLoading: boolean;
  onToggleList: () => void; // Nueva prop para alternar la visibilidad de la lista
  isTableVisible: boolean; // Nueva prop para el estado de visibilidad de la tabla
  onUpdatePurchased: (id: number, purchased: boolean) => void;
}

const AddProductForm: React.FC<AddProductFormProps & { products: Product[]; onUpdateQuantity: (id: number, quantity: number) => void }> = ({ onAddProduct, isLoading, onToggleList, isTableVisible, products, onUpdateQuantity }) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('General');
  const [productPriority, setProductPriority] = useState(1);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editMode, setEditMode] = useState(false); // Si el usuario selecciona "Editar" desde sugerencias
  const [forceAdd, setForceAdd] = useState(false); // Si el usuario insiste en duplicar

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

    const duplicate = products.find((product: Product) => product.name.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) {
      setIsDuplicate(true);
      setExistingProduct(duplicate);
      return;
    }

    onAddProduct(trimmedName, productCategory, productPriority);
    setProductName('');
    setProductCategory('General');
    setProductPriority(1);
  };

  const handleConfirmDuplicate = () => {
    if (existingProduct) {
      onUpdateQuantity(existingProduct.id, existingProduct.quantity + 1);
    }
    setIsDuplicate(false);
    setExistingProduct(null);
    setProductName('');
  };

  const handleCancelDuplicate = () => {
    setIsDuplicate(false);
    setExistingProduct(null);
  };
  const categories = ["General", "Alimentos", "Lácteos", "Ropa", "Bebidas", "Frutas y Verduras", "Panadería", "Congelados", "Cereales y Granos", "Condimentos y Salsas", "Productos de Despensa", "Mascotas", "Cuidado Personal", "Otros"];
  
  return (
    <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl">
      <div className="relative">
        <Input
          type="text"
          placeholder="Ingresa el nombre del producto..."
          value={productName}
          onChange={(e) => {
            const value = e.target.value;
            setProductName(value);
            if (value.trim().length > 0) {
              const filtered = products.filter((p) =>
                p.name.toLowerCase().includes(value.trim().toLowerCase())
              );
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>        )}
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
                  key={s.id}
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-400/90 hover:to-green-400/90 group hover:text-white transition-all duration-300 border-b border-blue-100 last:border-b-0"
                  onClick={() => {
                    setProductName(s.name);
                    setExistingProduct(s);
                    setEditMode(true);
                    setIsDuplicate(true); // Abrir modal directamente en modo edición
                    setShowSuggestions(false);
                  }}
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
                      setProductName(s.name);
                      setExistingProduct(s);
                      setEditMode(true);
                      setIsDuplicate(true);
                      setShowSuggestions(false);
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
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cerrar sugerencias
              </button>
            </div>
          </div>
        </div>
      )}
      {existingProduct && !editMode && productName.trim().toLowerCase() === existingProduct.name.toLowerCase() && (
        <div className="mt-2 text-sm text-red-500 font-semibold">
          Este producto ya está en tu lista (Categoría: {existingProduct.categoria} | Prioridad: {existingProduct.prioridad}). ¿Deseas editarlo?
        </div>
      )}
      {/* Solo mostrar detalles si NO es duplicado ni editando */}
      {!editMode && !existingProduct && (
        <>
          <div className="mt-4">
            <label htmlFor="category" className="block text-gray-300 mb-2 font-semibold">Categoría</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
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
              <span className="text-gray-300 text-sm">Baja</span>
              <input
                type="range"
                min="1"
                max="5"
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
        <Button
          onClick={() => {
            if (editMode && existingProduct) {
              setIsDuplicate(true); // Abre modal de edición
            } else if (suggestions.some((p) => p.name.toLowerCase() === productName.trim().toLowerCase()) && !forceAdd) {
              setExistingProduct(suggestions.find((p) => p.name.toLowerCase() === productName.trim().toLowerCase())!);
              setIsDuplicate(true); // Abre modal de confirmación
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
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar Producto
              </>
            )}
          </span>
        </Button>
        <Button
          onClick={onToggleList}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto border border-blue-400 hover:border-purple-500 transform hover:-translate-y-[2px]"
        >
          <span className="flex items-center justify-center">
            {isTableVisible ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </>
            )}
            {isTableVisible ? 'Cerrar Lista' : 'Ver Lista'}
          </span>
        </Button>
      </div>        {isDuplicate && (
        <Dialog open={isDuplicate}>
          <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center animate-in fade-in duration-300 overflow-auto py-8">
            <div className="w-[95%] max-w-md sm:max-w-lg mx-auto backdrop-blur-sm animate-in zoom-in-95 duration-300 slide-in-from-bottom-4"
              onClick={(e) => e.stopPropagation()}
            >              <DialogContent className="relative rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-blue-300 bg-white overflow-hidden p-0">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 h-16 w-full absolute top-0 left-0 opacity-90"></div>
                <DialogTitle className="text-2xl font-extrabold text-white relative z-10 mt-3 mb-10 tracking-tight text-center drop-shadow-md">{editMode ? 'Editar producto' : 'Producto duplicado'}</DialogTitle>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => {
                    setIsDuplicate(false);
                    setEditMode(false);
                    setForceAdd(false);
                    setProductName('');
                  }}
                  className="absolute right-4 top-4 text-xl font-bold text-white hover:text-red-300 focus:outline-none bg-gray-800/30 hover:bg-red-800/40 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/30"
                  style={{ zIndex: 20 }}
                >
                  ×
                </button>
                
                <div className="p-6 pt-14">
                <div className="mb-6 text-gray-800 bg-blue-50 p-4 rounded-xl shadow-inner border border-blue-100">
                  <div className="text-xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Detalles del producto</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                      <span className="font-semibold text-blue-800">Nombre:</span>
                      <div className="mt-1 font-bold text-gray-800">{existingProduct?.name}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                      <span className="font-semibold text-blue-800">Categoría:</span>
                      <div className="mt-1 font-bold text-gray-800">{existingProduct?.categoria}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                      <span className="font-semibold text-blue-800">Prioridad:</span>
                      <div className="mt-1 font-bold text-gray-800">{existingProduct?.prioridad} {existingProduct?.prioridad && 
                        <span className="inline-block ml-2">
                          {'★'.repeat(existingProduct?.prioridad)} 
                          {'☆'.repeat(5 - existingProduct?.prioridad)}
                        </span>
                      }</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                      <span className="font-semibold text-blue-800">Cantidad:</span>
                      <div className="mt-1 font-bold text-gray-800">{existingProduct?.quantity}</div>                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={() => {
                      if (existingProduct) {
                        onUpdateQuantity(existingProduct.id, existingProduct.quantity + 1);
                        setIsDuplicate(false);
                        setEditMode(false);
                        setForceAdd(false);
                        setProductName('');
                      }
                    }}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl w-full text-lg border border-blue-400 hover:border-green-400 transition-all duration-300 transform hover:translate-y-[-2px]"
                  >
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Añadir 1 unidad más
                    </span>
                  </Button>
                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl w-full text-lg border border-yellow-400 hover:border-amber-500 transition-all duration-300 transform hover:translate-y-[-2px]"
                  >
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Modificar categoría/prioridad
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      setForceAdd(true);
                      setIsDuplicate(false);
                      setEditMode(false);
                      handleAddProductClick();
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl w-full text-lg border border-green-400 hover:border-blue-500 transition-all duration-300 transform hover:translate-y-[-2px]"
                  >
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Agregar como nuevo producto
                    </span>
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDuplicate(false);
                      setEditMode(false);
                      setForceAdd(false);
                      setProductName('');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg w-full text-lg border border-gray-300 hover:border-gray-400 transition-all duration-300"
                  >
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancelar
                    </span>
                  </Button>                </div>
                
                {editMode && (
                  <div className="mt-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 shadow-inner animate-fade-in-up border border-blue-100">
                    <div className="text-lg font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar detalles del producto
                    </div>
                    <label className="block text-gray-700 mb-3 font-bold">Selecciona una categoría</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setProductCategory(category)}
                          className={`px-4 py-2 rounded-lg shadow-md font-semibold transition-all transform hover:scale-105 w-full text-center ${
                            productCategory === category
                              ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white border border-blue-300'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <label className="block text-gray-700 mb-3 font-bold">Define la prioridad</label>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-gray-700 text-sm font-semibold bg-white px-3 py-1 rounded-lg border border-gray-200">Baja</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={productPriority}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductPriority(parseInt(e.target.value, 10))}
                        className="flex-grow appearance-none h-3 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: `linear-gradient(90deg, rgb(59, 130, 246) ${(productPriority - 1) * 25}%, rgb(229, 231, 235) ${(productPriority - 1) * 25}%)`
                        }}
                      />
                      <span className="text-gray-700 text-sm font-semibold bg-white px-3 py-1 rounded-lg border border-gray-200">Alta</span>
                    </div>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((p) => (
                        <span 
                          key={p}
                          className={`text-2xl cursor-pointer transition-all ${p <= productPriority ? 'text-yellow-500 scale-110' : 'text-gray-300'}`}
                          onClick={() => setProductPriority(p)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => {
                        if (existingProduct) {
                          // Actualizar el producto en el array original
                          const idx = products.findIndex(p => p.id === existingProduct.id);
                          if (idx !== -1) {
                            products[idx] = {
                              ...existingProduct,
                              categoria: productCategory,
                              prioridad: productPriority
                            };
                            
                            // Aquí debería ir la llamada API para actualizar en el backend
                            // Por ejemplo: updateProductOnServer(existingProduct.id, { categoria: productCategory, prioridad: productPriority });
                          }
                          setIsDuplicate(false);
                          setEditMode(false);
                          setForceAdd(false);
                          setProductName('');
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl w-full mt-6 text-lg transform transition-all duration-300 hover:translate-y-[-2px] border-2 border-white"
                    >
                      <span className="inline-flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>                        Guardar cambios
                      </span>
                    </Button>                  </div>
                )}
              </div>
            </DialogContent>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AddProductForm;
