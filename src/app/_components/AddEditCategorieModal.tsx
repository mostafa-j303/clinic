"use client";
import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface AddEditCategoryModalProps {
  onClose: () => void;
  onSave: (category: { id?: number; name: string }) => void;
  initialCategory?: { id?: number; name: string };
}

const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({
  onClose,
  onSave,
  initialCategory,
}) => {
  const [name, setName] = useState(initialCategory?.name || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!initialCategory;

  useEffect(() => {
    setName(initialCategory?.name || "");
    setError("");
  }, [initialCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (name.trim().length < 2) {
      setError("Category name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      onSave({ id: initialCategory?.id, name: name.trim() });
      onClose();
    } catch (err) {
      setError("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Input Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., Supplements, Vitamins, Sports"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition text-black ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:border-primary focus:ring-primary/20"
              }`}
              required
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`flex-1 px-4 py-2 font-semibold rounded-lg text-white transition flex items-center justify-center gap-2 ${
                isSubmitting || !name.trim()
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEdit ? "Update" : "Add"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCategoryModal;