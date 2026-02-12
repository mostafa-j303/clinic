"use client";
import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import Separator from "./Sparator";
import { Pencil, Plus, Trash2, Filter, Search, X } from "lucide-react";
import { useAdminAuth } from "../_context/AdminAuthContext";
import AddProductModal from "./AddProductModal";
import Alert from "./Alert";
import AddEditCategoryModal from "./AddEditCategorieModal";
import ConfirmationModal from "./ConfirmationModal";
import Loading from "./Loding";

// Define types
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
  categories: string;
}

interface Category {
  id?: number;
  name: string;
}

const ProductSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [fetched, setFetched] = useState(false);
  const { isAdmin } = useAdminAuth();
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
   const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // ✅ Add/Edit Category
  const handleSaveCategory = async (category: Category) => {
    const isEdit = !!category.id;

    const res = await fetch(
      `/api/${isEdit ? "edit-category" : "add-category"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      }
    );

    if (!res.ok) {
      console.error("Failed to save category");
      showAlertMessage("Failed to save category", "error");
      setShowAlert(true);
      return;
    }

    showAlertMessage(isEdit ? "Category updated" : "Category added", "success");
    setShowAlert(true);
    setEditingCategory(null);
    setShowCategoryModal(false);
    
    // Refetch categories from backend to keep state in sync with server
    setFetched(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // ✅ Add/Edit Product
  const handleSaveProduct = async (product: any) => {
    const formData = new FormData();
    const isEdit = !!product.id;

    if (product.image instanceof File) {
      formData.append("file", product.image);
    }

    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("details", product.details);
    formData.append("categories", product.category);

    if (isEdit) {
      formData.append("id", product.id);
    }

    try {
      const res = await fetch(
        `/api/${isEdit ? "edit-product" : "add-product"}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const existingProduct = products.find((p) => p.id === product.id);

      const finalizeSave = (imageBase64: string) => {
        const updatedProduct = {
          id: data.id || Date.now(),
          name: product.name,
          price: product.price,
          details: product.details,
          categories: product.category,
          image: imageBase64,
        };

        setProducts((prev) =>
          isEdit
            ? prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
            : [...prev, updatedProduct]
        );

        showAlertMessage(
          isEdit ? "Product updated successfully" : "Product added successfully",
          "success"
        );
        setShowAlert(true);
      };

      if (product.image instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => finalizeSave(reader.result as string);
        reader.readAsDataURL(product.image);
      } else if (
        typeof product.image === "string" &&
        product.image.startsWith("data:image")
      ) {
        finalizeSave(product.image);
      } else if (existingProduct) {
        finalizeSave(existingProduct.image);
      } else {
        finalizeSave("");
      }

      setFetched(false);
    } catch (err) {
      console.error("Failed to save product", err);
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(
        `/api/delete-category?id=${categoryToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        showAlertMessage(data.message || "Failed to delete category", "error");
        setShowAlert(true);
        return;
      }
      showAlertMessage("Category deleted successfully", "success");
      setShowAlert(true);
      
      // Refetch categories from backend to keep state in sync with server
      setFetched(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
      showAlertMessage("An error occurred while deleting the category", "error");
      setShowAlert(true);
    } finally {
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  };

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const response = await fetch("/api/fetch-products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        setProducts(data.products);
        setCategories([{ id: -1, name: "All" }, ...data.categories]);
        setFetched(true);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [fetched]);

  const filteredProducts =
    selectedCategory === "All"
      ? products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products.filter(
          (product) =>
            product.categories.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase() &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  if (loading) return <Loading variant="grid" message="Loading products..." />;

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <section id="Products" className="w-full py-10 sm:py-10 lg:py-10 bg-gradient-to-b from-white via-white to-hovprimary">
      {showAlert && (
        <Alert value={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Filter className="w-5 h-5 text-primary" />
            <label
              htmlFor="category-select"
              className="text-sm font-semibold text-gray-700"
            >
              Category:
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black font-medium"
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex-1 sm:flex-none relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Product
            </button>
          )}
        </div>

        {/* Products List */}
        <ProductList
          productList={filteredProducts}
          onDeleteProduct={handleDeleteProduct}
          onEditProduct={handleEditProduct}
        />
      </div>

      {/* Admin Categories Section */}
      {isAdmin && (
        <div className="mt-7 pt-7 border-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/60 py-8 rounded-lg shadow-2xl">
            {/* Categories Header */}
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-900">Manage Categories</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Add Category
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .filter((cat) => cat.name !== "All")
                .map((category, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border-2 border-gray-200 hover:border-primary p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-semibold capitalize text-lg">
                        {category.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory({
                              id: category.id,
                              name: category.name,
                            });
                            setShowCategoryModal(true);
                          }}
                          className="flex items-center justify-center size-9 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-all"
                          title="Edit category"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(category);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex items-center justify-center size-9 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <AddProductModal
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          categories={categories.map((c) => c.name).filter((n) => n !== "All")}
          initialProduct={editingProduct}
        />
      )}

      {showCategoryModal && (
        <AddEditCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={handleSaveCategory}
          initialCategory={editingCategory ?? undefined}
        />
      )}

      {showDeleteConfirm && categoryToDelete && (
        <ConfirmationModal
          text={`Are you sure you want to delete the category "${categoryToDelete.name}"?`}
          onConfirm={confirmDeleteCategory}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
          }}
          isDangerous={true}
        />
      )}
    </section>
  );
};

export default ProductSection;