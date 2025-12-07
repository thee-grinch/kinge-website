"use client";

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts, seedProducts } from '@/lib/firestore/products';
import { Product } from '@/lib/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Attempt to seed if empty (safe to run, checks for existence)
        await seedProducts();
        const data = await getProducts();
        setProducts(data.slice(0, 4)); // Featured: Top 4
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-indigo-800">
        <div className="absolute inset-0">
          <img className="w-full h-full object-cover opacity-30" src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1600&q=80" alt="Shopping" />
          <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Lovin Sellers</h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            The best products, the best prices, delivered with love.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Featured Products</h2>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <p className="col-span-full text-center text-gray-500">No products found. (Seeding might take a moment...)</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
