"use client";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/config";

export default function CheckoutPage() {
    const { items, loading: cartLoading } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [shipping, setShipping] = useState({ name: '', address: '', phone: '' });

    const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert('Please login');
        setLoading(true);

        try {
            const functions = getFunctions(app);
            const createOrder = httpsCallable(functions, 'createOrder');
            // This function will be created in backend
            const result = await createOrder({
                items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                shipping,
                paymentMethod: 'MPESA' // For now default
            });
            alert('Order created! Check your phone for STK Push.');
            // Redirect or show success
        } catch (error) {
            console.error(error);
            alert('Failed to create order');
        }
        setLoading(false);
    };

    if (cartLoading) return <div>Loading...</div>;
    if (items.length === 0) return <div className="p-8">Cart is empty</div>;

    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 bg-white">
            <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
            <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
                    <form onSubmit={handleCheckout} className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input required type="text" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input required type="text" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                            <input required type="text" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} placeholder="2547..." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>

                        <div className="sm:col-span-2 mt-6">
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {loading ? 'Processing...' : `Pay $${subtotal.toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-10 lg:mt-0">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <ul className="divide-y divide-gray-200">
                            {items.map(item => (
                                <li key={item.id} className="flex py-6">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img src={item.product?.imageUrl} className="h-full w-full object-cover object-center" />
                                    </div>
                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>{item.product?.name}</h3>
                                            <p className="ml-4">${(item.product?.price || 0) * item.quantity}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Total</p>
                                <p>${subtotal.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
