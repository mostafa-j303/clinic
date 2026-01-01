"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_context/AdminAuthContext";
import Alert from "../_components/Alert";
import ConfirmationModal from "../_components/ConfirmationModal";
import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import { Trash2 } from "lucide-react";
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

export default function AppointmentRequestsAdmin() {
  const { isAdmin, isChecking } = useAdminAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const isFinalStatus = (status: string) =>
    status === "Delivered" || status === "Cancelled";

  // 🔐 Admin guard
  useEffect(() => {
    if (!isChecking && !isAdmin) router.push("/");
  }, [isChecking, isAdmin, router]);

  // 📥 Fetch requests
  useEffect(() => {
    fetch("/api/admin/fetch-appointment-requests")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests))
      .catch(() => setAlert("Failed to load appointment requests"));
  }, []);

  // 🟢 Update status
  const updateStatus = async (id: number, status: string) => {
    if (updatingId === id) return; // extra safety

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

      // ✅ Update UI ONLY after backend success
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // 🗑 Delete request
  const deleteRequest = async () => {
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
      setAlert("Request deleted successfully");
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  // 📲 WhatsApp
  const sendWhatsApp = (r: AppointmentRequest) => {
    const msg = `
Hello ${r.first_name} 👋

Your appointment request has been processed ✅
Please review the details below and reply *CONFIRM* to place your appointment.

🗓 Appointment: ${r.appointment_name}
📅 Date: ${new Date(r.selected_date).toLocaleDateString()}
💳 Payment: ${r.payment_method}
💰 Price: ${r.price_used}

Thank you 🙏
    `;

    window.open(
      `https://wa.me/${r.phone_number}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    updateStatus(r.id, "Sent");
  };

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "sent":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // 📊 Columns
  const columns = useMemo<MRT_ColumnDef<AppointmentRequest>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        header: "Client",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      },
      { accessorKey: "phone_number", header: "Phone" },
      { accessorKey: "appointment_name", header: "Appointment" },
      {
        accessorKey: "selected_date",
        header: "Date",
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      { accessorKey: "payment_method", header: "Payment" },
      { accessorKey: "price_used", header: "Price" },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();

          return (
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border inline-block ${getStatusClasses(
                status
              )}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    []
  );

  return (
    <div className="p-6 bg-white">
      {alert && <Alert value={alert} onClose={() => setAlert(null)} />}

      {confirmId && (
        <ConfirmationModal
          text="Delete this appointment request?"
          onCancel={() => setConfirmId(null)}
          onConfirm={deleteRequest}
        />
      )}

      <h1 className="text-2xl font-bold mb-4 mt-14 text-gray-600">
        Appointment Requests
      </h1>

      <MaterialReactTable
        columns={columns}
        data={requests}
        renderDetailPanel={({ row }) => (
          <div className="flex gap-4 p-4">
            <button
              disabled={row.original.status !== "Pending"}
              onClick={() => sendWhatsApp(row.original)}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300 flex items-center gap-2"
            >
              WhatsApp <FaWhatsapp />
            </button>

            <button
              disabled={
                isFinalStatus(row.original.status) ||
                updatingId === row.original.id
              }
              onClick={() => updateStatus(row.original.id, "Cancelled")}
              className={`px-4 py-2 rounded text-white
            ${
                isFinalStatus(row.original.status) || updatingId === row.original.id
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {updatingId === row.original.id ? "Cancelling..." : "Cancel"}
            </button>

            <button
              onClick={() => setConfirmId(row.original.id)}
              className="bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              Delete <Trash2 size={16} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
