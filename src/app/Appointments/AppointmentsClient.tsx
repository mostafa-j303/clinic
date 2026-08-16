"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";
import ConfirmationModal from "../_components/ConfirmationModal";
import AdminShell from "../_components/AdminShell";
import AdminTable, { AdminTableColumn } from "../_components/AdminTable";
import {
  Trash2,
  Calendar,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type AppointmentRequest = {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  appointment_name: string;
  selected_date: string;
  payment_method: string;
  price_used: string;
  status: string;
  created_at: string;
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

// Memoized Detail Panel Component
const AppointmentDetailPanel = React.memo(
  ({
    appointment,
    onSendWhatsApp,
    onCancel,
    onDelete,
    isUpdating,
  }: {
    appointment: AppointmentRequest;
    onSendWhatsApp: (appointment: AppointmentRequest) => void;
    onCancel: (id: number) => void;
    onDelete: (id: number) => void;
    isUpdating: boolean;
  }) => {
    const isFinalStatus =
      appointment.status === "Delivered" || appointment.status === "Cancelled";

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Calendar size={20} /> Appointment Details
            </h3>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Appointment Type
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {appointment.appointment_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Scheduled Date
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {new Date(appointment.selected_date).toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Payment Method
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {appointment.payment_method}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Price
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {appointment.price_used}
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Phone size={20} /> Client Information
            </h3>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Full Name
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {appointment.first_name} {appointment.last_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Phone Number
                </p>
                <a
                  href={`tel:${appointment.phone_number}`}
                  className="text-sm font-semibold text-primary hover:underline mt-1 inline-block"
                >
                  {appointment.phone_number}
                </a>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Request Created
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {new Date(appointment.created_at).toLocaleString(undefined, {
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              disabled={appointment.status !== "Pending"}
              onClick={() => onSendWhatsApp(appointment)}
              className={`px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center transition-all ${
                appointment.status !== "Pending"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FaWhatsapp size={18} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              disabled={isFinalStatus || isUpdating}
              onClick={() => onCancel(appointment.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center transition-all ${
                isFinalStatus || isUpdating
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <XCircle size={18} />
              <span className="hidden sm:inline">
                {isUpdating ? "Cancelling..." : "Cancel"}
              </span>
            </button>

            <button
              onClick={() => onDelete(appointment.id)}
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

AppointmentDetailPanel.displayName = "AppointmentDetailPanel";

export default function AppointmentRequestsAdmin() {
  const { isAdmin, isChecking } = useAdminAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
   const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlert(message);
    setAlertType(type);
  };
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔐 Admin guard
  useEffect(() => {
    if (!isChecking && !isAdmin) router.push("/");
  }, [isChecking, isAdmin, router]);

  // 📥 Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/fetch-appointment-requests");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load requests");
        setRequests(data.requests);
      } catch (err: any) {
        showAlertMessage(err.message || "Failed to load appointment requests", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // 🟢 Update status (memoized)
  const updateStatus = useCallback(async (id: number, status: string) => {
    if (updatingId === id) return;

    try {
      setUpdatingId(id);
      const res = await fetch("/api/admin/update-appointment-request-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Status update failed");
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      showAlertMessage(err.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  }, [updatingId]);

  // 🗑 Delete request (memoized)
  const deleteRequest = useCallback(async () => {
    if (!confirmId) return;

    try {
      const res = await fetch("/api/admin/delete-appointment-request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setRequests((prev) => prev.filter((r) => r.id !== confirmId));
      showAlertMessage("Request deleted successfully", "success");
    } catch (err: any) {
      showAlertMessage(err.message || "Failed to delete request", "error");
    } finally {
      setConfirmId(null);
    }
  }, [confirmId]);

  // 📲 WhatsApp (memoized)
  const sendWhatsApp = useCallback((r: AppointmentRequest) => {
    const msg = `Hello ${r.first_name} 👋\n\nYour appointment request has been processed ✅\nPlease review the details below and reply *CONFIRM* to place your appointment.\n\n🗓 Appointment: ${r.appointment_name}\n📅 Date: ${new Date(r.selected_date).toLocaleDateString()}\n💳 Payment: ${r.payment_method}\n💰 Price: ${r.price_used}\n\nThank you 🙏`;

    window.open(
      `https://wa.me/${r.phone_number}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    updateStatus(r.id, "Sent");
  }, [updateStatus]);

  // 📊 Columns (memoized)
  const columns = useMemo<AdminTableColumn<AppointmentRequest>[]>(
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
        key: "client",
        header: "Client",
        sortValue: (row) => `${row.first_name} ${row.last_name}`,
        cell: (row) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {row.first_name} {row.last_name}
          </div>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        sortValue: (row) => row.phone_number,
        cell: (row) => (
          <a
            href={`tel:${row.phone_number}`}
            className="text-primary hover:underline text-sm font-medium"
          >
            {row.phone_number}
          </a>
        ),
      },
      {
        key: "appointment",
        header: "Appointment",
        sortValue: (row) => row.appointment_name,
        cell: (row) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {row.appointment_name}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        sortValue: (row) => row.selected_date,
        cell: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.selected_date).toLocaleDateString(undefined, {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "payment",
        header: "Payment",
        sortValue: (row) => row.payment_method,
        cell: (row) => (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {row.payment_method}
          </span>
        ),
      },
      {
        key: "price",
        header: "Price",
        sortValue: (row) => row.price_used,
        cell: (row) => (
          <span className="font-bold text-gray-900 dark:text-white">
            {row.price_used}
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
        key: "created",
        header: "Created",
        sortValue: (row) => row.created_at,
        cell: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.created_at).toLocaleString(undefined, {
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

  if (isLoading)
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminShell>
    );

  return (
    <AdminShell>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {alert && <Alert value={alert} type={alertType} onClose={() => setAlert(null)} />}

      {confirmId && (
        <ConfirmationModal
          text="Are you sure you want to delete this appointment request?"
          onCancel={() => setConfirmId(null)}
          onConfirm={deleteRequest}
          isDangerous={true}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Appointment Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage and respond to client appointment requests
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
              {requests.length} requests
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <AdminTable
            columns={columns}
            data={requests}
            getRowId={(row) => row.id}
            emptyMessage="No appointment requests yet."
            mobileColumns={["id", "client", "status"]}
            renderDetailPanel={(row) => (
              <AppointmentDetailPanel
                appointment={row}
                onSendWhatsApp={sendWhatsApp}
                onCancel={(id) => updateStatus(id, "Cancelled")}
                onDelete={(id) => setConfirmId(id)}
                isUpdating={updatingId === row.id}
              />
            )}
          />
        </div>
      </div>
    </div>
    </AdminShell>
  );
}