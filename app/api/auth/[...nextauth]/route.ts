import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { compare } from "bcryptjs"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || ""
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                await dbConnect()

                try {
                    // find the user in the database
                    const user = await User.findOne({email: credentials.email.toLowerCase() })

                    // if user doesn't exist
                    if (!user || !user.password) {
                        return null
                    }
                    // verify password
                    const passwordValid = await compare(credentials.password, user.password)
                    if (!passwordValid) {
                        return null
                    }

                    // Return user data
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image
                    }

                } catch (error) {
                    console.error("Error in authorize:", error)
                    return null
                }
            },
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login", // Add this line to ensure errors go to login page
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60 // 7days
    },
    callbacks: {
        // Add this callback to allow linking OAuth accounts with existing credentials
        async signIn({ user, account, profile }) {
            // Allow all email+password sign-ins
            if (account.provider === "credentials") {
                return true
            }
            
            // For OAuth providers, check if a user with this email already exists
            const existingUser = await User.findOne({ email: user.email.toLowerCase() })
            
            // If there's an existing user, we'll update that user to link the OAuth account
            if (existingUser) {
                // Update the user with OAuth profile information
                existingUser.name = user.name || existingUser.name
                existingUser.image = user.image || existingUser.image
                
                // Save the updated user
                await existingUser.save()
                
                // We need to customize the user object sent back to NextAuth
                user.id = existingUser.id.toString()
                
                return true
            }
            
            return true
        },
        
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }