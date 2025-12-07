"use client";

import { useCart } from "@/lib/context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
    const { items, removeFromCart, addToCart, loading } = useCart();

    const subtotal = items.reduce((acc, item) => {
        return acc + (item.product?.price || 0) * item.quantity;
    }, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-0">
                <h1 className="text-3xl font-extrabold text-center tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

                <form className="mt-12">
                    <section aria-labelledby="cart-heading">
                        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

                        <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                            {items.map((item) => (
                                <li key={item.id} className="flex py-6 sm:py-10">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.product?.imageUrl || ""}
                                            alt={item.product?.name || "Product image"}
                                            className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                                        />
                                    </div>

                                    <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                                        <div>
                                            <div className="flex justify-between">
                                                <h4 className="text-sm">
                                                    <Link href={`/products/${item.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                        {item.product?.name}
                                                    </Link>
                                                </h4>
                                                <p className="ml-4 text-sm font-medium text-gray-900">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">{item.product?.category}</p>
                                        </div>

                                        <div className="mt-4 flex-1 flex items-end justify-between">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(item.id, -1)}
                                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="text-gray-700 font-medium">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(item.id, 1)}
                                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="ml-4">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Order summary */}
                    <section aria-labelledby="summary-heading" className="mt-10 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                        <h2 id="summary-heading" className="sr-only">Order summary</h2>

                        <div className="flow-root">
                            <dl className="-my-4 text-sm divide-y divide-gray-200">
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
                                onClick={() => alert("Checkout not implemented yet!")}
                            >
                                Checkout
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
}
