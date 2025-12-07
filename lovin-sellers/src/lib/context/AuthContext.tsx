"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, IdTokenResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config"; // Ensure db is imported if we fall back to Firestore
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                // Try to get role from Custom Claims first
                const tokenResult: IdTokenResult = await user.getIdTokenResult();
                let userRole = tokenResult.claims.role as string;

                // Fallback: Check Firestore if Custom Claim is not set (useful for first-time setup or dev)
                if (!userRole) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        userRole = userDoc.data().role;
                    }
                }
                setRole(userRole || "customer");
            } else {
                setRole(null);
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role }}>
            {children}
        </AuthContext.Provider>
    );
}
