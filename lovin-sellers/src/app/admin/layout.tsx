"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Users as UsersIcon, Package, CreditCard, Settings, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (role !== "admin") {
                router.push("/"); // Redirect non-admins to home
            }
        }
    }, [user, role, loading, router]);

    if (loading || role !== "admin") {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className={`bg-indigo-900 text-white w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? '' : '-ml-64'}`}>
                <div className="h-16 flex items-center px-6 bg-indigo-950">
                    <span className="text-xl font-bold tracking-wider">Lovin Admin</span>
                </div>

                <nav className="mt-6 flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-800 text-white'
                                        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <button
                        onClick={() => auth.signOut()}
                        className="flex items-center w-full px-4 py-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                    <div className="mt-4 flex items-center px-4">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white max-w-[140px] truncate">{user?.displayName || 'Admin'}</p>
                            <p className="text-xs text-indigo-300">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center">
                        <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            View Store
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
