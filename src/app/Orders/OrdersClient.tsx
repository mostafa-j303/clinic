"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSettings } from "../_context/SettingsContext";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";
import AdminTable, { AdminTableColumn } from "../_components/AdminTable";
import {
  Trash2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ConfirmationModal from "../_components/ConfirmationModal";
import AdminShell from "../_components/AdminShell";

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

// Memoized Status Badge Component
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          icon: Clock,
        };
      case "sent":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          icon: Send,
        };
      case "delivered":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: CheckCircle2,
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: XCircle,
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border inline-flex items-center gap-1.5 ${config.bg} ${config.border} ${config.text}`}
    >
      <IconComponent size={16} />
      {status}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Memoized Order Detail Panel
const OrderDetailPanel = React.memo(
  ({
    order,
    onSendWhatsApp,
    onCheckLocation,
    onMarkDelivered,
    onCancelOrder,
    onDelete,
  }: {
    order: Order;
    onSendWhatsApp: (order: Order) => void;
    onCheckLocation: (url: string) => void;
    onMarkDelivered: (id: number) => void;
    onCancelOrder: (id: number) => void;
    onDelete: (id: number) => void;
  }) => {
    const isFinalStatus =
      order.status === "Delivered" || order.status === "Cancelled";

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xl">📦</span> Order Items
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Product
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center">
                        {item.price}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center font-semibold">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Discount:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  -{order.discount.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Delivery:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  ${order.delivery.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-lg text-primary">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Address & Location */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={20} /> Delivery Address
            </h3>
            <textarea
              disabled
              value={order.address}
              className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-lg resize-none text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 text-sm font-medium mb-4"
            />
            <button
              onClick={() => onCheckLocation(order.locationLink)}
              className="w-full bg-primary hover:bg-hovprimary text-white font-semibold py-2.5 rounded-lg flex gap-2 justify-center items-center transition-colors mb-4"
            >
              <MapPin size={18} />
              View on Map
            </button>

            {/* Payment & Order Info */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Payment Method
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Order Date
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              disabled={order.status !== "Pending"}
              onClick={() => onSendWhatsApp(order)}
              className={`px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center transition-all ${
                order.status !== "Pending"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FaWhatsapp size={18} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              disabled={isFinalStatus}
              onClick={() => onMarkDelivered(order.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center transition-all ${
                isFinalStatus
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <CheckCircle2 size={18} />
              <span className="hidden sm:inline">Delivered</span>
            </button>

            <button
              disabled={isFinalStatus}
              onClick={() => onCancelOrder(order.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center transition-all ${
                isFinalStatus
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <XCircle size={18} />
              <span className="hidden sm:inline">Cancel</span>
            </button>

            <button
              onClick={() => onDelete(order.id)}
              className="px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center bg-red-600 hover:bg-red-700 text-white transition-all shadow-md hover:shadow-lg"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

OrderDetailPanel.displayName = "OrderDetailPanel";

export default function OrdersPage() {
  const { settings, loading, error } = useSettings();
  const { isAdmin, isChecking } = useAdminAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
   const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push("/");
    }
  }, [isChecking, isAdmin, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/get-orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data.orders);
      } catch (err: any) {
        showAlertMessage(err.message || "Failed to fetch orders", "error");
        setShowAlert(true);
      }
    };
    fetchOrders();
  }, []);

  // Memoized WhatsApp handler
  const sendOrderByWhatsApp = useCallback(async (order: Order) => {
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
    await updateStatus(order.id, "Sent");
  }, []);

  // Memoized status update handler
  const updateStatus = useCallback(async (orderId: number, status: string) => {
    await fetch("/api/admin/update-order-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []);

  // Memoized delete handler
  const confirmDeleteOrder = useCallback(async () => {
    if (!orderToDelete) return;

    try {
      const res = await fetch("/api/admin/delete-order", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: orderToDelete }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order");
      }
      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete));
      showAlertMessage("Order deleted successfully", "success");
      setShowAlert(true);
    } catch (err: any) {
      showAlertMessage(err.message || "Failed to delete order", "error");
      setShowAlert(true);
    } finally {
      setShowConfirmModal(false);
      setOrderToDelete(null);
    }
  }, [orderToDelete]);

  // Memoized columns
  const columns = useMemo<AdminTableColumn<Order>[]>(
    () => [
      {
        key: "id",
        header: "ID",
        width: "w-16",
        sortValue: (row) => row.id,
        cell: (row) => (
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            #{row.id}
          </span>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        sortValue: (row) => `${row.customerName} ${row.customerLastName}`,
        cell: (row) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {row.customerName} {row.customerLastName}
          </div>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        sortValue: (row) => row.phone,
        cell: (row) => (
          <a
            href={`tel:${row.phone}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {row.phone}
          </a>
        ),
      },
      {
        key: "payment",
        header: "Payment",
        sortValue: (row) => row.paymentMethod,
        cell: (row) => (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {row.paymentMethod}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortValue: (row) => row.status,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "amount",
        header: "Amount",
        sortValue: (row) => row.total,
        cell: (row) => (
          <span className="font-bold text-gray-900 dark:text-white">
            ${row.total.toFixed(2)}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        sortValue: (row) => row.createdAt,
        cell: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
    ],
    []
  );

  if (loading)
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminShell>
    );

  if (error)
    return (
      <AdminShell>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-red-700 dark:text-red-300 max-w-md">
            {error}
          </div>
        </div>
      </AdminShell>
    );

  return (
    <AdminShell>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {showAlert && (
        <Alert value={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
      )}
      {showConfirmModal && (
        <ConfirmationModal
          text="Are you sure you want to delete this order?"
          onCancel={() => {
            setShowConfirmModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDeleteOrder}
          isDangerous={true}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage and track customer orders
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
              {orders.length} orders
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <AdminTable
            columns={columns}
            data={orders}
            getRowId={(row) => row.id}
            emptyMessage="No orders yet."
            mobileColumns={["id", "customer", "status"]}
            renderDetailPanel={(row) => (
              <OrderDetailPanel
                order={row}
                onSendWhatsApp={sendOrderByWhatsApp}
                onCheckLocation={(url) => window.open(url, "_blank")}
                onMarkDelivered={(id) => updateStatus(id, "Delivered")}
                onCancelOrder={(id) => updateStatus(id, "Cancelled")}
                onDelete={(id) => {
                  setOrderToDelete(id);
                  setShowConfirmModal(true);
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
    </AdminShell>
  );
}