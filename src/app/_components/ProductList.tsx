import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import Counter from "./counter";

// Define the type for a product
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
}

// Define the class ClientProducts implementing the Product interface
class ClientProducts implements Product {
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
  const [clientProducts, setClientProducts] = useState<ClientProducts[]>([]);

  const handleCountChange = (productId: number, newQuantity: number) => {
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: newQuantity,
    }));
  };

  const addToCart = (product: Product, quantity: number) => {
    const newClientProduct = new ClientProducts(product, quantity);
    setClientProducts((prevClientProducts) => [...prevClientProducts, newClientProduct]);
  };

  return (
    <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center justify-items-center justify-self-center items-center">
      {productList.map((product) => (
        <div
          key={product.id}
          className="transition ease-out duration-200 hover:scale-110 hover:z-40 p-4 mb-6 w-full bg-white rounded-lg shadow-hovprimary shadow-sm hover:shadow-2xl"
        >
          <img
            alt=""
            src={product.image}
            className="h-56 w-full rounded-md object-cover"
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
      {/* Display the client's selected products */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Client Products</h2>
        {clientProducts.length === 0 ? (
          <p>No products added yet.</p>
        ) : (
          <ul>
            {clientProducts.map((item, index) => (
              <li key={index}>
              <div> - Quantity: {item.quantity}</div>
              <div>- Details: {item.details}</div>
              <div>- Name: {item.name}</div>
              <div>- Price:{item.price}</div>
              <div>- ID: {item.id}</div>
              <div>- image: {item.image}</div>
              </li>
              
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductList;
