"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/firestore/products";
import { Product } from "@/lib/types";
import { DataTable } from "@/components/admin/DataTable";
import Link from "next/link";
import { Plus } from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
    }

    async function handleDelete(product: Product) {
        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
            await deleteDoc(doc(db, "products", product.id));
            loadProducts(); // Refresh
        }
    }

    if (loading) return <div>Loading products...</div>;

    const columns = [
        {
            header: "Image",
            accessorKey: "imageUrl" as keyof Product,
            cell: (item: Product) => (
                <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
            )
        },
        { header: "Name", accessorKey: "name" as keyof Product },
        { header: "Category", accessorKey: "category" as keyof Product },
        {
            header: "Price",
            accessorKey: "price" as keyof Product,
            cell: (item: Product) => `$${item.price.toFixed(2)}`
        },
        { header: "Stock", accessorKey: "stock" as keyof Product },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <Link href="/admin/products/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                </Link>
            </div>

            <DataTable
                data={products}
                columns={columns}
                onDelete={handleDelete}
                editLink={(item) => `/admin/products/${item.id}`}
            />
        </div>
    );
}
