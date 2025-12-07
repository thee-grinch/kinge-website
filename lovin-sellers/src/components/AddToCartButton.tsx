"use client";
import { useCart } from "@/lib/context/CartContext";
import { useState } from "react";

export function AddToCartButton({ productId, className }: { productId: string, className?: string }) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        await addToCart(productId);
        setLoading(false);
    };

    return (
        <button
            type="button"
            onClick={handleAdd}
            disabled={loading}
            className={className || "w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"}
        >
            {loading ? "Adding..." : "Add to cart"}
        </button>
    );
}
