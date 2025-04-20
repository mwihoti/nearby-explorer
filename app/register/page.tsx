"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Compass, Github, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {signIn } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"



export default function RegisterPage() {
  const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const [errors, setErrors] = useState("")

    const validateForm = () => {
      const newErrors: Record<string, string> = {}


      if (!name.trim()) newErrors.name = "Name is required"
      if (!email.trim()) newErrors.email = "Email is required"
      if (!password.trim()) newErrors.password = "Password is required"
      if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
      if (password !== confirmPassword) newErrors.password = "Passwords don't match"

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)

      if (!validateForm()) return

      setIsLoading(true)
      setErrors({})
try {
  // Call our api to register the user
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({name, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    if (data.fields) {
      // Handle validation errors
      const fieldErrors: Record<string, string> = {}
      if (data.fields.name) fieldErrors.name = "Name is required"
      if (data.fields.email) fieldErrors.email = "Email is required"
      if (data.fields.password) fieldErrors.password = "Password is required"
      setErrors(fieldErrors)
    } else {
      // handle other errors
      toast({
        title: "Registration failed",
        description: data.error || "Something went wrong",
        variant: "destructive"
      })
    }
    return
  }
  toast({
    title: "Account created",
    description: "Your account has been created successfully.",
  })

  // Siggn in the user after successful registration
  await signIn("credentials", {
    email,
    password,
    redirect: false,
  })
  router.push("/explore")
} catch (error) {
  console.error("Registration error:", error)
  toast({
    title: "Something went wrong",
    descrption: "Your registration failed. Please try again.",
    variant: "destructive"
  })
}
finally {
  setIsLoading(false)
}
 }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center  gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold">NearbyExplorer</span>
            </Link>

            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-right">Create an account</h1>
                    <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
                </div>

                        <Card>
                        <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Please fix the following errors:
                    <ul className="mt-2 list-disc pl-5">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button variant="outline" type="button" className="w-full" onClick={() => signIn("github")}>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </CardFooter>
          </form>
                        </Card>
                    
        <p className="px-8 text-center text-sm text-muted-foreground">
Already have an account?{" "}         
 <Link href="/login" className="underline underline-offset-4 hover:text-primary">
Sign in          </Link>        </p>
      </div>
    </div>
    )}