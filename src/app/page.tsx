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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Product {
  name: string;
  quantity: number;
}

export default function Home() {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state for adding product
  const [isFetchingList, setIsFetchingList] = useState(true); // Loading state for initial list fetch
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToAdd, setProductToAdd] = useState<Product | null>(null); // Store product info for modal confirmation
  const { toast } = useToast();

  const inputWebhookUrl = "http://localhost:5678/webhook-test/input"; // Webhook for adding/incrementing
  const listWebhookUrl = "http://localhost:5678/webhook-test/products"; // Webhook for getting the list

  // Fetch initial product list
  const fetchProducts = async () => {
    setIsFetchingList(true);
    try {
      const response = await fetch(listWebhookUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data: Product[] = await response.json();
      // Ensure data is an array, default to empty array if not
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching product list:", error);
      setProducts([]); // Set empty list on error
      toast({
        title: "Error",
        description: "Could not fetch product list from n8n.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on component mount

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
        producto: productToProcess.name,  // Cambiado de 'product' a 'producto'
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
        description: `Product "${productToProcess.name}" processed.`,
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
       await fetchProducts(); // Refetch after error

    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setProductToAdd(null);
    }
  };

  // Prepare to add product (check existence, open modal if needed)
  const handleAddProductClick = () => {
    const trimmedName = productName.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Please enter a product name.",
        variant: "destructive",
      });
      return;
    }

    const productExists = products.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const productData = { name: trimmedName, quantity: 1 };

    if (productExists) {
      setProductToAdd(productData);
      setIsModalOpen(true);
    } else {
      setProductToAdd(productData);
      proceedWithAddingProduct(productData);
    }
  };

  // Handle Enter key press in the input field
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddProductClick();
    }
  };

  // Handle confirmation from the modal
  const handleModalConfirm = () => {
    if (productToAdd) {
      proceedWithAddingProduct(productToAdd);
    }
  };

  // Handle cancellation from the modal
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setProductToAdd(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-sky-100 via-cyan-100 to-blue-200 p-8 pt-16">
      {/* Input Card */}
      <Card className="w-full max-w-md shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-blue-800">
            Bolucompras List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Enter product name..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isFetchingList}
            className="border-cyan-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleAddProductClick}
            disabled={isLoading || isFetchingList || !productName.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
          >
            {isLoading ? "Processing..." : "Add Product"}
          </Button>
        </CardFooter>
      </Card>

      {/* Product List Card */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold text-blue-700">
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFetchingList ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full bg-slate-200" />
              <Skeleton className="h-8 w-full bg-slate-200" />
              <Skeleton className="h-8 w-full bg-slate-200" />
            </div>
          ) : products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%] text-blue-800">Product</TableHead>
                  <TableHead className="text-right text-blue-800">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">Your shopping list is empty.</p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Addition</AlertDialogTitle>
            <AlertDialogDescription>
              The product "{productToAdd?.name}" is already in your list. Do you want to add another one (increment quantity)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleModalCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleModalConfirm}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
