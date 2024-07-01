import React, { useContext, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Counter from "./counter";
import { useCart } from "../_context/CartContext";

// Define the type for a product
export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
}

// Define the class ClientProducts implementing the Product interface
export class ClientProducts implements Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
  quantity: number;

  constructor(product: Product, quantity: number) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.image = product.image;
    this.details = product.details;
    this.quantity = quantity;
  }
}

// Define the type for the props
interface ProductListProps {
  productList: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ productList }) => {
  const [productQuantities, setProductQuantities] = useState<{ [key: number]: number }>({});
  const { cart, setCart } = useCart();

  const handleCountChange = (productId: number, newQuantity: number) => {
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: newQuantity,
    }));
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newClientProduct = new ClientProducts(product, quantity);
        return [...prevCart, newClientProduct];
      }
    });
  };

  return (
    <div id="product" className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center justify-items-center justify-self-center items-center">
      {productList.map((product) => (
        <div 
          key={product.id}
          className="transition ease-out duration-200 hover:scale-110 hover:z-40 p-4 mb-6 w-full bg-white rounded-lg shadow-hovprimary shadow-sm hover:shadow-2xl"
        >
          <img
            alt=""
            src={product.image}
            className="h-56 w-full rounded-md object-fill"
          />
          <div className="flex justify-between">
            <div className="flex flex-col mt-2">
              <dl>
                <div className="text-xl items-end text-black">
                  {product.price}
                </div>
                <div className="text-primary font-medium">{product.name}</div>
                <p className="text-gray-400 text-xs ">{product.details}</p>
              </dl>
              <div>
                <button
                  className="mt-2 group hover:rounded duration-300 relative inline-block overflow-hidden border border-primary px-8 py-3 focus:outline-none focus:ring"
                  onClick={() => addToCart(product, productQuantities[product.id] || 1)}
                >
                  <span className="absolute inset-y-0 left-0 w-[2px] bg-hovprimary transition-all duration-500 group-hover:w-full group-active:bg-primary"></span>
                  <span className="flex relative text-sm font-medium text-primary transition-colors group-hover:text-white">
                    Add
                    <ShoppingCart className="pl-1 pb-2" />
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between flex-nowrap">
              <div>
                <div className="flex flex-col items-center rounded border border-gray-200">
                  <Counter
                    initialCount={1}
                    onCountChange={(newCount) =>
                      handleCountChange(product.id, newCount)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
