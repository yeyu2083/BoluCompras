'use client'; // <-- ADD THIS DIRECTIVE AT THE VERY TOP

import { useState, useEffect } from 'react';


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image'; // Import Image component from Next.js
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';

interface Product {
  id: number;
  name: string; // Cambiado de "producto" a "name"
  precio: number | null;
  cantidad_predeterminada: number;
  quantity: number; // Cambiado de "cantidad" a "quantity"
  categoria: string;
  prioridad: number;
  purchased: boolean; // Cambiado de "comprado" a "purchased"
  createdAt: string; // Cambiado de "creado_en" a "createdAt"
  updatedAt: string; // Cambiado de "actualizado_en" a "updatedAt"
}

export default function Home() {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for adding product
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [productToAdd, setProductToAdd] = useState<Product | null>(null); // Producto a agregar
  const { toast } = useToast();
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]); // State to store fetched products
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const limit = 10; // Límite de productos por página
  const [stagedProduct, setStagedProduct] = useState<Product | null>(null); // Estado temporal para el producto duplicado
  const [productCategory, setProductCategory] = useState("General"); // Estado para la categoría
  const [productPriority, setProductPriority] = useState(1); // Estado para la prioridad
  const [showTable, setShowTable] = useState(false); // Estado para mostrar/ocultar la tabla

  // Function to handle the actual sending to n8n and updating local state
  const proceedWithAddingProduct = async (productToProcess: Product) => {
    setIsLoading(true);
    let optimisticUpdateApplied = false;
    let previousProductsState = products;

    // Apply optimistic update first
    setProducts((currentProducts) => {
       previousProductsState = currentProducts;
       const existingProductIndex = currentProducts.findIndex(
         (p) =>
           p.name.toLowerCase() === productToProcess.name.toLowerCase()
       );

       if (existingProductIndex > -1) {
         const updatedProducts = [...currentProducts];
         updatedProducts[existingProductIndex].quantity += 1;
         return updatedProducts;
       } else {
         return [...currentProducts, { ...productToProcess, quantity: 1 }];
       }
     });
    optimisticUpdateApplied = true;
    setProductName("");

    try {
      // Prepare data payload including default category and priority
      const payload = {
        name: productToProcess.name,  // Cambiado de 'producto' a 'name'
        quantity: 1,                      // Añadido campo 'quantity' que faltaba
        categoria: 'General',             // Cambiado de 'category' a 'categoria'
        prioridad: 1
      };
      // console.log("Sending payload:", JSON.stringify(payload)); // Uncomment for debugging

      const response = await fetch('/api/products', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the full payload
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      toast({
        title: "Success!",
        description: `Product "${productToProcess.name}" processed.`,
        variant: "default",
      });

      // Optional: await fetchProducts(); // Refetch after success if needed

    } catch (error) {
      console.error("Error sending data to API:", error);
      toast({
        title: "API Error",
        description: "Could not save product changes. Reverting local state.",
        variant: "destructive",
      });

      if (optimisticUpdateApplied) {
         setProducts(previousProductsState);
      }

    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setProductToAdd(null);
      setProductCategory("General"); // Reset category to default
      setProductPriority(1); // Reset priority to default
    }
  };

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
      const newProduct: Product = {
        id: Date.now(),
        name: trimmedName, // Cambiado de "producto" a "name"
        precio: null,
        cantidad_predeterminada: 1,
        quantity: 1, // Cambiado de "cantidad" a "quantity"
        categoria: category, // Usar la categoría seleccionada
        prioridad: priority, // Usar la prioridad seleccionada
        purchased: false, // Cambiado de "comprado" a "purchased"
        createdAt: new Date().toISOString(), // Cambiado de "creado_en" a "createdAt"
        updatedAt: new Date().toISOString() // Cambiado de "actualizado_en" a "updatedAt"
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
          throw new Error("Error al agregar el producto en el backend.");
        }

        // Actualizar en el estado local
        setFetchedProducts((prevProducts) => [...prevProducts, newProduct]);
        toast({
          title: "Producto agregado",
          description: `El producto "${trimmedName}" se agregó a la lista.`,
        });
      } catch (error) {
        console.error("Error al agregar el producto:", error);
        toast({
          title: "Error",
          description: "No se pudo agregar el producto en el backend.",
          variant: "destructive",
        });
      }
    }
    setProductName("");
    setProductCategory("General"); // Reset category to default
    setProductPriority(1); // Reset priority to default
  };

  // Handle Enter key press in the input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddProductClick(productName, productCategory, productPriority);
    }
  };

  // Handle confirmation from the modal
  const handleModalConfirm = async () => {
    if (stagedProduct) {
      try {
        // Realizar la solicitud PATCH al backend
        const response = await fetch(`/api/products/${stagedProduct.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: stagedProduct.quantity + 1 }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el producto en el backend.");
        }

        // Actualizar en el estado local
        setFetchedProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === stagedProduct.id
              ? { ...product, quantity: product.quantity + 1 }
              : product
          )
        );

        toast({
          title: "Cantidad actualizada",
          description: `La cantidad del producto "${stagedProduct.name}" se incrementó.`,
        });
      } catch (error) {
        console.error("Error al actualizar el producto:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el producto en el backend.",
          variant: "destructive",
        });
      }
    }
    setIsModalOpen(false);
    setStagedProduct(null); // Limpiar el estado temporal
  };

  // Handle cancellation from the modal
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setStagedProduct(null); // Limpiar el estado temporal sin realizar cambios
  };

  const fetchProducts = async (page = 1) => {
    try {
      const response = await fetch(`/api/products?page=${page}&limit=${limit}`); // Enviar parámetros de paginación
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      setFetchedProducts(data.data); // Ajustado para acceder a la clave 'data' en la respuesta
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

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la cantidad en el backend.");
      }

      setFetchedProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, quantity: newQuantity } : product
        )
      );
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePurchased = async (id: number, purchased: boolean) => {
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

      setFetchedProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === id ? { ...product, purchased } : product
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

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto en el backend.");
      }

      setFetchedProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
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
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-green-400 via-blue-500 to-blue-600 text-gray-900 p-8 pt-16">
      <Card className="w-full max-w-md shadow-2xl mb-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg border border-gray-600">
        <CardHeader>
          <div className="flex flex-col items-center">
            <Image
              src="/images/bolucompras-logo.png"
              alt="Bolucompras Logo"
              width={120}
              height={120}
              className="mb-6 rounded-full shadow-lg border-4 border-gray-500"
            />
            <CardTitle className="text-center text-4xl font-extrabold text-gray-100 tracking-wide">
              Bienvenido a Bolucompras
            </CardTitle>
            <p className="text-center text-gray-300 mt-2 text-lg">
              Tu lista de compras organizada y fácil de gestionar
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <AddProductForm
            onAddProduct={(name, category, priority) => {
              handleAddProductClick(name, category, priority);
            }}
            isLoading={isLoading}
            onToggleList={() => setShowTable((prev) => !prev)}
            isTableVisible={showTable}
            products={fetchedProducts} // Pasar la lista de productos
            onUpdateQuantity={handleUpdateQuantity} // Pasar la función para actualizar cantidades
          />
        </CardContent>
      </Card>

      {showTable ? (
        <div className="flex flex-col items-center">
          <ProductList
            products={fetchedProducts}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdatePurchased={handleUpdatePurchased}
            onDeleteProduct={handleDeleteProduct}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            currentPage={currentPage}
          />
        </div>
      ) : null}
    </main>
  );
}
