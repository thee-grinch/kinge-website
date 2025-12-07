"use client";

import { useEffect, useState } from "react";
import { getProduct } from "@/lib/firestore/products";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";
import { notFound, useParams } from "next/navigation";
import { Check, ShoppingCart } from "lucide-react";

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const { addToCart } = useCart();

    useEffect(() => {
        if (id) {
            getProduct(id as string).then(data => {
                if (data) {
                    setProduct(data);
                    setSelectedImage(data.imageUrl); // Default to main image
                }
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!product) return notFound();

    // Combined images array (ensure unique and valid)
    const gallery = product.images && product.images.length > 0
        ? product.images
        : [product.imageUrl];

    return (
        <div className="bg-white">
            <div className="pt-6 pb-16 sm:pb-24">
                <div className="mt-8 max-w-2xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                        {/* Image Gallery */}
                        <div className="flex flex-col-reverse">
                            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
                                <div className="grid grid-cols-4 gap-6">
                                    {gallery.map((image, idx) => (
                                        <button
                                            key={idx}
                                            className="relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-50"
                                            onClick={() => setSelectedImage(image)}
                                        >
                                            <span className="sr-only">Change Image</span>
                                            <span className="absolute inset-0 rounded-md overflow-hidden">
                                                <img src={image} alt="" className="w-full h-full object-center object-cover" />
                                            </span>
                                            <span className={`absolute inset-0 rounded-md ring-2 ring-offset-2 ${selectedImage === image ? 'ring-indigo-500' : 'ring-transparent pointer-events-none'}`} aria-hidden="true" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full aspect-w-1 aspect-h-1">
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="w-full h-full object-center object-cover sm:rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                            <div className="mt-3">
                                <h2 className="sr-only">Product information</h2>
                                <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                            </div>

                            <div className="mt-6">
                                <h3 className="sr-only">Description</h3>
                                <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                            </div>

                            {/* Features List */}
                            {product.features && product.features.length > 0 && (
                                <div className="mt-8 border-t border-gray-200 pt-8">
                                    <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                                    <div className="mt-4 prose prose-sm text-gray-500">
                                        <ul role="list">
                                            {product.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start mb-2">
                                                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex">
                                <button
                                    type="button"
                                    onClick={() => addToCart(product.id, 1)}
                                    className="max-w-xs flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 sm:w-full"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to cart
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="group inline-flex text-base font-medium">
                                    <Check className="flex-shrink-0 mr-2 h-6 w-6 text-green-500" aria-hidden="true" />
                                    <span className="text-gray-500 hover:text-gray-700">In stock and ready to ship</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
