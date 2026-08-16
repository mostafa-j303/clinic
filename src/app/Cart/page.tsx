"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../_context/CartContext";
import { openWhishApp } from "../utils/openWhishApp";
import Link from "next/link";
import LocationLoader from "../_components/Apploading";
import Image from "next/image";
import Alert from "../_components/Alert";
import { useSettings } from "../_context/SettingsContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  MapPin,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Phone as PhoneIcon,
  User,
  MapPinIcon,
  DollarSign,
} from "lucide-react";
import { generateOrderEmailHTML } from "../utils/emailTemplates";

// Memoized Cart Item Component
const CartItemCard = React.memo(
  ({
    item,
    index,
    onRemove,
  }: {
    item: any;
    index: number;
    onRemove: (id: number) => void;
  }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.details}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-primary">{item.price}</span>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm font-semibold text-gray-700 dark:text-gray-200">
                Qty: {item.quantity}
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);

CartItemCard.displayName = "CartItemCard";

// Memoized Price Summary Component
const PriceSummary = React.memo(
  ({
    subtotal,
    discount,
    delivery,
    total,
    minOrder,
    discountPercentage,
  }: {
    subtotal: number;
    discount: number;
    delivery: number;
    total: number;
    minOrder: number;
    discountPercentage: number;
  }) => {
    const isBelowMinimum = total < minOrder;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>

        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Discount ({discountPercentage}%)</span>
            <span className="font-semibold text-red-600">
              -${discount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Delivery Charge</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${delivery.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-gray-900 dark:text-white">Total</span>
          <span className="text-2xl font-bold text-primary">
            ${total.toFixed(2)}
          </span>
        </div>

        {isBelowMinimum && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
            <AlertCircle size={18} className="text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Minimum order is <span className="font-bold">${minOrder.toFixed(2)}</span>. 
              Add <span className="font-bold">${(minOrder - total).toFixed(2)}</span> more to proceed.
            </p>
          </div>
        )}
      </div>
    );
  }
);

PriceSummary.displayName = "PriceSummary";

