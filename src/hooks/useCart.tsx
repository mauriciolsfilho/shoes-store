import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const updateCartAndPersist = (value: Product[]): void => {
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(value));
    setCart(value);
  };

  const getStockProduct = async (id: number): Promise<Stock> => {
    const { data: stock } = await api.get<Stock>(`/stock/${id}`);
    return stock;
  };

  const getProduct = async (id: number): Promise<Product> => {
    const { data: product } = await api.get<Product>(`/products/${id}`);
    return product;
  };

  const addProduct = async (productId: number) => {
    try {
      const cartList = [...cart];
      const stock = await getStockProduct(productId);

      const prodExists = cartList.find((prod) => prod.id === productId);
      const reqAmount = prodExists ? prodExists.amount + 1 : 1;

      console.log(reqAmount, stock);
      if (reqAmount > stock.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      const product = await getProduct(productId);

      cartList.push({ ...product, amount: 1 });
      updateCartAndPersist(cartList);
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
