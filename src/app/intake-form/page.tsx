"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Alert from "../_components/Alert";

const SECTIONS = [
  "Personal Information",
  "Main Goal",
  "Medical History",
  "Medications & Supplements",
  "Body Information",
  "Dietary Habits",
  "Eating Behavior",
  "Physical Activity",
  "Lifestyle",
  "For Women Only",
  "Lab Tests",
  "Readiness & Expectations",
  "Final Notes",
];

const initialForm = {
  fullName: "",
  age: "",
  phoneNumber: "",
  gender: "",
  occupation: "",
  reason: "",
  goals: [] as string[],
  specificGoal: "",
  medicalConditions: [] as string[],
  pastSurgeries: "",
  foodAllergies: "",
  medications: "",
  currentWeight: "",
  heightCm: "",
  usualWeight: "",
  typicalDayEating: "",
  mealsPerDay: "",
  waterIntake: "",
  eatOutFrequency: "",
  eatingBehaviors: [] as string[],
  eatingChallenges: "",
  exercises: "",
  exerciseDetails: "",
  sleepHours: "",
  stressLevel: "",
  menstrualRegular: "",
  womenConditions: [] as string[],
  hasLabTests: "",
  labResults: "",
  readinessScale: 5,
  expectedChallenges: "",
  expectations: "",
  additionalInfo: "",
};

type FormData = typeof initialForm;

const validateForm = (form: FormData) => {
  if (!form.fullName) return "Full name is required";
  if (!form.age) return "Age is required";
  if (!form.gender) return "Gender is required";
  if (!form.reason) return "Reason is required";
  if (!form.currentWeight) return "Current weight is required";
  if (!form.heightCm) return "Height is required";
  if (!form.exercises) return "Exercise selection is required";
  if (!form.usualWeight) return "Usual weight is required";

  return null;
};
const validateStep = (step: number, form: FormData) => {
  const err: Record<string, string> = {};

  switch (step) {
    case 0:
      if (!form.fullName) err.fullName = "Full name is required";
      if (!form.age) err.age = "Age is required";
      if (!form.gender) err.gender = "Gender is required";
      break;

    case 1:
      if (!form.reason) err.reason = "Reason is required";
      break;

    case 4:
      if (!form.currentWeight) err.currentWeight = "Weight is required";
      if (!form.heightCm) err.heightCm = "Height is required";
      if (!form.usualWeight) err.usualWeight = "Usual weight is required";
      break;

    case 7:
      if (!form.exercises) err.exercises = "Exercise selection is required";
      break;
  }

  return err;
};

function toggleArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />

      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
          checked
            ? "bg-primary border-primary"
            : "border-gray-300 group-hover:border-primary"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
            <path
              d="M10 3L5 8.5 2 5.5"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <span className="text-gray-700 text-sm">{label}</span>
    </label>
  );
}
function Radio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />

      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          checked
            ? "border-primary"
            : "border-gray-300 group-hover:border-primary"
        }`}
      >
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>

      <span className="text-gray-700 text-sm">{label}</span>
    </label>
  );
}

function SectionCard({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
        <span className="text-2xl">{emoji}</span> {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-900 transition";
const textareaCls = `${inputCls} resize-none`;

export default function IntakeFormPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/client-portal");
    if (status === "authenticated" && session.profileCompleted)
      router.push("/client-dashboard");
  }, [status, session, router]);

  const set = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    const error = validateForm(form);
    if (error) {
      setAlert({ msg: error, type: "error" });
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/client/submit-intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setAlert({ msg: data.message, type: "error" });
    } else {
      await update({ profileCompleted: true });
      setAlert({ msg: "Form submitted! Redirecting…", type: "success" });
      setTimeout(() => router.push("/client-dashboard"), 1500);
    }
    setSubmitting(false);
  };

  if (status === "loading") return null;

  const totalSteps = 13;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {alert && (
        <Alert
          value={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            First Consultation Form
          </h1>
          <p className="text-gray-600 mt-2">
            Please fill out this form before your first consultation.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Your answers will help us create a personalized plan tailored to
            your needs.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Section {step + 1} of {totalSteps}
            </span>
            <span>{SECTIONS[step]}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 0: Personal Information */}
        {step === 0 && (
          <SectionCard title="Personal Information" emoji="👤">
            <Field label="Full Name" required>
              <input
                className={`${inputCls} ${
                  errors.fullName ? "border-red-500" : ""
                }`}
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />

              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </Field>
            <Field label="Age" required>
              <input
                className={`${inputCls} ${errors.age ? "border-red-500" : ""}`}
                type="number"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
              {errors.age && (
                <p className="text-red-500 text-sm">{errors.age}</p>
              )}
            </Field>
            <Field label="Phone Number">
              <input
                className={inputCls}
                value={form.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
                placeholder="+961..."
              />
            </Field>
            <Field label="Gender" required>
              <div
                className={`${
                  errors.gender ? "border border-red-500 p-2 rounded-lg" : ""
                }`}
              >
                {["Female", "Male", "Prefer not to say"].map((g) => (
                  <Radio
                    key={g}
                    label={g}
                    checked={form.gender === g}
                    onChange={() => set("gender", g)}
                  />
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender}</p>
              )}
            </Field>
            <Field label="Occupation">
              <input
                className={inputCls}
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                placeholder="Your occupation"
              />
            </Field>
          </SectionCard>
        )}

        {/* Step 1: Main Goal */}
        {step === 1 && (
          <SectionCard title="Main Goal" emoji="🎯">
            <Field label="What brings you here today?" required>
              <textarea
                className={`${textareaCls} ${
                  errors.reason ? "border-red-500" : ""
                }`}
                rows={4}
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
                placeholder="Describe your main reason for seeking nutritional guidance…"
              />
              {errors.reason && (
                <p className="text-red-500 text-sm">{errors.reason}</p>
              )}
            </Field>
            <Field label="Select your goals (check all that apply)">
              <div className="space-y-2">
                {[
                  "Weight loss",
                  "Weight gain",
                  "Improve eating habits",
                  "Medical condition",
                  "Sports performance",
                  "Other",
                ].map((g) => (
                  <Checkbox
                    key={g}
                    label={g}
                    checked={form.goals.includes(g)}
                    onChange={() => set("goals", toggleArray(form.goals, g))}
                  />
                ))}
              </div>
            </Field>
            <Field label="Do you have a specific goal or target weight?">
              <input
                className={inputCls}
                value={form.specificGoal}
                onChange={(e) => set("specificGoal", e.target.value)}
                placeholder="e.g. Lose 10kg in 3 months"
              />
            </Field>
          </SectionCard>
        )}

        {/* Step 2: Medical History */}
        {step === 2 && (
          <SectionCard title="Medical History" emoji="🏥">
            <Field label="Do you have any of the following? (check all that apply)">
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Diabetes",
                  "Thyroid disorder",
                  "PCOS",
                  "Hypertension",
                  "High cholesterol",
                  "Digestive issues",
                  "None",
                  "Other",
                ].map((c) => (
                  <Checkbox
                    key={c}
                    label={c}
                    checked={form.medicalConditions.includes(c)}
                    onChange={() =>
                      set(
                        "medicalConditions",
                        toggleArray(form.medicalConditions, c)
                      )
                    }
                  />
                ))}
              </div>
            </Field>
            <Field label="Any past surgeries or medical conditions?">
              <textarea
                className={textareaCls}
                rows={3}
                value={form.pastSurgeries}
                onChange={(e) => set("pastSurgeries", e.target.value)}
                placeholder="Please describe…"
              />
            </Field>
            <Field label="Food allergies or intolerances">
              <input
                className={inputCls}
                value={form.foodAllergies}
                onChange={(e) => set("foodAllergies", e.target.value)}
                placeholder="e.g. Lactose, gluten, nuts…"
              />
            </Field>
          </SectionCard>
        )}

        {/* Step 3: Medications */}
        {step === 3 && (
          <SectionCard title="Medications & Supplements" emoji="💊">
            <Field label="List any medications or supplements you are currently taking">
              <textarea
                className={textareaCls}
                rows={5}
                value={form.medications}
                onChange={(e) => set("medications", e.target.value)}
                placeholder="Include name, dosage and frequency if known…"
              />
            </Field>
          </SectionCard>
        )}

        {/* Step 4: Body Information */}
        {step === 4 && (
          <SectionCard title="Body Information" emoji="⚖️">
            <Field label="Current weight (kg)" required>
              <input
                className={`${inputCls} ${
                  errors.currentWeight ? "border-red-500" : ""
                }`}
                type="number"
                value={form.currentWeight}
                onChange={(e) => set("currentWeight", e.target.value)}
                placeholder="e.g. 70"
              />
              {errors.currentWeight && (
                <p className="text-red-500 text-sm">{errors.currentWeight}</p>
              )}
            </Field>
            <Field label="Height (cm)" required>
              <input
                className={`${inputCls} ${
                  errors.heightCm ? "border-red-500" : ""
                }`}
                type="number"
                value={form.heightCm}
                onChange={(e) => set("heightCm", e.target.value)}
                placeholder="e.g. 165"
              />
              {errors.heightCm && (
                <p className="text-red-500 text-sm">{errors.heightCm}</p>
              )}
            </Field>
            <Field label="Usual weight (before any recent changes)" required>
              <input
                className={`${inputCls} ${
                  errors.usualWeight ? "border-red-500" : ""
                }`}
                type="number"
                value={form.usualWeight}
                onChange={(e) => set("usualWeight", e.target.value)}
                placeholder="e.g. 68"
              />
              {errors.usualWeight && (
                <p className="text-red-500 text-sm">{errors.usualWeight}</p>
              )}
            </Field>
          </SectionCard>
        )}

        {/* Step 5: Dietary Habits */}
        {step === 5 && (
          <SectionCard title="Dietary Habits" emoji="🥗">
            <Field label="Describe a typical day of eating (meals + snacks)">
              <textarea
                className={textareaCls}
                rows={5}
                value={form.typicalDayEating}
                onChange={(e) => set("typicalDayEating", e.target.value)}
                placeholder="Breakfast: …, Lunch: …, Dinner: …"
              />
            </Field>
            <Field label="Number of meals per day">
              <div className="space-y-2">
                {["1–2", "3", "4+"].map((m) => (
                  <Radio
                    key={m}
                    label={m}
                    checked={form.mealsPerDay === m}
                    onChange={() => set("mealsPerDay", m)}
                  />
                ))}
              </div>
            </Field>
            <Field label="How much water do you drink daily?">
              <input
                className={inputCls}
                value={form.waterIntake}
                onChange={(e) => set("waterIntake", e.target.value)}
                placeholder="e.g. 2 liters"
              />
            </Field>
            <Field label="Do you eat out?">
              <div className="space-y-2">
                {["Rarely", "1–2 times/week", "3+ times/week"].map((o) => (
                  <Radio
                    key={o}
                    label={o}
                    checked={form.eatOutFrequency === o}
                    onChange={() => set("eatOutFrequency", o)}
                  />
                ))}
              </div>
            </Field>
          </SectionCard>
        )}

        {/* Step 6: Eating Behavior */}
        {step === 6 && (
          <SectionCard title="Eating Behavior" emoji="🧠">
            <Field label="Which of these apply to you?">
              <div className="space-y-2">
                {[
                  "I eat when stressed",
                  "I have cravings (sweets/salty)",
                  "I skip meals",
                  "I eat late at night",
                  "None",
                ].map((b) => (
                  <Checkbox
                    key={b}
                    label={b}
                    checked={form.eatingBehaviors.includes(b)}
                    onChange={() =>
                      set(
                        "eatingBehaviors",
                        toggleArray(form.eatingBehaviors, b)
                      )
                    }
                  />
                ))}
              </div>
            </Field>
            <Field label="Any challenges with eating habits?">
              <textarea
                className={textareaCls}
                rows={3}
                value={form.eatingChallenges}
                onChange={(e) => set("eatingChallenges", e.target.value)}
                placeholder="Describe any challenges…"
              />
            </Field>
          </SectionCard>
        )}

        {/* Step 7: Physical Activity */}
        {step === 7 && (
          <SectionCard title="Physical Activity" emoji="🏃">
            <Field label="Do you exercise?" required>
              <div
                className={`${
                  errors.exercises ? "border border-red-500 p-2 rounded-lg" : ""
                }`}
              >
                {["Yes", "No"].map((o) => (
                  <Radio
                    key={o}
                    label={o}
                    checked={form.exercises === o}
                    onChange={() => set("exercises", o)}
                  />
                ))}
              </div>
              {errors.exercises && (
                <p className="text-red-500 text-sm">{errors.exercises}</p>
              )}
            </Field>
            {form.exercises === "Yes" && (
              <Field label="What type and how often?">
                <input
                  className={inputCls}
                  value={form.exerciseDetails}
                  onChange={(e) => set("exerciseDetails", e.target.value)}
                  placeholder="e.g. Running 3x/week, gym 2x/week"
                />
              </Field>
            )}
          </SectionCard>
        )}

        {/* Step 8: Lifestyle */}
        {step === 8 && (
          <SectionCard title="Lifestyle" emoji="🌙">
            <Field label="Sleep hours per night">
              <div className="space-y-2">
                {["Less than 5", "5–7", "7–9"].map((s) => (
                  <Radio
                    key={s}
                    label={s}
                    checked={form.sleepHours === s}
                    onChange={() => set("sleepHours", s)}
                  />
                ))}
              </div>
            </Field>
            <Field label="Stress level">
              <div className="space-y-2">
                {["Low", "Moderate", "High"].map((s) => (
                  <Radio
                    key={s}
                    label={s}
                    checked={form.stressLevel === s}
                    onChange={() => set("stressLevel", s)}
                  />
                ))}
              </div>
            </Field>
          </SectionCard>
        )}

        {/* Step 9: For Women Only */}
        {step === 9 && (
          <SectionCard title="For Women Only" emoji="🌸">
            <p className="text-sm text-gray-500 -mt-2 mb-4">
              Skip this section if it doesn't apply to you.
            </p>
            <Field label="Is your menstrual cycle regular?">
              <div className="space-y-2">
                {["Yes", "No"].map((o) => (
                  <Radio
                    key={o}
                    label={o}
                    checked={form.menstrualRegular === o}
                    onChange={() => set("menstrualRegular", o)}
                  />
                ))}
              </div>
            </Field>
            <Field label="Check all that apply:">
              <div className="space-y-2">
                {["Pregnant", "Breastfeeding", "PCOS", "None"].map((c) => (
                  <Checkbox
                    key={c}
                    label={c}
                    checked={form.womenConditions.includes(c)}
                    onChange={() =>
                      set(
                        "womenConditions",
                        toggleArray(form.womenConditions, c)
                      )
                    }
                  />
                ))}
              </div>
            </Field>
          </SectionCard>
        )}

        {/* Step 10: Lab Tests */}
        {step === 10 && (
          <SectionCard title="Lab Tests" emoji="🔬">
            <Field label="Do you have recent blood tests?">
              <div className="space-y-2">
                {["Yes", "No"].map((o) => (
                  <Radio
                    key={o}
                    label={o}
                    checked={form.hasLabTests === o}
                    onChange={() => set("hasLabTests", o)}
                  />
                ))}
              </div>
            </Field>
            {form.hasLabTests === "Yes" && (
              <Field label="Please list results or describe what was tested:">
                <textarea
                  className={textareaCls}
                  rows={4}
                  value={form.labResults}
                  onChange={(e) => set("labResults", e.target.value)}
                  placeholder="e.g. Vitamin D: 15 ng/mL, TSH: 3.2…"
                />
              </Field>
            )}
          </SectionCard>
        )}

        {/* Step 11: Readiness */}
        {step === 11 && (
          <SectionCard title="Readiness & Expectations" emoji="💪">
            <Field
              label={`How ready are you to make lifestyle changes? (${form.readinessScale}/10)`}
            >
              <input
                type="range"
                min={1}
                max={10}
                value={form.readinessScale}
                onChange={(e) => set("readinessScale", Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 – Not ready</span>
                <span>10 – Fully committed</span>
              </div>
            </Field>
            <Field label="What challenges do you expect?">
              <textarea
                className={textareaCls}
                rows={3}
                value={form.expectedChallenges}
                onChange={(e) => set("expectedChallenges", e.target.value)}
                placeholder="e.g. Eating out, busy schedule…"
              />
            </Field>
            <Field label="What are your expectations from this program?">
              <textarea
                className={textareaCls}
                rows={3}
                value={form.expectations}
                onChange={(e) => set("expectations", e.target.value)}
                placeholder="What do you hope to achieve?"
              />
            </Field>
          </SectionCard>
        )}

        {/* Step 12: Final */}
        {step === 12 && (
          <SectionCard title="Anything Else?" emoji="💬">
            <Field label="Is there anything else you would like to share?">
              <textarea
                className={textareaCls}
                rows={5}
                value={form.additionalInfo}
                onChange={(e) => set("additionalInfo", e.target.value)}
                placeholder="Any additional information that may help us serve you better…"
              />
            </Field>
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-700 italic">
                "Based on everything we discussed, I'll create a personalized
                plan that fits your lifestyle — not just a diet."
              </p>
            </div>
          </SectionCard>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          )}

          {step < 12 ? (
            <button
              onClick={() => {
                const stepErrors = validateStep(step, form);
                if (Object.keys(stepErrors).length > 0) {
                  setErrors(stepErrors);
                  setAlert({
                    msg: "Please fill required fields",
                    type: "error",
                  });
                  return;
                }
                setErrors({});
                setStep((s) => s + 1);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "✓ Submit Form"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
