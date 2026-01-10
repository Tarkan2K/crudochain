import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
                    // Fetch user from DB Service
                    const res = await fetch(`http://127.0.0.1:3001/users/find?email=${credentials.email}`);
                    const user = await res.json();

                    if (!user) {
                        throw new Error('No user found with this email');
                    }

                    const isMatch = await bcrypt.compare(credentials.password, user.password);

                    if (!isMatch) {
                        throw new Error('Invalid password');
                    }

                    return {
                        id: user.id || user._id, // Handle both
                        name: user.name,
                        email: user.email,
                        walletAddress: user.walletAddress,
                        role: user.role || 'user'
                    };
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
                token.walletAddress = user.walletAddress;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
                session.user.walletAddress = token.walletAddress;
                session.user.role = token.role;
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
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey", // In prod, use env var
});

export { handler as GET, handler as POST };
