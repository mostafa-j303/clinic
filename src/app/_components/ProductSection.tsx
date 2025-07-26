// _components/ProductSection.tsx
'use client';
import data from '../../../public/data.json';
import React, { useState } from 'react';
import ProductList from './ProductList';

// Define the type for a product
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  details: string;
  categories: string;
}

// Ensure data.productes is correctly typed
const initialProductList: Product[] = data.productes ;
const categories: string[] = data.categories; // Assuming data.categories is a string[] like ["All", "Clothing", "Electronics", ...]

const ProductSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');


  // Filter products based on the selected category
  const filteredProducts = selectedCategory === 'All'
    ? initialProductList
    : initialProductList.filter(product =>
        product.categories?.toLowerCase().includes(selectedCategory.toLowerCase())
      );

  return (
    <div  id="Products" className='bg-gradient-to-b from-white via-white to-hovprimary '>
      <div className="mb-2 pt-4 flex items-center text-center justify-center">
        <label htmlFor="category-select" className="text-lg font-bold text-gray-700 mr-2 italic">
          Filter by Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded px-2 py-2 text-sm shadow-sm sm:text-sm text-black "
        >
          <option value="All">All</option>
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
