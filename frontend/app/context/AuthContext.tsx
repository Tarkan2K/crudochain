'use client';

import { createContext, useContext, ReactNode } from 'react';
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
    userAddress: string;
    userId: string | null;
    email: string | null;
    role: string;
    switchUser: (address: string) => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    login: () => { },
    logout: () => { },
    userAddress: "Anon",
    userId: null,
    email: null,
    role: "user",
    switchUser: () => { },
});

function AuthContent({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();

    const isLoggedIn = status === 'authenticated';
    // @ts-ignore
    const userAddress = session?.user?.walletAddress || "Anon";
    // @ts-ignore
    const role = session?.user?.role || "user";
    // @ts-ignore
    const userId = session?.user?.id || null;
    const email = session?.user?.email || null;

    const login = () => {
        signIn();
    };

    const logout = () => {
        signOut();
    };

    const switchUser = (address: string) => {
        console.warn("switchUser is deprecated. Please use real auth.");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, userAddress, userId, email, role, switchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <SessionProvider>
            <AuthContent>
                {children}
            </AuthContent>
        </SessionProvider>
    );
};

export const useAuth = () => useContext(AuthContext);
