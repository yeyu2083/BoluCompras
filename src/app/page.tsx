'use client'; // <-- ADD THIS DIRECTIVE AT THE VERY TOP

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';

interface Product {
  id: string;
  _id?: string;
  name: string;
  precio: number | null;
  cantidad_predeterminada: number;
  quantity: number;
  categoria: string;
  prioridad: number;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateOptions {
  categoria?: string;
  prioridad?: number;
}

export default function Home() {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for adding product
  const { toast } = useToast();
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]); // State to store fetched products
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [totalPages, setTotalPages] = useState(1); // Estado para el total de páginas
  const limit = 6; // Límite de productos por página
  const [stagedProduct, setStagedProduct] = useState<Product | null>(null); // Estado temporal para el producto duplicado
  const [productCategory, setProductCategory] = useState("General"); // Estado para la categoría
  const [productPriority, setProductPriority] = useState(1); // Estado para la prioridad
  const [showTable, setShowTable] = useState(false); // Estado para mostrar/ocultar la tabla
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  // Prepare to add product (check existence, open modal if needed)
  const handleAddProductClick = async (name: string, category: string, priority: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre de producto.",
        variant: "destructive",
      });
      return;
    }

    // Asegurarse de que los datos estén actualizados
    if (fetchedProducts.length === 0) {
      await fetchProducts(); // Traer la lista completa antes de verificar duplicados
    }

    // Add a check to ensure `name` exists before calling `.toLowerCase()`
    const existingProduct = fetchedProducts.find(
      (product) => product.name && product.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingProduct) {
      setStagedProduct(existingProduct); // Guardar en estado temporal
      setIsModalOpen(true);
    } else {
      const newProduct = {
        name: trimmedName,
        precio: null,
        cantidad_predeterminada: 1,
        quantity: 1,
        categoria: category,
        prioridad: priority,
        purchased: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Actualizar en el backend
      try {
        const response = await fetch(`/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }

        // Obtener el producto con el ID asignado por MongoDB
        const savedProduct = await response.json();
        // Actualizar en el estado local
        setFetchedProducts((prevProducts) => [...prevProducts, savedProduct]);
        toast({
          title: "Producto agregado",
          description: `El producto "${trimmedName}" se agregó a la lista.`,
        });
      } catch (error) {
        console.error("Error al agregar el producto:", error);
        let errorMessage = "No se pudo agregar el producto en el backend.";
        if (error instanceof Error) {
          errorMessage += " Detalles: " + error.message;
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
    setProductName("");
    setProductCategory("General"); // Reset category to default
    setProductPriority(1); // Reset priority to default
  };

  const fetchProducts = async (page = 1) => {
    try {
      const response = await fetch(`/api/products?page=${page}&limit=${limit}`); // Enviar parámetros de paginación
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      setFetchedProducts(data.data); // Ajustado para acceder a la clave 'data' en la respuesta
      setTotalPages(data.totalPages); // Guardar el total de páginas
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Could not fetch products from the database.",
        variant: "destructive",
      });
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      fetchProducts(nextPage);
      return nextPage;
    });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => {
      if (prevPage > 1) {
        const previousPage = prevPage - 1;
        fetchProducts(previousPage);
        return previousPage;
      }
      return prevPage;
    });
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number, options?: UpdateOptions) => {
    if (newQuantity < 0) {
      toast({
        title: "Error",
        description: "La cantidad no puede ser negativa.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('=== handleUpdateQuantity ===');
      console.log('ID recibido:', id);
      console.log('Nueva cantidad:', newQuantity);
      console.log('Opciones:', options);

      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la cantidad.");
      }

      const updatedProduct = await response.json();
      console.log('Respuesta del servidor:', updatedProduct);

      setFetchedProducts(prevProducts =>
        prevProducts.map(product =>
          (product.id === id || product._id === id)
            ? {
              ...product,
              ...updatedProduct,
              quantity: newQuantity,
              ...(options?.categoria && { categoria: options.categoria }),
              ...(options?.prioridad && { prioridad: options.prioridad })
            }
            : product
        )
      );

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la cantidad.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePurchased = async (id: string, purchased: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purchased }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de purchased en el backend.");
      }
      // Obtener la respuesta actualizada del servidor
      const updatedProduct = await response.json();

      setFetchedProducts((prevProducts) =>
        prevProducts.map((product) =>
          (product.id === id || product._id === id)
            ? { ...product, ...updatedProduct, purchased }
            : product
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado de purchased:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de purchased.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto en el backend.");
      }
      setFetchedProducts((prevProducts) =>
        prevProducts.filter((product) =>
          product.id !== id && product._id !== id
        )
      );

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products on component mount
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-green-400 via-blue-500 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 p-8 pt-16 transition-colors duration-300">
      <Card className="w-full max-w-6xl shadow-2xl mb-8 bg-gradient-to-br from-gray-800 to-gray-700 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-600 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col items-center">
            <Image
              src="/images/bolucompras-logo.png"
              alt="Bolucompras Logo"
              width={120}
              height={120}
              className="mb-6 rounded-full shadow-lg border-4 border-gray-500 dark:border-gray-600"
            />
            <CardTitle className="text-center text-4xl font-extrabold text-gray-100 tracking-wide">
              Bienvenido a Bolucompras
            </CardTitle>
            <p className="text-center text-gray-300 dark:text-gray-400 mt-2 text-lg">
              Tu lista de compras inteligente
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AddProductForm
              onAddProduct={(name, category, priority) => {
                handleAddProductClick(name, category, priority);
              }}
              isLoading={isLoading}
              onToggleList={() => setShowTable((prev) => !prev)}
              isTableVisible={showTable}
              products={fetchedProducts}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdatePurchased={handleUpdatePurchased}
            />
          </div>
        </CardContent>
      </Card>

      {showTable && (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto mt-8 bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-lg p-6 shadow-xl transition-colors duration-300">
          <ProductList
            products={fetchedProducts}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdatePurchased={handleUpdatePurchased}
            onDeleteProduct={handleDeleteProduct}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </main>
  );
}
