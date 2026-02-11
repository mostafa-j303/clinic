import React, { useState } from "react";
import { Pencil, ShoppingCart, Trash2 } from "lucide-react";
import Counter from "./counter";
import { useCart } from "../_context/CartContext";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "./Alert";
import ConfirmationModal from "./ConfirmationModal";

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
  onDeleteProduct: (id: number) => void;
  onEditProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  productList,
  onDeleteProduct,
  onEditProduct,
}) => {
  const [productQuantities, setProductQuantities] = useState<{
    [key: number]: number;
  }>({});
  const { cart, setCart } = useCart();
  const { isAdmin } = useAdminAuth();

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
        onDeleteProduct(productToDelete.id);
        setAlertMessage("Product deleted successfully");
        setShowAlert(true);
      } else {
        setAlertMessage("Failed to delete product");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setAlertMessage("An error occurred while deleting the product");
      setShowAlert(true);
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
      {showConfirmation && productToDelete && (
        <ConfirmationModal
          text={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmation(false);
            setProductToDelete(null);
          }}
          isDangerous={true}
        />
      )}

      <Swiper
        modules={[Navigation, Pagination, Grid]}
        spaceBetween={12}
        slidesPerView={2}
        slidesPerGroup={2}
        grid={{
          rows: 2,
          fill: "row",
        }}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          480: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 12 },
          768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 },
          1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 },
        }}
        className="w-full"
      >
        {productList.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="w-full h-full">
              {/* Product Card */}
              <div className="w-full h-full min-h-96 bg-white rounded-lg border-2 border-gray-200 hover:border-primary overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                
                {/* Image Container */}
                <div className="relative w-full h-40 bg-gray-100 overflow-hidden group flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-300"
                  />
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="flex items-center justify-center size-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="flex items-center justify-center size-10 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex flex-col flex-grow p-3 overflow-hidden">
                  
                  {/* Main Content - Price, Name, Description */}
                  <div className="flex-grow overflow-hidden">
                    {/* Price */}
                    <div className="text-lg md:text-xl font-bold text-primary truncate mb-1">
                      {product.price}
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                      {product.name}
                    </h3>

                    {/* Details */}
                    <p className="text-[10px] md:text-xs text-gray-600 line-clamp-3">
                      {product.details}
                    </p>
                  </div>

                  {/* Counter - Right Side */}
                  <div className=" flex justify-center">
                    <Counter
                      initialCount={productQuantities[product.id] || 1}
                      onCountChange={(newCount) =>
                        handleCountChange(product.id, newCount)
                      }
                    />
                  </div>

                  {/* Add Button - Full Width */}
                  <button
                    onClick={() =>
                      addToCart(product, productQuantities[product.id] || 1)
                    }
                    className="w-full mt-2 flex items-center justify-center gap-1 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg text-white font-semibold py-2 px-2 rounded-lg transition-all duration-300 active:scale-95 text-xs md:text-sm flex-shrink-0"
                  >
                    <ShoppingCart size={16} />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default ProductList;