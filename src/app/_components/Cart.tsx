import React, { useMemo } from "react";
import { useCart } from "../_context/CartContext";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number | string;
  details: string;
  image: string;
  quantity: number;
}

interface CartProps {
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Cart: React.FC<CartProps> = ({ setIsCartOpen }) => {
  const { cart, setCart } = useCart();

  const handleRemove = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleViewCartClick = () => {
    setIsCartOpen(false);
  };

  const totalPrice = useMemo(() => {
    const total = cart.reduce((acc, item) => {
      let price: number;
      
      // Remove $ and any non-numeric characters, then parse
      if (typeof item.price === "string") {
        price = parseFloat(item.price.replace(/[^\d.-]/g, ""));
      } else {
        price = item.price;
      }
      
      // Return 0 if price is NaN, otherwise add to total
      return acc + (isNaN(price) ? 0 : price * (item.quantity || 1));
    }, 0);
    
    // Return "0.00" if total is NaN or invalid
    return isNaN(total) ? "0.00" : total.toFixed(2);
  }, [cart]);

  const isEmpty = cart.length === 0;

  return (
    <div className="fixed top-14 right-4 md:right-8 w-full max-w-sm bg-white rounded-lg shadow-2xl z-40 border border-gray-200 flex flex-col max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 flex items-center gap-2">
        <ShoppingCart size={20} />
        <h3 className="text-lg font-semibold">Shopping Cart</h3>
        <span className="ml-auto bg-white text-primary px-2.5 py-0.5 rounded-full text-sm font-bold">
          {cart.length}
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4">
            <ShoppingCart size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 text-center">No products added yet.</p>
            <p className="text-xs text-gray-400 text-center mt-2">
              Start shopping to add items to your cart
            </p>
          </div>
        ) : (
          <ul className="space-y-2 p-3">
            {cart.map((item: CartItem) => (
              <li
                key={item.id}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex gap-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {item.details}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-primary">
                        {item.price}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    aria-label={`Remove ${item.name}`}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Total:</span>
            <span className="text-lg font-bold text-primary">${totalPrice}</span>
          </div>
        </div>
      )}

      {/* View Cart Button */}
      {isEmpty ? (
        <button
          onClick={handleViewCartClick}
          className="w-full bg-primary hover:bg-hovprimary text-white font-semibold py-3 px-4 transition-colors rounded-b-lg text-center text-sm"
        >
          Continue Shopping
        </button>
      ) : (
        <Link
          href="/Cart"
          onClick={handleViewCartClick}
          className="w-full bg-primary hover:bg-hovprimary text-white font-semibold py-3 px-4 transition-colors rounded-b-lg text-center text-sm block"
        >
          View Full Cart
        </Link>
      )}
    </div>
  );
};

export default Cart;