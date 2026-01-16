import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                try {
                    const res = await fetch('http://localhost:3001/api/auth/login', {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });

                    const user = await res.json();

                    if (!res.ok) {
                        throw new Error(user.message || 'Authentication failed');
                    }

                    if (user) {
                        return {
                            id: user._id,
                            name: user.email, // Using email as name for now
                            email: user.email,
                            role: user.role,
                            token: user.token, // Capture the token from backend
                            walletAddress: "Anon" // Backend doesn't seem to return walletAddress yet, or it's not in the response. User model has it? No, User model in backend has gameData. Let's assume Anon for now or add it to backend response if needed.
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Auth Error:", e);
                    throw new Error('Authentication failed');
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = user.token; // Persist token
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.accessToken = token.accessToken; // Expose token to client
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey",
});

export { handler as GET, handler as POST };
