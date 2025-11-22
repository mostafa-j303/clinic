import React, { useContext, useState } from "react";
import { Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Counter from "./counter";
import { useCart } from "../_context/CartContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Grid } from "swiper/modules";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "./Alert";
import ConfirmationModal from "./ConfirmationModal";

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
  onDeleteProduct: (id: number) => void;
  onEditProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ productList ,onDeleteProduct, onEditProduct}) => {

  const [productQuantities, setProductQuantities] = useState<{
    [key: number]: number;
  }>({});
  const { cart, setCart } = useCart();
  const { isAdmin, login, logout } = useAdminAuth();

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowConfirmation(true);
  };
  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/delete-product?id=${productToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        //the ondeleteproduct function from the prodcutsection cause the products are in the productsection file 
        onDeleteProduct(productToDelete.id);
        setAlertMessage("Product is deleted");
        setShowAlert(true);
      } else {
        setAlertMessage("Failed to delete product");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setShowConfirmation(false);
      setProductToDelete(null);
    }
  };

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
    <>
      {showAlert && (
        <Alert value={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      {showConfirmation && (
        <ConfirmationModal
          text={`Are you sure you want to delete "${productToDelete?.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
      <div className="px-4">
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
            <div className="transition ease-out duration-200 hover:z-40 w-full bg-white rounded-lg shadow-hovprimary shadow-sm hover:shadow-2xl h-full grid ">
              <img
                alt=""
                src={product.image}
                className="w-full max-h-36 min-h-36 rounded-md rounded-b-none object-fill border-b-0 border-primary "
              />
              <div className="flex justify-between px-2 pb-3 pt-0 flex-col rounded-md rounded-t-none border-t-0 border-primary ">
                <div className="flex justify-between ">
                  <div className="flex flex-col mt-2 justify-between">
                    <dl>
                      <div className="text-sm items-end text-black">
                        {product.price}
                      </div>
                      <div className="text-primary text-[12px] font-normal min-h-6 max-h-6 leading-3 mb-1 ">
                        {product.name}
                      </div>
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
                        <span className="absolute inset-y-0 left-0 w-[0px] bg-hovprimary transition-all duration-500 group-hover:w-full group-active:bg-primary"></span>
                        <span className="flex relative text-sm font-medium text-primary transition-colors group-hover:text-white text-center items-center">
                          Add
                          <ShoppingCart className="pl-1 size-5" />
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start mt-1 justify-between flex-nowrap">
                    <div>
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
                {isAdmin && (
                  <div className="flex gap-3 mt-2 flex-row-reverse">
                    <button
                      className="text-white rounded-lg bg-red-500 p-2"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 />
                    </button>
                    <button className="text-white rounded-lg bg-blue-500 p-2"
                    onClick={() => onEditProduct(product)}
                    >
                      {" "}
                      <Pencil />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
    </>
  );
};

export default ProductList;
