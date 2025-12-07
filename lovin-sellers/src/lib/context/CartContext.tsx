"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, collection, onSnapshot, setDoc, deleteDoc, DocumentData, QuerySnapshot } from "firebase/firestore";
import { Product } from "@/lib/types";
import { getProduct } from "@/lib/firestore/products";

export interface CartItem {
    id: string; // Product ID
    quantity: number;
    product?: Product;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType>({ items: [], addToCart: async () => { }, removeFromCart: async () => { }, loading: false });

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Sync with Firestore
    useEffect(() => {
        if (!user) {
            setItems([]);
            return;
        }
        setLoading(true);
        const cartRef = collection(db, "users", user.uid, "cart");
        const unsubscribe = onSnapshot(cartRef, async (snapshot: QuerySnapshot<DocumentData>) => {
            const promises = snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const product = await getProduct(doc.id);
                return {
                    id: doc.id,
                    quantity: data.quantity,
                    product: product || undefined
                } as CartItem;
            });

            const newItems = await Promise.all(promises);
            setItems(newItems);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addToCart = async (productId: string, quantity = 1) => {
        if (!user) {
            alert("Please login to add to cart");
            // Optionally redirect to login
            return;
        }
        const ref = doc(db, "users", user.uid, "cart", productId);

        // Optimistically update or check existing locally? 
        // We can just check current items state since it's synced.
        const existing = items.find(i => i.id === productId);
        const newQuantity = (existing?.quantity || 0) + quantity;

        if (newQuantity <= 0) {
            await deleteDoc(ref);
        } else {
            await setDoc(ref, { quantity: newQuantity });
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "cart", productId));
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, loading }}>
            {children}
        </CartContext.Provider>
    );
}