// Memoized Location Section Component
const LocationSection = React.memo(
  ({
    locationFetched,
    locationLink,
    isFetchingLocation,
    onFetchLocation,
    onClearLocation,
  }: {
    locationFetched: boolean;
    locationLink: string | null;
    isFetchingLocation: boolean;
    onFetchLocation: () => void;
    onClearLocation: () => void;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <MapPin size={20} className="text-primary" />
        Delivery Location
      </h3>

      {locationFetched ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={20} className="text-green-600" />
            <span className="font-semibold text-green-900 dark:text-green-300">
              Location Fetched Successfully
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              className="flex-1 bg-primary hover:bg-hovprimary text-white font-semibold py-2 rounded-lg text-center transition-colors"
              target="_blank"
              href={locationLink || "#"}
            >
              View on Map
            </Link>
            <button
              onClick={onClearLocation}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onFetchLocation}
          disabled={isFetchingLocation}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isFetchingLocation
              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
              : "bg-primary hover:bg-hovprimary text-white"
          }`}
        >
          {isFetchingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Fetching Location...
            </>
          ) : (
            <>
              <MapPin size={20} />
              Fetch My Location
            </>
          )}
        </button>
      )}
    </div>
  )
);

LocationSection.displayName = "LocationSection";

// Memoized Form Input Component
const FormInput = React.memo(
  ({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
  }: {
    label: string;
    icon: any;
    value: string;
    onChange: (e: any) => void;
    placeholder: string;
    type?: string;
  }) => (
    <div>
      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
        <Icon size={18} className="text-primary" />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
      />
    </div>
  )
);

FormInput.displayName = "FormInput";

export default function CartPage() {
  // ────── Hooks ──────
  const { cart, setCart } = useCart();
  const { settings, loading, error } = useSettings();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [phone, setPhone] = useState("");
  const [locationLink, setLocationLink] = useState<string | null>(null);
  const [locationFetched, setLocationFetched] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
   const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ────── Effects ──────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("name");
      const storedLastName = localStorage.getItem("lastName");
      const storedAddress = localStorage.getItem("address");
      const storedLocationLink = localStorage.getItem("locationLink");
      const storedPhone = localStorage.getItem("phone");

      if (storedName) setName(storedName);
      if (storedLastName) setLastName(storedLastName);
      if (storedAddress) setAddress(storedAddress);
      if (storedLocationLink) {
        setLocationLink(storedLocationLink);
        setLocationFetched(true);
      }
      if (storedPhone) setPhone(storedPhone);
    }
  }, []);

  // ────── Handlers (Memoized) ──────
  const handleRemove = useCallback((productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, [setCart]);

  const fetchLocation = useCallback(() => {
    if (navigator.geolocation) {
      setFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          setLocationLink(googleMapsLink);
          setLocationFetched(true);
          localStorage.setItem("locationLink", googleMapsLink);
          setFetchingLocation(false);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            showAlertMessage("Please allow location access to fetch your location.", "error");
            setShowAlert(true);
          }
          setFetchingLocation(false);
        }
      );
    } else {
      showAlertMessage("Geolocation is not supported by this browser.", "error");
      setShowAlert(true);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocationLink(null);
    setLocationFetched(false);
    localStorage.removeItem("locationLink");
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setName(value);
      localStorage.setItem("name", value);
    },
    []
  );

  const handleLastNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLastName(value);
      localStorage.setItem("lastName", value);
    },
    []
  );

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setAddress(value);
      localStorage.setItem("address", value);
    },
    []
  );

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    localStorage.setItem("phone", value);
  }, []);

  const normalizePhone = (input: string): string | null => {
    let value = input.replace(/[^\d+]/g, "");
    if ((value.match(/\+/g) || []).length > 1) return null;
    if (value.includes("+") && !value.startsWith("+")) return null;
    value = value.replace("+", "");
    if (value.length < 9 || value.length > 15) return null;
    return `+${value}`;
  };

  const sendOrderToDatabase = useCallback(async () => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        lastName,
        phone,
        paymentMethod,
        address,
        locationLink,
        cart: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send order");
    }
    return data;
  }, [name, lastName, phone, paymentMethod, address, locationLink, cart]);

  const handleCheckout = useCallback(async () => {
    if (isSubmitting) return;
    if (
      !name ||
      !lastName ||
      !address ||
      !locationFetched ||
      !phone ||
      cart.length < 1
    ) {
      showAlertMessage(
        "Please fill out all required fields and fetch your location.",
        "error"
      );
      setShowAlert(true);
      return;
    }
    if (!settings) return;

    const minOrder = parseFloat(settings.minOrder.replace("$", ""));
    const parsedData = {
      discount: parseFloat(settings.discount.replace("$", "")),
      delivery: parseFloat(settings.delivery.replace("$", "")),
    };
    const subtotal = cart.reduce(
      (acc, item) =>
        acc + parseFloat(item.price.replace("$", "")) * item.quantity,
      0
    );
    const discountAmount = subtotal * (parsedData.discount / 100);
    const total = subtotal - discountAmount + parsedData.delivery;

    if (total < minOrder) {
      showAlertMessage(
        `Minimum order is $${minOrder.toFixed(
          2
        )}. Your total is $${total.toFixed(2)}.`,
        "error"
      );
      setShowAlert(true);
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      showAlertMessage("Please enter a valid phone number.", "error");
      setShowAlert(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOrderToDatabase();


      // Calculate order details for email
      const parsedData = {
        discount: parseFloat(settings.discount.replace("$", "")),
        delivery: parseFloat(settings.delivery.replace("$", "")),
      };
      const subtotal = cart.reduce(
        (acc, item) =>
          acc + parseFloat(item.price.replace("$", "")) * item.quantity,
        0
      );
      const discountAmount = subtotal * (parsedData.discount / 100);
      const total = subtotal - discountAmount + parsedData.delivery;
      
      //Mail sending logic starts here
      // Send confirmation email to admin
      if (settings.social.mail) {
        try {
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: settings.social.mail,
              subject: `New Order from ${name} ${lastName}`,
              htmlContent: generateOrderEmailHTML({
                customerName: `${name} ${lastName}`,
                customerPhone: phone,
                address,
                items: cart.map(item => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                })),
                subtotal,
                discount: discountAmount,
                delivery: parsedData.delivery,
                total,
                paymentMethod,
                brandPrimary: settings.colors?.primary,
                brandAccent: settings.colors?.accent,
              }),
              type: 'order',
              recipientName: 'Admin',
            }),
          });

          if (!emailResponse.ok) {
            console.error('Failed to send order confirmation email');
          }
        } catch (emailError) {
          console.error('Error sending order email:', emailError);
          // Don't fail the order if email fails
        }
      }
      //mail sending logic ends here

      showAlertMessage("Order has been sent successfully.", "success");
      setShowAlert(true);

     setCart([]);
    } catch (error) {
      showAlertMessage("Failed to send order. Please try again.", "error");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, name, lastName, address, locationFetched, phone, cart, settings, sendOrderToDatabase, setCart]);

  // ────── Memoized Calculations ──────
  const calculations = useMemo(() => {
    if (!settings) return null;
    const parsedData = {
      discount: parseFloat(settings.discount.replace("$", "")),
      delivery: parseFloat(settings.delivery.replace("$", "")),
    };
    const subtotal = cart.reduce(
      (acc, item) =>
        acc + parseFloat(item.price.replace("$", "")) * item.quantity,
      0
    );
    const discountAmount = subtotal * (parsedData.discount / 100);
    const total = subtotal - discountAmount + parsedData.delivery;
    const minOrder = parseFloat(settings.minOrder.replace("$", ""));

    return {
      subtotal,
      discountAmount,
      total,
      minOrder,
      discountPercentage: parsedData.discount,
      delivery: parsedData.delivery,
    };
  }, [settings, cart]);

  // ────── Conditional Rendering ──────
  if (loading) return <LocationLoader />;
  if (error) return <div>Error: {error}</div>;
  if (!settings) return <div>No settings found.</div>;
  if (!calculations) return <div>Loading...</div>;

  const isCheckoutDisabled =
    !name ||
    !lastName ||
    !address ||
    !locationFetched ||
    !phone ||
    cart.length < 1 ||
    isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {showAlert && (
        <Alert value={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
      )}

      {fetchingLocation && <LocationLoader />}

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {cart.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add some delicious items to get started!
            </p>
            <Link
              href="/#home"
              className="inline-block bg-primary hover:bg-hovprimary text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 max-h-[550px] overflow-y-auto pr-2 ">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Items
              </h2>
              {cart.map((item, index) => (
                <CartItemCard
                  key={index}
                  item={item}
                  index={index}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Summary */}
              <PriceSummary
                subtotal={calculations.subtotal}
                discount={calculations.discountAmount}
                delivery={calculations.delivery}
                total={calculations.total}
                minOrder={calculations.minOrder}
                discountPercentage={calculations.discountPercentage}
              />

              {/* Location */}
              <LocationSection
                locationFetched={locationFetched}
                locationLink={locationLink}
                isFetchingLocation={fetchingLocation}
                onFetchLocation={fetchLocation}
                onClearLocation={clearLocation}
              />
            </div>
          </div>
        )}

        {/* Checkout Form */}
        {cart.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormInput
                label="First Name"
                icon={User}
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your first name"
              />
              <FormInput
                label="Last Name"
                icon={User}
                value={lastName}
                onChange={handleLastNameChange}
                placeholder="Enter your last name"
              />
            </div>

            <div className="mb-6">
              <label className=" text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <PhoneIcon size={18} className="text-primary" />
                Phone Number
              </label>
              <PhoneInput
                country={"lb"}
                value={phone}
                onChange={handlePhoneChange}
                inputProps={{
                  name: "phone",
                  required: true,
                }}
                dropdownClass="custom-dropdown"
                enableSearch
                containerClass="w-full"
                inputClass="!w-full !py-2.5 !pl-12 !text-gray-900 dark:!text-white !border !rounded-lg !focus:ring-2 !focus:ring-primary"
              />
            </div>

            <div className="mb-6">
              <label className=" text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <MapPinIcon size={18} className="text-primary" />
                Delivery Address
              </label>
              <textarea
                placeholder="Enter your complete address with details"
                value={address}
                onChange={handleAddressChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none h-24 transition-all"
              />
            </div>

            <div className="mb-6">
              <label className=" text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <DollarSign size={18} className="text-primary" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-all"
              >
                <option value="Cash">Cash</option>
                <option value="Wish Money">Wish Money</option>
              </select>
            </div>

            {paymentMethod === "Wish Money" && (
              <div className="flex-col lg:flex-row md:flex-row bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-center gap-4">
                <Image
                  className="rounded-lg flex-shrink-0"
                  src={settings.images.whishlogo}
                  alt="Wish Logo"
                  width={50}
                  height={50}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Pay to Wish Account:
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {settings.social.wishnb}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openWhishApp}
                  className="bg-primary hover:bg-hovprimary text-white font-semibold py-2 px-4 rounded-lg transition-colors flex-shrink-0"
                >
                  Open App
                </button>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckoutDisabled}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                isCheckoutDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary hover:bg-hovprimary text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending Order...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Send Order via WhatsApp
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              All items will be confirmed via WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}