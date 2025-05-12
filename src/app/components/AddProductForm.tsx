import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

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
}

const AddProductForm: React.FC<AddProductFormProps & { products: Product[]; onUpdateQuantity: (id: number, quantity: number) => void }> = ({ onAddProduct, isLoading, onToggleList, isTableVisible, products, onUpdateQuantity }) => {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('General');
  const [productPriority, setProductPriority] = useState(1);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        placeholder="Ingresa el nombre del producto..."
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        disabled={isLoading}
        className="border-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm bg-gray-700 text-white transition-all duration-300"
      />
      <div className="mt-4">
        <label htmlFor="category" className="block text-gray-300 mb-2 font-semibold">Categoría</label>
        <div className="grid grid-cols-3 gap-2">
          {["General", "Alimentos", "Lácteos", "Ropa", "Bebidas", "Frutas y Verduras", "Panadería", "Congelados", "Cereales y Granos", "Condimentos y Salsas", "Productos de Despensa", "Mascotas", "Cuidado Personal", "Otros"].map((category) => (
            <button
              key={category}
              onClick={() => setProductCategory(category)}
              className={`px-4 py-2 rounded-lg shadow-md font-semibold transition-transform transform hover:scale-105 ${
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
            onChange={(e) => setProductPriority(parseInt(e.target.value, 10))}
            className="flex-grow appearance-none h-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-gray-300 text-sm">Alta</span>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          onClick={handleAddProductClick}
          disabled={isLoading || !productName.trim()}
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300"
        >
          {isLoading ? 'Procesando...' : 'Agregar Producto'}
        </Button>
        <Button
          onClick={onToggleList}
          className={`bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300`}
        >
          {isTableVisible ? 'Cerrar Lista' : 'Ver Lista'}
        </Button>
      </div>

      <Dialog open={isDuplicate}>
        <DialogContent>
          <DialogTitle className="text-xl font-bold text-blue-600">Advertencia</DialogTitle>
          <div className="p-4">
            <p className="text-gray-700 text-lg">El producto "{existingProduct?.name}" ya existe. ¿Deseas agregar la cantidad al producto existente?</p>
            <div className="flex justify-end mt-4 gap-2">
              <Button onClick={handleCancelDuplicate} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md">Cancelar</Button>
              <Button onClick={handleConfirmDuplicate} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductForm;
