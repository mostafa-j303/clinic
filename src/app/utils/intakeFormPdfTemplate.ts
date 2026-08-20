// Shared by the admin panel's client-side "Download PDF" button
// (IntakeFormsClient.tsx) and the server-side PDF generated right after a
// client submits their intake form (submit-intake.ts, sent to Telegram) —
// pure string building, no DOM access, so it works in both places.
export type IntakeFormPdfRecord = {
  client_id: number;
  email: string;
  full_name: string;
  age: string | number | null;
  phone_number: string | null;
  gender: string | null;
  occupation: string | null;
  profile_completed: boolean | null;
  client_created_at: string;
  reason: string | null;
  goals: string[] | string | null;
  specific_goal: string | null;
  readiness_scale: string | number | null;
  expected_challenges: string | null;
  expectations: string | null;
  medical_conditions: string[] | string | null;
  past_surgeries: string | null;
  food_allergies: string | null;
  medications: string | null;
  has_lab_tests: boolean | null;
  lab_results: string | null;
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
  pregnant_breastfeeding: boolean | null;
  menstrual_regular: boolean | null;
  women_conditions: string[] | string | null;
  additional_info: string | null;
};

const WOMEN_ONLY_LABELS = new Set([
  "Menstrual Regular",
  "Women Conditions",
  "Pregnant Or Breastfeeding",
]);

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

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

export function generateIntakeFormHtml(record: IntakeFormPdfRecord, brandPrimary: string): string {
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
        ["Registered At", new Date(record.client_created_at).toLocaleString()],
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

  return `
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
        <div class="subtitle">Prepared for ${escapeHtml(record.full_name)} (${escapeHtml(record.email)})</div>
        ${sectionsHtml}
      </body>
    </html>
  `;
}
