'use client';
import React, { useEffect, useState } from 'react';
import ProductList from './ProductList';
import LocationLoader from "../_components/Apploading"; 

// Define the type for a product
interface Product {
  id: number;
  name: string;
  price: string;
  image: string ;
  details: string;
  categories: string;
}

const ProductSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [fetched, setFetched] = useState(false); // ✅ flag to avoid double fetch


  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const response = await fetch('/api/fetch-products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
        setCategories(['All', ...data.categories]);
        setFetched(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [fetched]);

  // Filter products based on the selected category
  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) =>
          product.categories?.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  if (loading) {
    return <LocationLoader />;

  }

  if (error) {
    return <div className="text-center py-10 bg-secondary text-red-500">Error: {error}</div>;
  }

  return (
    <div id="Products" className="bg-gradient-to-b from-white via-white to-hovprimary">
      <div className="mb-2 pt-4 flex items-center text-center justify-center">
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
      </div>
      <ProductList productList={filteredProducts} />
    </div>
  );
};

export default ProductSection;
