import React, { useState, useEffect } from "react";

type AppointmentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
  initialData?: any;
};

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [details, setDetails] = useState("");

 useEffect(() => {
  if (initialData) {
    setName(initialData.name || "");
    setPrice(initialData.price || "");
    setOfferPrice(initialData.offerPrice || "");
    setDuration(initialData.duration || "");
    setDetails(initialData.details?.join(";\n") || "");
  } else {
    // Clear fields when no initialData
    setName("");
    setPrice("");
    setOfferPrice("");
    setDuration("");
    setDetails("");
  }
}, [initialData]);


  const handleSubmit = () => {
    const formattedDetails = details
      .split(/[\n;]/)
      .map((d) => d.trim())
      .filter((d) => d !== "");

    const appointment = {
      id: initialData?.id,
      name,
      price,
      offerPrice,
      duration,
      details: formattedDetails,
    };

    onSave(appointment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          {initialData ? "Edit" : "Add"} Appointment
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <input
            className="w-full p-2 border rounded text-gray-600"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded text-gray-600"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded text-gray-600"
            placeholder="Optional Offer Price"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded text-gray-600"
            placeholder="Duration (Optional)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <textarea
            className="w-full p-2 border rounded text-gray-600"
            placeholder="Details (separate by ; or new line)"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit" // ✅ make it submit to trigger form validation
              className="px-4 py-2 bg-primary text-white rounded"
            >
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormModal;
