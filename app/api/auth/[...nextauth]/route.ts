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
    adpter: MongoDBAdapter(clientPromise),
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
                // This is where you would normally validate credentials against your database 
                // test return demo user
                if (!credentials?.email || !credentials?.password) {
                
            return null}

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

    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60 // 7days
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }