"use client";
import { useAuth } from "@/lib/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [orders, setOrders] = useState<DocumentData[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            try {
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snap = await getDocs(q);
                setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error("Error fetching orders", e);
                // If index missing, it will log error. Fallback to no orderBy for dev?
            }
        };
        fetchOrders();
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div className="p-8">Please login to view profile.</div>;

    return (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-500">Email: {user.email}</p>

            <h2 className="mt-10 text-2xl font-bold text-gray-900">Order History</h2>
            <div className="mt-6 space-y-6">
                {orders.length === 0 ? (
                    <p className="text-gray-500">No orders found.</p>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200 p-6">
                            <div className="flex justify-between">
                                <h3 className="text-lg font-medium">Order #{order.id}</h3>
                                <span className="text-sm text-gray-400">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Date N/A'}</span>
                            </div>
                            <p>Status: <span className={`font-bold ${order.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.status}</span></p>
                            <p>Total: ${order.total?.toFixed(2)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
