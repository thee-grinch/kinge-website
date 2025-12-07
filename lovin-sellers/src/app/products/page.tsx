"use client";

import { useEffect, useState, Suspense } from 'react';
import { getProducts } from '@/lib/firestore/products';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ProductList() {
    const searchParams = useSearchParams();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const data = await getProducts();
                setAllProducts(data);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Filter logic
    let filteredProducts = allProducts;
    if (categoryParam) {
        filteredProducts = filteredProducts.filter((p) => p.category.toLowerCase() === categoryParam.toLowerCase());
    }
    if (searchParam) {
        const lowerSearch = searchParam.toLowerCase();
        filteredProducts = filteredProducts.filter((p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.description.toLowerCase().includes(lowerSearch)
        );
    }

    const categories = Array.from(new Set(allProducts.map((p) => p.category)));

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200 pb-10 flex items-baseline justify-between">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Products</h1>
                </div>

                <div className="pt-12 pb-24 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
                    <aside>
                        <h2 className="sr-only">Filters</h2>
                        <div className="hidden lg:block">
                            <h3 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Categories</h3>
                            <ul role="list" className="text-sm font-medium text-gray-900 space-y-4 pb-6 border-b border-gray-200">
                                <li>
                                    <Link href="/products" className={!categoryParam ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}>
                                        All
                                    </Link>
                                </li>
                                {categories.map((cat) => (
                                    <li key={cat}>
                                        <Link href={`/products?category=${cat}`} className={categoryParam === cat ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}>
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <section aria-labelledby="product-heading" className="mt-6 lg:mt-0 lg:col-span-2 xl:col-span-3">
                        <h2 id="product-heading" className="sr-only">Products</h2>

                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500">No products found.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductList />
        </Suspense>
    );
}
