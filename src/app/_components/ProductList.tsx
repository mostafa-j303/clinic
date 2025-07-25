import React, { useContext, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Counter from "./counter";
import { useCart } from "../_context/CartContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Grid } from "swiper/modules";

// Define the type for a product
export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
  categories: string;
}

// Define the class ClientProducts implementing the Product interface
export class ClientProducts implements Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
  quantity: number;
  categories: string;

  constructor(product: Product, quantity: number) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.image = product.image;
    this.details = product.details;
    this.quantity = quantity;
    this.categories = product.categories;
  }
}

// Define the type for the props
interface ProductListProps {
  productList: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ productList }) => {
  const [productQuantities, setProductQuantities] = useState<{
    [key: number]: number;
  }>({});
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
    // ✅ Reset counter to 1 after adding to cart
    setProductQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }));
  };

  return (
    <Swiper
      modules={[Navigation, Pagination, Grid]}
      spaceBetween={15}
      slidesPerView={2}
      slidesPerGroup={2}
      slidesPerGroupSkip={0}
      grid={{
        rows: 2,
        fill: "row",
      }}
      navigation
      pagination={{ clickable: true }}
      breakpoints={{
        768: { slidesPerView: 3, slidesPerGroup: 3 },
        1024: { slidesPerView: 4, slidesPerGroup: 4 },
        1280: { slidesPerView: 5, slidesPerGroup: 5 },
      }}
      className="w-full h-full"
    >
      {productList.map((product) => (
        <SwiperSlide key={product.id} className="h-full flex-wrap">
          <div className="transition ease-out duration-200 hover:z-40  w-full bg-white rounded-lg shadow-hovprimary shadow-sm hover:shadow-2xl h-full grid ">
            <img
              alt=""
              src={product.image}
              className="w-full max-h-40 min-h-40 rounded-md object-fill "
            />
            <div className="flex justify-between px-2 pb-3 pt-0">
              <div className="flex flex-col mt-2 justify-between">
                <dl>
                  <div className="text-sm items-end text-black">
                    {product.price}
                  </div>
                  <div className="text-primary text-[12px] font-normal min-h-6 max-h-6 leading-3 mb-1 ">{product.name}</div>
                  <p className="text-gray-400 text-[10px] line-clamp-3 min-h-9 max-h-9 overflow-hidden leading-3">
                    {product.details}
                  </p>
                </dl>
                <div>
                  <button
                    className="mt-1 group hover:rounded-xl rounded-lg duration-300 relative inline-block overflow-hidden border border-primary px-3 pt-1 py-1 focus:outline-none focus:ring"
                    onClick={() =>
                      addToCart(product, productQuantities[product.id] || 1)
                    }
                  >
                    <span className="absolute inset-y-0 left-0 w-[2px] bg-hovprimary transition-all duration-500 group-hover:w-full group-active:bg-primary"></span>
                    <span className="flex relative text-sm font-medium text-primary transition-colors group-hover:text-white">
                      Add
                      <ShoppingCart className="pl-1 pb-2" />
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-start mt-1 justify-between flex-nowrap">
                <div >
                  <div className="flex flex-col items-center rounded border border-gray-200">
                    <Counter
                      initialCount={productQuantities[product.id] || 1}
                      onCountChange={(newCount) =>
                        handleCountChange(product.id, newCount)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductList;
