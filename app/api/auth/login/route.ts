import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { compare } from "bcryptjs"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        // validate input
        if (!email || !password) {
            return NextResponse.json(
                {error: "Missing required fields", fields: { email: !email, password: !password}},
                { status: 400}
            )
        }

        // connect to the database
        await dbConnect()

        // Find the user
        const user = await User.findOne({ email: email.toLowerCase()})

        // if user doesn't exist
        if (!user || !user.password) {
            return NextResponse.json({ error: "Invalid credentials"}, { status: 401})
        }

        // verify password
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
            return NextResponse.json({ error: "Invalid credentials"}, {status: 401})
        }

        // Return user data (excluding password)
        const userObj = user.toObject()
        delete userObj.password

        return NextResponse.json({
            message: "Login successful",
            user: userObj
        })
        
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Internal server error"}, {status: 500 })
    }
    
}