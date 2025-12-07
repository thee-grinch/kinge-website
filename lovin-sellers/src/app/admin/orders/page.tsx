"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DataTable } from "@/components/admin/DataTable";

interface Order {
    id: string;
    userId: string;
    total: number;
    status: string;
    createdAt: any;
    items: any[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(data);
        setLoading(false);
    }

    async function updateStatus(orderId: string, newStatus: string) {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        loadOrders();
    }

    if (loading) return <div>Loading orders...</div>;

    const columns = [
        { header: "Order ID", accessorKey: "id" as keyof Order },
        {
            header: "Date",
            accessorKey: "createdAt" as keyof Order,
            cell: (item: Order) => item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A'
        },
        {
            header: "Total",
            accessorKey: "total" as keyof Order,
            cell: (item: Order) => `$${item.total.toFixed(2)}`
        },
        {
            header: "Status",
            accessorKey: "status" as keyof Order,
            cell: (item: Order) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        item.status === 'Pending Payment' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: "Actions",
            accessorKey: "status" as keyof Order,
            cell: (item: Order) => (
                <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                >
                    <option value="Pending Payment">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            )
        }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
            <DataTable
                data={orders}
                columns={columns}
            />
        </div>
    );
}
