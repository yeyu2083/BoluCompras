export interface Product {
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

export interface UpdateOptions {
  categoria?: string;
  prioridad?: number;
}

export interface ProductListProps {
  products: Product[];
  onUpdateQuantity: (id: string, quantity: number, options?: UpdateOptions) => Promise<void>;
  onUpdatePurchased: (id: string, purchased: boolean) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentPage: number;
}

export interface AddProductFormProps {
  onAddProduct: (name: string, category: string, priority: number) => void;
  isLoading?: boolean;
  onToggleList: () => void;
  isTableVisible: boolean;
  products: Product[];
  onUpdateQuantity: (id: string, quantity: number, options?: UpdateOptions) => Promise<void>;
  onUpdatePurchased: (id: string, purchased: boolean) => Promise<void>;
}
