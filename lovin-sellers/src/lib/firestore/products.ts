import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product } from "@/lib/types";
import { products as mockProducts } from "@/lib/mockData";

export async function getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
        return null;
    }
}

// Temporary function to seed database if empty
export async function seedProducts() {
    const currentProducts = await getProducts();
    if (currentProducts.length > 0) return; // Don't overwrite if data exists

    console.log("Seeding products...");
    for (const product of mockProducts) {
        await setDoc(doc(db, "products", product.id), product);
    }
    console.log("Seeding complete.");
}
