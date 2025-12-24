"use client";
import React, { useState, useEffect } from "react";
import { useSettings } from "../_context/SettingsContext";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";
import { MaterialReactTable } from "material-react-table";
import { MRT_ColumnDef } from "material-react-table";
import { Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type OrderItem = {
  productId: number;
  name: string;
  price: string;
  quantity: number;
};

type Order = {
  id: number;
  customerName: string;
  customerLastName: string;
  phone: string;
  address: string;
  locationLink: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  items: OrderItem[];
};

export default function SettingsPage() {
  const { settings, loading, error } = useSettings();
  const { isAdmin, isChecking } = useAdminAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push("/");
    }
  }, [isChecking, isAdmin, router]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/get-orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data.orders);
      } catch (err: any) {
        setAlertMessage(err.message);
        setShowAlert(true);
      }
    };
    fetchOrders();
  }, []);

  const sendOrderByWhatsApp = (order: Order) => {
  let message = `Hello ${order.customerName}, 👋\n\n`;
  message += `Your order has been placed successfully and is currently *pending confirmation*.\n`;
  message += `Please review the details below and reply *CONFIRM* to proceed with delivery.\n\n`;

  message += `🧾 Order Summary\n`;
  message += `---------------------\n`;
  message += `Name: ${order.customerName} ${order.customerLastName}\n`;
  message += `Phone: ${order.phone}\n`;
  message += `Address: ${order.address}\n`;
  message += `Payment Method: ${order.paymentMethod}\n\n`;

  message += `📦 Items:\n`;
  order.items.forEach((item) => {
    message += `• ${item.name} — ${item.quantity} × ${item.price}\n`;
  });

  message += `\n💰 Charges:\n`;
  message += `Subtotal: $${order.subtotal.toFixed(2)}\n`;
  message += `Discount: -$${order.discount.toFixed(2)}\n`;
  message += `Delivery: $${order.delivery.toFixed(2)}\n`;
  message += `*Total: $${order.total.toFixed(2)}*\n`;

  if (order.locationLink) {
    message += `\n📍 Location:\n${order.locationLink}`;
  }

  message += `\n\nThank you for ordering with us 🙏`;

  const whatsappUrl = `https://wa.me/${order.phone}?text=${encodeURIComponent(
    message
  )}`;

  window.open(whatsappUrl, "_blank");
};



  const columns = React.useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Customer", accessorFn: (row) => `${row.customerName} ${row.customerLastName}` },
      { header: "Phone", accessorKey: "phone" },
      { header: "Payment", accessorKey: "paymentMethod" },
      { header: "Status", accessorKey: "status" },
      { header: "Subtotal", accessorKey: "subtotal" , Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}`},
      { header: "Discount", accessorKey: "discount" , Cell: ({ cell }) => `${cell.getValue<number>().toFixed(2)}%`},
      { header: "Delivery", accessorKey: "delivery", Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}` },
      { header: "Total", accessorKey: "total", Cell: ({ cell }) => `$${cell.getValue<number>().toFixed(2)}` },
      { header: "Created At", accessorKey: "createdAt" },
    ],
    []
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 mx-auto bg-white">
      {showAlert && <Alert value={alertMessage} onClose={() => setShowAlert(false)} />}
      <h1 className="text-2xl font-bold mb-4 text-gray-600 mt-14">Orders</h1>

      <MaterialReactTable
        columns={columns}
        data={orders}
        renderDetailPanel={({ row }) => (
  <div className="flex flex-row gap-4 p-4 items-start">
    <div>
      <h3 className="font-bold mb-2">Order Items</h3>
      <table className="w-fit border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Product Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {row.original.items.map((item) => (
            <tr key={item.productId}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.price}</td>
              <td className="p-2 border">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-gray-700">Customer Address</label>
      <textarea
        disabled
        value={row.original.address}
        className="w-full h-32 p-2 border rounded resize-none text-gray-700"
      />
      
    </div>
    <div className="flex flex-col gap-2 mt-6">  
    <button
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-1 flex gap-2 justify-center items-center"
        onClick={() => sendOrderByWhatsApp(row.original)}
      >
        Send By WhatsApp <FaWhatsapp size={20} />
      </button>
       <button
        onClick={() => window.open(row.original.locationLink, "_blank")}
        className="bg-primary hover:bg-hovprimary text-white px-4 py-2 rounded mt-1 flex gap-2 justify-center items-center"
      >
        Check Location
      </button>
       <button
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mt-1 flex gap-2 justify-center items-center"
      >
        Delete Order <Trash2 size={20} />
      </button>
    </div>
    
  </div>
)}

      />
    </div>
  );
}
