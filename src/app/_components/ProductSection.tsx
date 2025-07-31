"use client";
import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import LocationLoader from "../_components/Apploading";
import Separator from "./Sparator";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "../_context/AdminAuthContext";
import AddProductModal from "./AddProductModal";
import Alert from "./Alert";

// Define the type for a product
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
  categories: string;
}

const ProductSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [fetched, setFetched] = useState(false); // ✅ flag to avoid double fetch
  const { isAdmin, login, logout } = useAdminAuth();
  const [showModal, setShowModal] = useState(false);// show add product modal

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

const handleEditProduct = (product: Product) => {
  setEditingProduct(product);
  setShowModal(true);
};

//for add and edit product 
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
    const res = await fetch(`/api/${isEdit ? "edit-product" : "add-product"}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // Find existing product image base64 if no new image and product.image is empty or not base64
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

      setAlertMessage(isEdit ? "Product updated successfully" : "Product added successfully");
      setShowAlert(true);
    };

    if (product.image instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        finalizeSave(reader.result as string);
      };
      reader.readAsDataURL(product.image);
    } else if (typeof product.image === "string" && product.image.startsWith("data:image")) {
      // Reuse existing base64 string
      finalizeSave(product.image);
    } else if (existingProduct) {
      // Use existing product image base64 from current state
      finalizeSave(existingProduct.image);
    } else {
      // fallback empty or placeholder image
      finalizeSave("");
    }

    setFetched(false);
  } catch (err) {
    console.error("Failed to save product", err);
  }
};


  //delete product moved by props to the product list to delete product from the productlist file 
  const handleDeleteProduct = (id: number) => {
  setProducts((prev) => prev.filter((p) => p.id !== id));
};

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const response = await fetch("/api/fetch-products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.products);
        setCategories(["All", ...data.categories]);
        setFetched(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [fetched]);

  // Filter products based on the selected category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) =>
          product.categories?.trim()
            ?.toLowerCase()
            .includes(selectedCategory.trim().toLowerCase())
        );

  if (loading) {
    return <LocationLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-secondary text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      id="Products"
      className="bg-gradient-to-b from-white via-white to-hovprimary "
    >
      {showAlert && (
        <Alert value={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      <div className="mb-2 pt-4 flex items-center text-center justify-center gap-2">
        <label
          htmlFor="category-select"
          className="text-lg font-bold text-gray-700 mr-2 italic"
        >
          Filter by Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 text-sm shadow-sm sm:text-sm text-black"
        >
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {isAdmin && (
          <button className="text-white rounded-lg bg-green-500 p-2" onClick={() => setShowModal(true)}>
            {" "}
            <Plus />
          </button>
        )}
      </div>
      <ProductList productList={filteredProducts} onDeleteProduct={handleDeleteProduct} onEditProduct={handleEditProduct} />
      {showModal && (
        <AddProductModal
          onClose={() => {setShowModal(false), setEditingProduct(null);}}
          onSave={handleSaveProduct}
          categories={categories}
          initialProduct={editingProduct}
        />
      )}
      {isAdmin && (
        <div className="px-4 py-4 bg-white ">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold mb-4 text-gray-700 capitalize">
              Categories :{" "}
            </h2>
            <button className="text-white rounded-lg bg-green-500 p-2 mb-2">
              {" "}
              <Plus />
            </button>
          </div>

          <ul className="space-y-2 mb-8">
            {categories
              .filter((cat) => cat !== "All")
              .map((category, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-blue-50 p-3 rounded shadow-sm border border-gray-200"
                >
                  <span className="text-gray-800 font-medium capitalize">
                    {category}
                  </span>
                  <div className="space-x-2 flex gap-1">
                    <button className="text-white rounded-lg bg-blue-500 p-2">
                      {" "}
                      <Pencil />
                    </button>
                    <button className="text-white rounded-lg bg-red-500 p-2">
                      <Trash2 />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductSection;
