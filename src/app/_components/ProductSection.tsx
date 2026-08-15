"use client";
import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import SectionHeading from "./SectionHeading";
import GradientMeshBackdrop from "./GradientMeshBackdrop";
import { Pencil, Plus, Trash2, Filter, Search, X, ChevronDown } from "lucide-react";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { useSettings } from "../_context/SettingsContext";
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
  const { settings } = useSettings();
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
    <section id="Products" className="relative w-full py-10 sm:py-10 lg:py-10 bg-gradient-to-b from-white via-white to-hovprimary dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
      {showAlert && (
        <Alert value={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />
      )}

      {settings && (
        <GradientMeshBackdrop
          color1="#ffffff"
          color2={settings.colors.secondary}
          className="opacity-70 dark:opacity-20"
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Shop"
          title="Our Products"
          subtitle="Supplements and nutrition products picked to support the plan built for you."
        />
        {/* Filter Bar — glass panel so it sits on top of the moving backdrop instead of a flat white box */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-primary flex-shrink-0" />
            <label
              htmlFor="category-select"
              className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-shrink-0"
            >
              Category
            </label>
            <div className="relative flex-1 sm:flex-none">
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full sm:w-44 pl-3 pr-9 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
              className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={18} />
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
        <div className="relative z-10 mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md shadow-sm p-5 sm:p-6">
              {/* Categories Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Manage Categories
                </h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus size={18} />
                  Add Category
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories
                  .filter((cat) => cat.name !== "All")
                  .map((category, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-900 dark:text-white font-semibold capitalize text-base truncate">
                          {category.name}
                        </span>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingCategory({
                                id: category.id,
                                name: category.name,
                              });
                              setShowCategoryModal(true);
                            }}
                            className="flex items-center justify-center size-9 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all"
                            title="Edit category"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setCategoryToDelete(category);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex items-center justify-center size-9 bg-red-100 dark:bg-red-900/30 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white rounded-lg transition-all"
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