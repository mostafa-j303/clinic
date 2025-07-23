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
}

// Ensure data.productes is correctly typed
const initialProductList: Product[] = data.productes ;

const ProductSection: React.FC = () => {
  const [productList, setProductList] = useState<Product[]>(initialProductList);

  return (
    <div  id="Products" className='bg-gradient-to-b from-white via-white to-hovprimary '>
      <ProductList productList={productList} />
    </div>
  );
};

export default ProductSection;
