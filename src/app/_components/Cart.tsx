// _components/Cart.tsx
import React from "react";
import { useCart } from "../_context/CartContext";
import Link from "next/link";

const Cart: React.FC = () => {
  const { cart, setCart } = useCart();

  const handleRemove = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  return (
    <div className="absolute lg:left-[66%] top-[6.7%] min-w-[300px] flex flex-col justify-between bg-hovprimary h-[300px] w-[250px] z-10 rounded-md border shadow-sm  mx-10 right-10  overflow-auto">
      <div>
        <h3 className="bg-primary p-4 pb-2 text-lg font-semibold mb-1">Shopping Cart:</h3>
        {cart.length === 0 ? (
          <p className="mt-4 m-2 bg-secondary text-primary pr-9 pl-9 pt-3 pb-3 rounded-xl animate-bounce">No products added yet.</p>
        ) : (
          <div className="m-1">
            <ul>
              {cart.map((item, index) => (
                <div key={index} className="mt-2 p-2 space-y-6 bg-secondary rounded-2xl">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt=""
                        className="size-16 rounded object-fill"
                      />
                      <div>
                        <h3 className="text-sm text-gray-900">{item.name}</h3>
                        <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                          <div>{item.details}</div>
                        </dl>
                        <h2>{item.price}</h2>
                      </div>
                      <div className="flex flex-1 items-center justify-end gap-2">
                        <form>
                          <label htmlFor="Line1Qty" className="sr-only"> Quantity </label>
                          <input
                            disabled
                            type="number"
                            min="1"
                            value={item.quantity}
                            id="Line1Qty"
                            className="h-8 w-12 rounded border-gray-200 bg-gray-50 p-0 text-center text-xs text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </form>
                        <button
                          className="p-2 bg-hovprimary rounded-xl text-gray-600 transition hover:text-red-600"
                          onClick={() => handleRemove(item.id)}
                        >
                          <span className="sr-only">Remove item</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="m-4 mt-[13px] space-y-4 text-center">
        <Link href={"/Cart"} className="w-full block rounded bg-white px-5 py-3 text-sm text-black hover:bg-hovsecondary hover:text-primary transition duration-500">
          View My Cart
        </Link>
      </div>
    </div>
  );
};

export default Cart;
