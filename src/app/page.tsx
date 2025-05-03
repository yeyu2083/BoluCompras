'use client'; // <-- ADD THIS DIRECTIVE AT THE VERY TOP

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image'; // Import Image component from Next.js
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

interface Product {
  id: number;
  producto: string;
  precio: number | null;
  cantidad_predeterminada: number;
  cantidad: number;
  categoria: string;
  prioridad: number;
  comprado: boolean;
  creado_en: string;
  actualizado_en: string;
}

export default function Home() {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for adding product
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
  const [productToAdd, setProductToAdd] = useState<Product | null>(null); // Producto a agregar
  const { toast } = useToast();
  const router = useRouter();
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]); // State to store fetched products
  const [showTable, setShowTable] = useState(false); // State to toggle table visibility
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const limit = 10; // Límite de productos por página
  const [stagedProduct, setStagedProduct] = useState<Product | null>(null); // Estado temporal para el producto duplicado

  const inputWebhookUrl = "http://localhost:5678/webhook-test/input"; // Webhook for adding/incrementing

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
           p.producto.toLowerCase() === productToProcess.producto.toLowerCase()
       );

       if (existingProductIndex > -1) {
         const updatedProducts = [...currentProducts];
         updatedProducts[existingProductIndex].cantidad += 1;
         return updatedProducts;
       } else {
         return [...currentProducts, { ...productToProcess, cantidad: 1 }];
       }
     });
    optimisticUpdateApplied = true;
    setProductName("");

    try {
      // Prepare data payload including default category and priority
      const payload = {
        producto: productToProcess.producto,  // Cambiado de 'product' a 'producto'
        cantidad: 1,                      // Añadido campo 'cantidad' que faltaba
        categoria: 'General',             // Cambiado de 'category' a 'categoria'
        prioridad: 1
      };
      // console.log("Sending payload:", JSON.stringify(payload)); // Uncomment for debugging

      const response = await fetch(inputWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send the full payload
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      toast({
        title: "Success!",
        description: `Product "${productToProcess.producto}" processed.`,
        variant: "default",
      });

      // Optional: await fetchProducts(); // Refetch after success if needed

    } catch (error) {
      console.error("Error sending data to webhook:", error);
      toast({
        title: "Webhook Error",
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
    }
  };

  // Prepare to add product (check existence, open modal if needed)
  const handleAddProductClick = async () => {
    const trimmedName = productName.trim();
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

    const existingProduct = fetchedProducts.find(
      (product) => product.producto.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingProduct) {
      setStagedProduct(existingProduct); // Guardar en estado temporal
      setIsModalOpen(true);
    } else {
      const newProduct: Product = {
        id: Date.now(),
        producto: trimmedName,
        precio: null,
        cantidad_predeterminada: 1,
        cantidad: 1,
        categoria: "General",
        prioridad: 1,
        comprado: false,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
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
  };

  // Handle Enter key press in the input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddProductClick();
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
          body: JSON.stringify({ cantidad: stagedProduct.cantidad + 1 }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el producto en el backend.");
        }

        // Actualizar en el estado local
        setFetchedProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === stagedProduct.id
              ? { ...product, cantidad: product.cantidad + 1 }
              : product
          )
        );

        toast({
          title: "Cantidad actualizada",
          description: `La cantidad del producto "${stagedProduct.producto}" se incrementó.`,
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

  useEffect(() => {
    fetchProducts(); // Fetch products on component mount
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 text-gray-900 p-8 pt-16">
      {/* Input Card */}
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
          <Input
            type="text"
            placeholder="Ingresa el nombre del producto..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="border-gray-500 focus:border-gray-400 focus:ring-gray-400 rounded-lg shadow-sm bg-gray-700 text-white"
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            onClick={handleAddProductClick}
            disabled={isLoading || !productName.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
          >
            {isLoading ? "Procesando..." : "Agregar Producto"}
          </Button>
          <Button
            onClick={() => {
              setShowTable(!showTable);
              if (!showTable) {
                fetchProducts(); // Fetch products when showing the table
              }
            }}
            className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
          >
            {showTable ? "Ocultar Lista" : "Ver Lista"}
          </Button>
        </CardFooter>
      </Card>

      {showTable && (
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-4 text-center bg-gradient-to-r from-gray-800 to-gray-700 py-2 rounded-lg shadow-md">Explora Tu Inventario</h2>
          <table className="table-auto w-full bg-white rounded-lg shadow-2xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <th className="px-6 py-3 text-left font-semibold shadow-md">Nombre</th>
                <th className="px-6 py-3 text-left font-semibold shadow-md">Cantidad</th>
                <th className="px-6 py-3 text-left font-semibold shadow-md">Categoría</th>
                <th className="px-6 py-3 text-left font-semibold shadow-md">Prioridad</th>
                <th className="px-6 py-3 text-left font-semibold shadow-md">Comprado</th>
                <th className="px-6 py-3 text-left font-semibold shadow-md">Creado</th>
              </tr>
            </thead>
            <tbody>
              {fetchedProducts.length > 0 ? (
                fetchedProducts.map((product, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                    } hover:bg-gray-200 transition-colors shadow-sm`}
                  >
                    <td className="px-6 py-3 text-gray-800 shadow-sm">{product.producto}</td>
                    <td className="px-6 py-3 text-gray-800 shadow-sm">
                      <input
                        type="number"
                        value={product.cantidad}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value, 10);
                          if (isNaN(newValue) || newValue < 0) return;

                          setFetchedProducts((prevProducts) =>
                            prevProducts.map((p) =>
                              p.id === product.id ? { ...p, cantidad: newValue } : p
                            )
                          );
                        }}
                        onBlur={async (e) => {
                          const newValue = parseInt(e.target.value, 10);
                          try {
                            const response = await fetch(`/api/products/${product.id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ cantidad: newValue }),
                            });

                            if (!response.ok) {
                              throw new Error("Error al actualizar la cantidad.");
                            }
                          } catch (error) {
                            console.error("Error al actualizar la cantidad:", error);
                          }
                        }}
                        className="w-16 bg-gray-100 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-3 text-gray-800 shadow-sm">{product.categoria}</td>
                    <td className="px-6 py-3 text-gray-800 shadow-sm">{product.prioridad}</td>
                    <td className="px-6 py-3 text-gray-800 shadow-sm">
                      <select
                        value={product.comprado ? "Sí" : "No"}
                        onChange={async (e) => {
                          const newValue = e.target.value === "Sí";
                          try {
                            const response = await fetch(`/api/products/${product.id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ comprado: newValue }),
                            });

                            if (!response.ok) {
                              throw new Error("Error al actualizar el estado de comprado.");
                            }

                            setFetchedProducts((prevProducts) =>
                              prevProducts.map((p) =>
                                p.id === product.id ? { ...p, comprado: newValue } : p
                              )
                            );
                          } catch (error) {
                            console.error("Error al actualizar el estado de comprado:", error);
                          }
                        }}
                        className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-gray-800 shadow-sm">{new Date(product.creado_en).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-3 text-center text-gray-500 shadow-sm">
                    No hay productos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
            >
              Página Anterior
            </Button>
            <Button
              onClick={handleNextPage}
              className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
            >
              Página Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-800 to-gray-700 text-gray-100 rounded-lg shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-100">Confirmar Añadir</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              El producto "{productToAdd?.producto}" ya está en tu lista. ¿Deseas añadir otro ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-4">
            <AlertDialogCancel className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleModalConfirm} // Vincular la función al botón de confirmación
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
            >
              Añadir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
