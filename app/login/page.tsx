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
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"



export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/explore"

  useEffect(() => {
    if (error) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: "Error starting the OAuth sign-in flow.",
        OAuthCallback: "Error completing the OAuth sign-in flow.",
        OAuthCreateAccount: "Error creating a user with the OAuth provider.",
        EmailCreateAccount: "Error creating a user with the email provider.",
        Callback: "Error during the OAuth callback.",
        OAuthAccountNotLinked: "This email is already associated with another account.",
        EmailSignin: "Error sending the email sign-in link.",
        CredentialsSignin: "The credentials you provided were invalid.",
        SessionRequired: "You must be signed in to access this page.",
        Default: "An unknown error occurred during authentication.",
      }
      setErrorMessage(errorMessages[error] || errorMessages.Default)
      toast({
        title: "Authentication Error",
        description: errorMessages[error] || errorMessages.Default,
        variant: "destructive"
      })
    }
  }, [error, toast])

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorMessage(null)

       try {
        // First validate fetch api
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email, password}),
        })

        const data = await response.json()

        if (!response.ok) {
          setErrorMessage(data.error || "Invalid credentials")
          toast({
            title: "Authentication failed",
            description: data.error || "Please check your "
          })
        }
       } catch (error) {
        
       }
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link href="/" className="absolute left-4 top-4 md:left-8 md:top=8 flex items-center justify-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold">NearbyExplorer</span>
            </Link>

            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-right">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                </div>

                <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="oauth">OAuth</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Sign In</CardTitle>
                                <CardDescription>Enter your email below to receive a sign In link</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    />

                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password">Password</label>
                                        <Link href="/forgot-password" className="text-xs text-primary underline-offset-4 hover:underline">
                                        Forgot password?
                                        </Link>
                                    </div>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleEmailSignIn} disabled={isLoading}>
                                    {isLoading ? "Signing In..." : "Sign In with Email"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="oauth">
                    <Card>
              <CardHeader>
                <CardTitle>OAuth Providers</CardTitle>
                <CardDescription>Sign in with one of the following providers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => signIn("github")}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" className="w-full" onClick={() => signIn("google")}>
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 22q-2.05 0-3.875-.788t-3.188-2.15-2.137-3.175T2 12q0-2.075.788-3.887t2.15-3.175 3.175-2.138T12 2q2.075 0 3.887.788t3.175 2.15 2.138 3.175T22 12q0 2.05-.788 3.875t-2.15 3.188-3.175 2.137T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => signIn("email", { email })}>
                  <Mail className="mr-2 h-4 w-4" />
                  Magic Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
    )}