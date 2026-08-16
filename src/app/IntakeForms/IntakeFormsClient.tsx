"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTable, { AdminTableColumn } from "../_components/AdminTable";
import { Calendar, FileText, Mail, Phone, Trash2, User } from "lucide-react";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { useSettings } from "../_context/SettingsContext";
import Alert from "../_components/Alert";
import ConfirmationModal from "../_components/ConfirmationModal";
import AdminShell from "../_components/AdminShell";

type IntakeFormRecord = {
  id: number;
  client_id: number;
  email: string;
  account_full_name: string | null;
  profile_completed: boolean;
  client_created_at: string;
  full_name: string;
  age: string | number | null;
  phone_number: string | null;
  gender: string | null;
  occupation: string | null;
  reason: string | null;
  goals: string[] | string | null;
  specific_goal: string | null;
  medical_conditions: string[] | string | null;
  past_surgeries: string | null;
  food_allergies: string | null;
  medications: string | null;
  current_weight: string | number | null;
  height_cm: string | number | null;
  usual_weight: string | number | null;
  typical_day_eating: string | null;
  meals_per_day: string | null;
  water_intake: string | null;
  eat_out_frequency: string | null;
  food_dislikes: string | null;
  budget_constraints: string | null;
  eating_behaviors: string[] | string | null;
  eating_challenges: string | null;
  exercises: string | null;
  exercise_details: string | null;
  sleep_hours: string | null;
  stress_level: string | null;
  smokes: boolean | null;
  drinks_alcohol: boolean | null;
  menstrual_regular: boolean | null;
  women_conditions: string[] | string | null;
  pregnant_breastfeeding: boolean | null;
  has_lab_tests: boolean | null;
  lab_results: string | null;
  readiness_scale: string | number | null;
  expected_challenges: string | null;
  expectations: string | null;
  additional_info: string | null;
};

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

const WOMEN_ONLY_LABELS = new Set([
  "Menstrual Regular",
  "Women Conditions",
  "Pregnant Or Breastfeeding",
]);

