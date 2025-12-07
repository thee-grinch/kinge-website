"use client";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useCart } from "@/lib/context/CartContext";
import { auth } from "@/lib/firebase/config";
import { ShoppingCart, User as UserIcon, LogIn, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
    const { user } = useAuth();
    const { items } = useCart();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-indigo-600">Lovin Sellers</span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8 flex-1 justify-center max-w-2xl">
                        <div className="relative w-full max-w-lg">
                            <form onSubmit={handleSearch}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Search products..."
                                />
                            </form>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/cart" className="relative p-2 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">View cart</span>
                            <ShoppingCart className="h-6 w-6" />
                            {/* Badge */}
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">{cartCount}</span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link href="/profile" className="p-2 text-gray-400 hover:text-gray-500" title="Profile">
                                    <UserIcon className="h-6 w-6" />
                                </Link>
                                <button
                                    onClick={() => auth.signOut()}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                                    Login
                                </Link>
                                <Link href="/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
