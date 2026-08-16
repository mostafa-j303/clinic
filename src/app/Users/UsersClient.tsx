"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "../_components/AdminShell";
import AdminTable, { AdminTableColumn } from "../_components/AdminTable";
import ConfirmationModal from "../_components/ConfirmationModal";
import Alert from "../_components/Alert";
import {
  Mail,
  Phone,
  Ticket,
  CalendarCheck,
  ShieldOff,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

type ClientRow = {
  id: number;
  email: string;
  full_name: string;
  phone_number: string | null;
  gender: string | null;
  profile_completed: boolean;
  is_suspended: boolean;
  created_at: string;
  total_visits: number;
  remaining_visits: number;
  completed_visits: number;
};

function formatPhone(phone: string | null) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  return digits ? `+${digits}` : "—";
}

function StatusPill({ suspended }: { suspended: boolean }) {
  return suspended ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
      <ShieldOff size={12} /> Suspended
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
      <ShieldCheck size={12} /> Active
    </span>
  );
}

function ClientDetailPanel({
  client,
  onSuspend,
  onDelete,
  isUpdating,
}: {
  client: ClientRow;
  onSuspend: (id: number, suspend: boolean) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}) {
  return (
    <div className="p-4 sm:p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <Mail size={14} className="text-gray-400" /> {client.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <Phone size={14} className="text-gray-400" /> {formatPhone(client.phone_number)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <UserRound size={14} className="text-gray-400" /> {client.gender || "—"}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <CalendarCheck size={14} className="text-gray-400" />
          Intake form: {client.profile_completed ? "Completed" : "Not completed"}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex items-center gap-2 text-sm">
        <Ticket size={14} className="text-primary flex-shrink-0" />
        <span className="text-gray-700 dark:text-gray-200">
          <strong>{client.remaining_visits}</strong> of <strong>{client.total_visits}</strong>{" "}
          visits remaining &middot; <strong>{client.completed_visits}</strong> completed
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => onSuspend(client.id, !client.is_suspended)}
          disabled={isUpdating}
          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-60 ${
            client.is_suspended
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100"
              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
          }`}
        >
          {client.is_suspended ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
          {client.is_suspended ? "Unsuspend" : "Suspend"}
        </button>
        <button
          onClick={() => onDelete(client.id)}
          disabled={isUpdating}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-60"
        >
          <Trash2 size={14} /> Delete Account
        </button>
      </div>
    </div>
  );
}

export default function UsersClient() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (msg: string, type: "success" | "error") => {
    setAlert(msg);
    setAlertType(type);
  };

  const fetchClients = useCallback(() => {
    setIsLoading(true);
    fetch("/api/admin/get-clients")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => showAlertMessage("Failed to load users", "error"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSuspend = async (clientId: number, suspend: boolean) => {
    setUpdatingId(clientId);
    try {
      const res = await fetch("/api/admin/suspend-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, suspended: suspend }),
      });
      if (!res.ok) throw new Error();
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, is_suspended: suspend } : c))
      );
      showAlertMessage(suspend ? "User suspended" : "User unsuspended", "success");
    } catch {
      showAlertMessage("Failed to update user", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const clientId = confirmDeleteId;
    setConfirmDeleteId(null);
    setUpdatingId(clientId);
    try {
      const res = await fetch("/api/admin/delete-client", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) throw new Error();
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      showAlertMessage("User deleted", "success");
    } catch {
      showAlertMessage("Failed to delete user", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: AdminTableColumn<ClientRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        cell: (row) => <span className="text-gray-400 text-xs">#{row.id}</span>,
        sortValue: (row) => row.id,
      },
      {
        key: "name",
        header: "Name",
        cell: (row) => (
          <span className="font-semibold text-gray-900 dark:text-white">{row.full_name}</span>
        ),
        sortValue: (row) => row.full_name?.toLowerCase() || "",
      },
      {
        key: "email",
        header: "Email",
        cell: (row) => <span className="text-gray-600 dark:text-gray-300">{row.email}</span>,
        sortValue: (row) => row.email?.toLowerCase() || "",
      },
      {
        key: "phone",
        header: "Phone",
        cell: (row) => (
          <span className="text-gray-600 dark:text-gray-300">{formatPhone(row.phone_number)}</span>
        ),
      },
      {
        key: "visits",
        header: "Visits",
        cell: (row) => (
          <span className="text-gray-600 dark:text-gray-300">
            {row.remaining_visits}/{row.total_visits}
          </span>
        ),
        sortValue: (row) => row.remaining_visits,
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusPill suspended={row.is_suspended} />,
        sortValue: (row) => (row.is_suspended ? 1 : 0),
      },
      {
        key: "created",
        header: "Joined",
        cell: (row) => (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {new Date(row.created_at).toLocaleDateString()}
          </span>
        ),
        sortValue: (row) => new Date(row.created_at).getTime(),
      },
    ],
    []
  );

  const deepLinkId = searchParams?.get("id");

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {alert && <Alert value={alert} type={alertType} onClose={() => setAlert(null)} />}

        {confirmDeleteId && (
          <ConfirmationModal
            text="Are you sure you want to permanently delete this user? Their orders, appointments, intake form, and visit credits will all be erased. This cannot be undone."
            onCancel={() => setConfirmDeleteId(null)}
            onConfirm={handleDelete}
            isDangerous={true}
          />
        )}

        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              View, suspend, or delete client accounts and see their visit history
            </p>
            <div className="mt-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold text-sm">
                {clients.length} users
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <AdminTable
              columns={columns}
              data={clients}
              getRowId={(row) => row.id}
              emptyMessage="No users yet."
              mobileColumns={["id", "name", "status"]}
              initialExpandedId={deepLinkId ? Number(deepLinkId) : null}
              renderDetailPanel={(row) => (
                <ClientDetailPanel
                  client={row}
                  onSuspend={handleSuspend}
                  onDelete={(id) => setConfirmDeleteId(id)}
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