function filterApplicableFields(
  fields: [string, unknown][],
  record: { gender: string | null }
): [string, unknown][] {
  return fields.filter(([label, value]) => {
    if (WOMEN_ONLY_LABELS.has(label) && record.gender !== "Female") return false;
    return !isEmptyValue(value);
  });
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (typeof value === "boolean" || value === "true" || value === "false") {
    return value === true || value === "true" ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const ProfileBadge = React.memo(({ completed }: { completed: boolean }) => (
  <span
    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border inline-flex items-center gap-1.5 ${
      completed
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-yellow-50 border-yellow-200 text-yellow-700"
    }`}
  >
    {completed ? "Completed" : "Incomplete"}
  </span>
));

ProfileBadge.displayName = "ProfileBadge";

const IntakeDetailPanel = React.memo(
  ({
    record,
    onDelete,
    onDownloadPdf,
  }: {
    record: IntakeFormRecord;
    onDelete: (id: number) => void;
    onDownloadPdf: (record: IntakeFormRecord) => void;
  }) => {
    const sections = [
      {
        title: "Account",
        icon: <Mail size={18} />,
        fields: [
          ["Client ID", record.client_id],
          ["Full Name", record.full_name],
          ["Email", record.email],
          ["Phone", record.phone_number],
          ["Gender", record.gender],
          ["Age", record.age],
          ["Occupation", record.occupation],
          [
            "Registered At",
            new Date(record.client_created_at).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          ],
        ],
      },
      {
        title: "Goals",
        icon: <User size={18} />,
        fields: [
          ["Main Reason", record.reason],
          ["Goals", record.goals],
          ["Specific Goal", record.specific_goal],
          ["Readiness Scale", record.readiness_scale],
          ["Expected Challenges", record.expected_challenges],
          ["Expectations", record.expectations],
        ],
      },
      {
        title: "Medical",
        icon: <Phone size={18} />,
        fields: [
          ["Medical Conditions", record.medical_conditions],
          ["Past Surgeries", record.past_surgeries],
          ["Food Allergies", record.food_allergies],
          ["Medications", record.medications],
          ["Has Lab Tests", record.has_lab_tests],
          ["Lab Results", record.lab_results],
        ],
      },
      {
        title: "Body And Diet",
        icon: <Calendar size={18} />,
        fields: [
          ["Current Weight", record.current_weight],
          ["Height (cm)", record.height_cm],
          ["Usual Weight", record.usual_weight],
          ["Typical Day Eating", record.typical_day_eating],
          ["Meals Per Day", record.meals_per_day],
          ["Water Intake", record.water_intake],
          ["Eat Out Frequency", record.eat_out_frequency],
          ["Food Dislikes", record.food_dislikes],
          ["Budget Constraints", record.budget_constraints],
          ["Eating Behaviors", record.eating_behaviors],
          ["Eating Challenges", record.eating_challenges],
        ],
      },
      {
        title: "Lifestyle",
        icon: <Calendar size={18} />,
        fields: [
          ["Exercises", record.exercises],
          ["Exercise Details", record.exercise_details],
          ["Sleep Hours", record.sleep_hours],
          ["Stress Level", record.stress_level],
          ["Smokes", record.smokes],
          ["Drinks Alcohol", record.drinks_alcohol],
          ["Pregnant Or Breastfeeding", record.pregnant_breastfeeding],
          ["Menstrual Regular", record.menstrual_regular],
          ["Women Conditions", record.women_conditions],
          ["Additional Info", record.additional_info],
        ],
      },
    ];

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sections
            .map((section) => ({
              ...section,
              fields: filterApplicableFields(section.fields as [string, unknown][], record),
            }))
            .filter((section) => section.fields.length > 0)
            .map((section) => (
            <div
              key={section.title}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                {section.icon}
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.fields.map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-1 whitespace-pre-wrap break-words">
                      {formatValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            <button
              onClick={() => onDownloadPdf(record)}
              className="px-4 py-2.5 rounded-lg font-semibold flex gap-2 justify-center items-center bg-primary hover:bg-hovprimary text-white transition-all shadow-md hover:shadow-lg"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={() => onDelete(record.id)}
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

IntakeDetailPanel.displayName = "IntakeDetailPanel";

export default function IntakeFormsPage() {
  const { isAdmin, isChecking } = useAdminAuth();
  const { settings } = useSettings();
  const router = useRouter();

  const [records, setRecords] = useState<IntakeFormRecord[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const showAlertMessage = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setAlertMessage(message);
      setAlertType(type);
      setShowAlert(true);
    },
    []
  );

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push("/");
    }
  }, [isChecking, isAdmin, router]);

  useEffect(() => {
    const fetchIntakeForms = async () => {
      try {
        const res = await fetch("/api/admin/get-intake-forms");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch intake forms");
        }

        setRecords(data.intakeForms);
      } catch (err: any) {
        showAlertMessage(
          err.message || "Failed to fetch intake forms",
          "error"
        );
      }
    };

    fetchIntakeForms();
  }, [showAlertMessage]);

  const handleDownloadPdf = useCallback((record: IntakeFormRecord) => {
    const brandPrimary = settings?.colors?.primary || "#0891B2";
    const brandPrimarySoft = `${brandPrimary}22`;
    const sections = [
      {
        title: "Account Information",
        fields: [
          ["Client ID", record.client_id],
          ["Full Name", record.full_name],
          ["Email", record.email],
          ["Phone", record.phone_number],
          ["Age", record.age],
          ["Gender", record.gender],
          ["Occupation", record.occupation],
          ["Profile Completed", record.profile_completed],
          [
            "Registered At",
            new Date(record.client_created_at).toLocaleString(),
          ],
        ],
      },
      {
        title: "Goals And Reason",
        fields: [
          ["Main Reason", record.reason],
          ["Goals", record.goals],
          ["Specific Goal", record.specific_goal],
          ["Readiness Scale", record.readiness_scale],
          ["Expected Challenges", record.expected_challenges],
          ["Expectations", record.expectations],
        ],
      },
      {
        title: "Medical History",
        fields: [
          ["Medical Conditions", record.medical_conditions],
          ["Past Surgeries", record.past_surgeries],
          ["Food Allergies", record.food_allergies],
          ["Medications", record.medications],
          ["Has Lab Tests", record.has_lab_tests],
          ["Lab Results", record.lab_results],
        ],
      },
      {
        title: "Body And Nutrition",
        fields: [
          ["Current Weight", record.current_weight],
          ["Height (cm)", record.height_cm],
          ["Usual Weight", record.usual_weight],
          ["Typical Day Eating", record.typical_day_eating],
          ["Meals Per Day", record.meals_per_day],
          ["Water Intake", record.water_intake],
          ["Eat Out Frequency", record.eat_out_frequency],
          ["Food Dislikes", record.food_dislikes],
          ["Budget Constraints", record.budget_constraints],
          ["Eating Behaviors", record.eating_behaviors],
          ["Eating Challenges", record.eating_challenges],
        ],
      },
      {
        title: "Lifestyle And Extra Details",
        fields: [
          ["Exercises", record.exercises],
          ["Exercise Details", record.exercise_details],
          ["Sleep Hours", record.sleep_hours],
          ["Stress Level", record.stress_level],
          ["Smokes", record.smokes],
          ["Drinks Alcohol", record.drinks_alcohol],
          ["Pregnant Or Breastfeeding", record.pregnant_breastfeeding],
          ["Menstrual Regular", record.menstrual_regular],
          ["Women Conditions", record.women_conditions],
          ["Additional Info", record.additional_info],
        ],
      },
    ];

    const sectionsHtml = sections
      .map((section) => ({
        ...section,
        fields: filterApplicableFields(section.fields as [string, unknown][], record),
      }))
      .filter((section) => section.fields.length > 0)
      .map(
        (section) => `
          <section class="section">
            <h2>${escapeHtml(section.title)}</h2>
            <table>
              ${section.fields
                .map(
                  ([label, value]) => `
                    <tr>
                      <th>${escapeHtml(String(label))}</th>
                      <td>${escapeHtml(formatValue(value))}</td>
                    </tr>
                  `
                )
                .join("")}
            </table>
          </section>
        `
      )
      .join("");

    const popup = window.open("", "_blank", "width=900,height=1000");

    if (!popup) {
      showAlertMessage("Please allow popups to generate the PDF", "error");
      return;
    }

    popup.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Intake Form - ${escapeHtml(record.full_name)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #1f2937;
              margin: 32px;
              line-height: 1.5;
            }
            h1 {
              margin: 0 0 8px;
              color: #111827;
            }
            .subtitle {
              margin-bottom: 24px;
              color: #4b5563;
            }
            .section {
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            .section h2 {
              margin: 0 0 10px;
              font-size: 18px;
              color: ${brandPrimary};
              border-bottom: 2px solid ${brandPrimarySoft};
              padding-bottom: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              vertical-align: top;
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            th {
              width: 32%;
              background: #f9fafb;
              color: #374151;
            }
            td {
              white-space: pre-wrap;
              word-break: break-word;
            }
            @media print {
              body {
                margin: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Client Intake Form</h1>
          <div class="subtitle">Prepared for ${escapeHtml(
            record.full_name
          )} (${escapeHtml(record.email)})</div>
          ${sectionsHtml}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  }, [showAlertMessage, settings]);

  const confirmDeleteRecord = useCallback(async () => {
    if (!recordToDelete) return;

    try {
      const res = await fetch("/api/admin/delete-intake-form", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intakeFormId: recordToDelete }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete intake form");
      }

      setRecords((prev) => prev.filter((record) => record.id !== recordToDelete));
      showAlertMessage("Intake form deleted successfully", "success");
    } catch (err: any) {
      showAlertMessage(
        err.message || "Failed to delete intake form",
        "error"
      );
    } finally {
      setShowConfirmModal(false);
      setRecordToDelete(null);
    }
  }, [recordToDelete, showAlertMessage]);

  const columns = useMemo<AdminTableColumn<IntakeFormRecord>[]>(
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
        sortValue: (row) => row.full_name,
        cell: (row) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.full_name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{row.email}</div>
          </div>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        sortValue: (row) => row.phone_number ?? "",
        cell: (row) => {
          if (!row.phone_number) return <span className="text-gray-400 dark:text-gray-500">-</span>;
          return (
            <a
              href={`tel:${row.phone_number}`}
              className="text-primary hover:underline text-sm font-medium"
            >
              {row.phone_number}
            </a>
          );
        },
      },
      {
        key: "reason",
        header: "Reason",
        cell: (row) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">{formatValue(row.reason)}</span>
        ),
      },
      {
        key: "exercises",
        header: "Exercises",
        cell: (row) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {formatValue(row.exercises)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortValue: (row) => (row.profile_completed ? 1 : 0),
        cell: (row) => <ProfileBadge completed={row.profile_completed} />,
      },
      {
        key: "created",
        header: "Created",
        sortValue: (row) => row.client_created_at,
        cell: (row) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.client_created_at).toLocaleString(undefined, {
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

  if (isChecking) {
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
      {showAlert && (
        <Alert
          value={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          text="Are you sure you want to delete this intake form? The client will need to fill it again."
          onCancel={() => {
            setShowConfirmModal(false);
            setRecordToDelete(null);
          }}
          onConfirm={confirmDeleteRecord}
          isDangerous={true}
        />
      )}

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Intake Forms</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Review full client intake submissions, export them to PDF, or delete them.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
              {records.length} forms
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <AdminTable
            columns={columns}
            data={records}
            getRowId={(row) => row.id}
            emptyMessage="No intake forms submitted yet."
            mobileColumns={["id", "client", "status"]}
            renderDetailPanel={(row) => (
              <IntakeDetailPanel
                record={row}
                onDelete={(id) => {
                  setRecordToDelete(id);
                  setShowConfirmModal(true);
                }}
                onDownloadPdf={handleDownloadPdf}
              />
            )}
          />
        </div>
      </div>
    </div>
    </AdminShell>
  );
}
