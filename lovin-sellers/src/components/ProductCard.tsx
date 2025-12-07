"use client";
import { Product } from '@/lib/types';
import Link from 'next/link';
import { AddToCartButton } from '@/components/AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-96 relative h-64">
                <Link href={`/products/${product.id}`}>
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-center object-cover"
                    />
                </Link>
            </div>
            <div className="flex-1 p-4 space-y-2 flex flex-col">
                <h3 className="text-sm font-medium text-gray-900">
                    <Link href={`/products/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className="flex-1 flex flex-col justify-end mt-4 z-10 relative">
                    <p className="text-base font-medium text-gray-900 mb-4">${product.price.toFixed(2)}</p>
                    <AddToCartButton productId={product.id} className="w-full bg-indigo-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" />
                </div>
            </div>
        </div>
    );
}
