"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Compass, Github, Mail } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"



export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()


    const handleEmailSign = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            toast({
                title: "Check your email",
                description: "We sent you a login link. Be sure to check your spam too.",
              })
            } catch (error) {
              toast({
                title: "Something went wrong",
                description: "Your sign in request failed. Please try again.",
                variant: "destructive",
              })
            } finally {
              setIsLoading(false)
            
        }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link href="/" className="absolute left-4 top-4 md:left-8 md:top=8 flex items-center justify-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold">NearbyExplorer</span>
            </Link>

</div>
    )
}