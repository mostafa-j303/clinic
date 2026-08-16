import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

type AppointmentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
  initialData?: any;
};

// Validity is entered by the admin as a friendly amount + unit (e.g. "3
// months") but stored as a plain integer of days (`validity_days`) — this
// keeps every downstream consumer (booking credit expiry math in
// bookings.ts) unchanged, it's purely a nicer input/display on this form.
const DAYS_PER_UNIT: Record<string, number> = { days: 1, weeks: 7, months: 30, years: 365 };

function daysToAmountUnit(days: number): { amount: string; unit: string } {
  if (days > 0 && days % 365 === 0) return { amount: String(days / 365), unit: "years" };
  if (days > 0 && days % 30 === 0) return { amount: String(days / 30), unit: "months" };
  if (days > 0 && days % 7 === 0) return { amount: String(days / 7), unit: "weeks" };
  return { amount: String(days), unit: "days" };
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [offerprice, setOfferprice] = useState("");
  const [duration, setDuration] = useState("");
  const [details, setDetails] = useState("");
  const [visitCount, setVisitCount] = useState("");
  const [validityAmount, setValidityAmount] = useState("");
  const [validityUnit, setValidityUnit] = useState("months");

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name || "");
      setPrice(initialData.price || "");
      setOfferprice(initialData.offerprice || "");
      setDuration(initialData.duration || "");
      setDetails(initialData.details?.join(";\n") || "");
      setVisitCount(initialData.visit_count != null ? String(initialData.visit_count) : "");
      if (initialData.validity_days != null) {
        const { amount, unit } = daysToAmountUnit(initialData.validity_days);
        setValidityAmount(amount);
        setValidityUnit(unit);
      } else {
        setValidityAmount("");
        setValidityUnit("months");
      }
    } else if (!initialData && isOpen) {
      // Clear fields when no initialData and modal is open
      setName("");
      setPrice("");
      setOfferprice("");
      setDuration("");
      setDetails("");
      setVisitCount("");
      setValidityAmount("");
      setValidityUnit("months");
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    const formattedDetails = details
      .split(/[\n;]/)
      .map((d) => d.trim())
      .filter((d) => d !== "");

    // Format prices - add $ if not already present
    const formatPrice = (priceStr: string) => {
      if (!priceStr || !priceStr.trim()) return ""; // Return empty string if empty
      const cleaned = priceStr.trim();
      return cleaned.startsWith("$") ? cleaned : `${cleaned}`;
    };

    const appointment = {
      id: initialData?.id,
      name,
      price: formatPrice(price),
      offerprice: formatPrice(offerprice), // This will be "" if empty, or "$XX" if filled
      duration,
      details: formattedDetails,
      visitCount: visitCount.trim() ? Number(visitCount) : null,
      validityDays: validityAmount.trim()
        ? Math.round(Number(validityAmount) * DAYS_PER_UNIT[validityUnit])
        : null,
    };
    
    console.log("Saving appointment:", appointment); // Debug log to see what's being sent
    onSave(appointment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-accent px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initialData ? "Edit" : "Add"} Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
              placeholder="e.g., Nutrition Consultation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Price Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price *
              </label>
              <input
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                placeholder="e.g., 50 or $50"
                value={price}
                onChange={(e) => {
                  let val = e.target.value;
                  // Auto-format: if user types a number, add $ prefix
                  if (val && !val.startsWith("$")) {
                    // Only add $ if it's a number or number with decimal
                    if (/^\d+\.?\d*$/.test(val)) {
                      val = `$${val}`;
                    }
                  }
                  setPrice(val);
                }}
                required
              />
            </div>

            {/* Offer Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Offer Price
              </label>
              <input
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                placeholder="Optional"
                value={offerprice}
                onChange={(e) => {
                  let val = e.target.value;
                  // Auto-format: if user types a number, add $ prefix
                  if (val && !val.startsWith("$")) {
                    // Only add $ if it's a number or number with decimal
                    if (/^\d+\.?\d*$/.test(val)) {
                      val = `$${val}`;
                    }
                  }
                  setOfferprice(val);
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (Optional)
            </label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
              placeholder="e.g., 30 minutes, 1 hour"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Visit credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Visits
              </label>
              <input
                type="number"
                min={1}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                placeholder="e.g., 16"
                value={visitCount}
                onChange={(e) => setVisitCount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valid For
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                  placeholder="e.g., 3"
                  value={validityAmount}
                  onChange={(e) => setValidityAmount(e.target.value)}
                />
                <select
                  className="px-2 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black bg-white"
                  value={validityUnit}
                  onChange={(e) => setValidityUnit(e.target.value)}
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Leave both blank for a single-visit package (the default) — the client picks their
            date directly, no scheduling checkbox. Set both to track a client's remaining
            visits — e.g. 16 visits, valid for 1 year.
          </p>

          {/* Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Details *
            </label>
            <textarea
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black resize-none"
              placeholder="Separate items with semicolon (;) or new line"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: Diet plan; Recommendations; Follow-up. No need to list the number of
              visits here — it's shown automatically from "Number of Visits" above.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              <Save size={18} />
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormModal;