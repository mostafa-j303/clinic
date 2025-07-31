"use client";
import React, { useState } from "react";

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: any) => void;
  categories: string[];
  initialProduct?: any; // 👈 optional for editing
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onSave,
  categories,
  initialProduct
}) => {
  const [category, setCategory] = useState(initialProduct?.categories || "");
const [name, setName] = useState(initialProduct?.name || "");
const [price, setPrice] = useState(initialProduct?.price?.replace("$", "") || "");
const [image, setImage] = useState<File | null>(null);
const [details, setDetails] = useState(initialProduct?.details || "");

const isEdit = Boolean(initialProduct);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !name || !price || !details || (!isEdit && !image)) {
      alert("All fields are required");
      return;
    }

    const product = {
      ...(isEdit && { id: initialProduct?.id }),
      category,
      name,
      price: `$${price}`,
      image, // Handle upload elsewhere
      details,
    };

    onSave(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-2">
      <div className="bg-white p-2 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-lg text-gray-800 font-extrabold text-center uppercase mb-4 p-3"> {initialProduct ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded text-gray-600"
            required
          >
            <option value="">Select category</option>
            {categories
              .filter((cat) => cat !== "All")
              .map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
            className="w-full border p-2 rounded text-gray-600"
            required
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (number only)"
            className="w-full border p-2 rounded text-gray-600"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full bg-hovprimary p-2"
            required={!isEdit}
          />

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Details"
            className="w-full border p-2 rounded text-gray-600"
            rows={3}
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

export default AddProductModal;
