"use client";
import React, { useMemo, useState } from "react";
import { Package, X, ImagePlus, AlertCircle } from "lucide-react";

interface AddProductModalProps {
  onClose: () => void;
  onSave: (product: any) => void;
  categories: string[];
  initialProduct?: any;
}

const inputCls =
  "w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-900 transition";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

const AddProductModal: React.FC<AddProductModalProps> = ({
  onClose,
  onSave,
  categories,
  initialProduct,
}) => {
  const [category, setCategory] = useState(initialProduct?.categories || "");
  const [name, setName] = useState(initialProduct?.name || "");
  const [price, setPrice] = useState(initialProduct?.price?.replace("$", "") || "");
  const [image, setImage] = useState<File | null>(null);
  const [details, setDetails] = useState(initialProduct?.details || "");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialProduct);
  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : initialProduct?.image),
    [image, initialProduct?.image]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !name || !price || !details || (!isEdit && !image)) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");

    const product = {
      ...(isEdit && { id: initialProduct?.id }),
      category,
      name,
      price: `$${price}`,
      image,
      details,
    };

    onSave(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-lg font-bold text-gray-900">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-2.5">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
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
          </div>

          <div>
            <label className={labelCls}>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diet Jelly"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1.50"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>
              Product Image{isEdit && <span className="font-normal text-gray-400"> (leave empty to keep current)</span>}
            </label>
            <div className="flex items-center gap-3">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                />
              )}
              <label className="flex-1 flex items-center gap-2 justify-center border-2 border-dashed border-gray-200 hover:border-primary rounded-xl py-3 px-4 text-sm text-gray-500 hover:text-primary cursor-pointer transition">
                <ImagePlus size={18} />
                {image ? image.name : "Choose an image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="hidden"
                  required={!isEdit}
                />
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Short product description…"
              className={`${inputCls} resize-none`}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-hovprimary text-white font-semibold text-sm rounded-lg transition-all hover:shadow-lg cursor-pointer"
            >
              {isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
