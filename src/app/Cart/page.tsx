"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "../_context/CartContext";
import data from "../../../public/data.json";
import Link from "next/link";
import LocationLoader from "../_components/Apploading"; // Adjust the path as needed

const CartPage: React.FC = () => {
  const { cart, setCart } = useCart();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [locationLink, setLocationLink] = useState<string | null>(null);
  const [locationFetched, setLocationFetched] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false); // New state

  // Parse data from JSON file
  const parsedData = {
    discount: parseFloat(data.discount.replace("$", "")),
    delivery: parseFloat(data.delivery.replace("$", "")),
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("name");
      const storedLastName = localStorage.getItem("lastName");
      const storedAddress = localStorage.getItem("address");
      const storedLocationLink = localStorage.getItem("locationLink");

      if (storedName) setName(storedName);
      if (storedLastName) setLastName(storedLastName);
      if (storedAddress) setAddress(storedAddress);
      if (storedLocationLink) {
        setLocationLink(storedLocationLink);
        setLocationFetched(true);
      }
    }
  }, []);

  const handleRemove = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (acc, item) =>
      acc + parseFloat(item.price.replace("$", "")) * item.quantity,
    0
  );

  // Calculate discount amount
  const discountAmount = subtotal * (parsedData.discount / 100);

  // Calculate total including discount and delivery charge
  const total = subtotal - discountAmount + parsedData.delivery;

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setFetchingLocation(true); // Start fetching
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setLocationLink(googleMapsLink);
          setLocationFetched(true);
          localStorage.setItem("locationLink", googleMapsLink);
          setFetchingLocation(false); // Finished fetching
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please allow location access to fetch your location.");
          }
          setFetchingLocation(false); // Finished fetching (even if denied)
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Clear location
  const clearLocation = () => {
    setLocationLink(null);
    setLocationFetched(false);
    localStorage.removeItem("locationLink");
  };

  // Handle input changes and save to local storage
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    localStorage.setItem("name", value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    localStorage.setItem("lastName", value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAddress(value);
    localStorage.setItem("address", value);
  };

  // Prepare WhatsApp message
  const prepareWhatsAppMessage = () => {
    let message = `Order Details:\n\nName: ${name} ${lastName}\nAddress: ${address}\nTotal: $${total.toFixed(
      2
    )}\n\nItems:\n`;

    cart.forEach((item) => {
      message += `${item.name} - ${item.quantity} x ${item.price}\n`;
    });

    message += `\nSubtotal: $${subtotal.toFixed(2)}`;
    message += `\nDiscount: -$${discountAmount.toFixed(2)}`;
    message += `\nDelivery Charge: $${parsedData.delivery.toFixed(2)}`;
    message += `\nTotal: $${total.toFixed(2)}`;

    if (locationFetched && locationLink) {
      message += `\n\nLocation: ${locationLink}`;
    }

    return `https://wa.me/${data.social.number}?text=${encodeURIComponent(
      message
    )}`;
  };

  // Handle checkout
  const handleCheckout = () => {
    if (
      !name ||
      !lastName ||
      !address ||
      !locationFetched ||
      cart.length < 1 // Corrected from cart.map.length to cart.length
    ) {
      alert("Please fill out all required fields and fetch your location.");
      return;
    }
    const whatsappLink = prepareWhatsAppMessage();
    window.open(whatsappLink, "_blank");
  };

  return (
    <section className="bg-gradient-to-br from-hovsecondary via-white to-hovsecondary">
      <Link
        href={"/#home"}
        className="text-white m-1 bg-primary p-4 rounded-b-2xl  md:hidden"
      >
        Return to Home
      </Link>
      {/** Conditional rendering of the loader */}
      {fetchingLocation && <LocationLoader />}

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="bg-gray-50 rounded-2xl h-full mx-auto max-w-3xl">
          <header className="text-center">
            <h1 className="pt-5 text-xl font-bold text-gray-900 sm:text-3xl">
              Your Cart
            </h1>
          </header>

          <div className="mt-8">
            {cart.length === 0 ? (
              <p className="mt-4 m-4 bg-secondary text-primary pr-9 pl-9 pt-3 pb-3 rounded-xl animate-bounce">
                No products added yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {cart.map((item, index) => (
                  <li
                    key={index}
                    className="p-5 m-4 rounded-2xl bg-hovprimary flex items-center gap-4"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-16 h-16 rounded object-fill"
                    />
                    <div>
                      <h1 className="text-sm text-gray-900">{item.name}</h1>
                      <dl className="mt-0.5 space-y-px text-[10px] text-gray-600">
                        <div>{item.details}</div>
                      </dl>
                      <h3 className="text-black">{item.price}</h3>
                    </div>
                    <div className="flex flex-1 items-center justify-end gap-2">
                      <form>
                        <label
                          htmlFor={`Line${index + 1}Qty`}
                          className="sr-only"
                        >
                          Quantity
                        </label>
                        <input
                          disabled
                          type="number"
                          min="1"
                          value={item.quantity}
                          id={`Line${index + 1}Qty`}
                          className="h-8 w-12 rounded border-gray-200 bg-gray-50 p-0 text-center text-xs text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </form>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="bg-secondary p-2 rounded-xl text-gray-600 hover:text-red-600 transition duration-500"
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
                ))}
              </ul>
            )}
            <div className="bg-gray-200 rounded-b-2xl p-5 mt-8 flex justify-end border-t border-gray-100 pt-8">
              <div className="w-screen max-w-lg space-y-4">
                <div>
                  <dl className="space-y-0.5 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd>${subtotal.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Delivery Charge</dt>
                      <dd>${parsedData.delivery.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Discount ({parsedData.discount}%)</dt>
                      <dd>-${discountAmount.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between !text-base font-medium">
                      <dt>Total</dt>
                      <dd>${total.toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={handleNameChange}
                    className="border text-black p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={handleLastNameChange}
                    className="border p-2 text-black rounded"
                  />
                  <textarea
                    placeholder="Enter your address detail"
                    value={address}
                    onChange={handleAddressChange}
                    className="border p-2 text-black rounded"
                  ></textarea>

                  <div className="flex space-x-4">
                    <button
                      onClick={fetchLocation}
                      className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={locationFetched}
                    >
                      {locationFetched ? "Location Fetched" : "Fetch Location"}
                    </button>
                    {locationFetched && (
                      <button
                        onClick={clearLocation}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Clear Location
                      </button>
                    )}
                    {locationFetched && (
                      <Link
                        className="bg-secondary text-white px-4 py-2 pt-3 pb-3 rounded ml-3"
                        target="_blank"
                        href={locationLink || "home"}
                      >
                        Check Location
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={handleCheckout}
                    className={`${
                      !name ||
                      !lastName ||
                      !address ||
                      !locationFetched ||
                      cart.length < 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:bg-hovprimary"
                    } text-white px-4 py-2 rounded`}
                    disabled={
                      !name ||
                      !lastName ||
                      !address ||
                      !locationFetched ||
                      cart.length < 1
                    }
                  >
                    View My Cart
                  </button>
                </div>

                <h2 className="flex m-0 p-0 relative text-gray-400 text-[12px]">
                  All Items will be sent via Whatsapp
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
