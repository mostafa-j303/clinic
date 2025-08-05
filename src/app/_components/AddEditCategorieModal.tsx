"use client";
import React, { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
}
interface AddEditCategoryModalProps {
  onClose: () => void;
  onSave: (category: { id?: number; name: string }) => void;
  initialCategory?: { id?: number; name: string };
}

const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({
  onClose,
  onSave,
  initialCategory
}) => {
  const [name, setName] = useState(initialCategory?.name || "");

  const isEdit = !!initialCategory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }
    onSave({ id: initialCategory?.id, name: name.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-2">
      <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 text-center text-gray-700">
          {isEdit ? "Edit Category" : "Add Category"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name"
            className="w-full border p-2 rounded text-gray-600"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCategoryModal;
