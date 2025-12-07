"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DataTable } from "@/components/admin/DataTable";

interface UserData {
    id: string;
    uid: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
        setUsers(data);
        setLoading(false);
    }

    if (loading) return <div>Loading users...</div>;

    const columns = [
        { header: "Name", accessorKey: "name" as keyof UserData },
        { header: "Email", accessorKey: "email" as keyof UserData },
        {
            header: "Role",
            accessorKey: "role" as keyof UserData,
            cell: (item: UserData) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {item.role || 'customer'}
                </span>
            )
        },
        {
            header: "Joined",
            accessorKey: "createdAt" as keyof UserData,
            cell: (item: UserData) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <button
                    onClick={() => alert("To promote a user, please contact the developer or use the Firebase Console for now.")}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                    Manage Roles
                </button>
            </div>
            <DataTable
                data={users}
                columns={columns}
            />
        </div>
    );
}
