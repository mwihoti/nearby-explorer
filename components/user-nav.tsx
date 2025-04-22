"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, LogIn, LogOut, Settings, User } from 'lucide-react'
import { ModeToggle } from "@/components/mode-toggle"

export function UserNav() {
  const { data: session, status } = useSession()

  return (
    <div className="flex bg-zinc-900 items-center">
      <nav className="flex flex-1 items-center justify-start space-x-2 ml-24">
        <Link href="/explore">
          <Button variant="ghost" className="text-sm text-white hover:text-white hover:bg-gray-800">
            Explore
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="text-sm text-white hover:text-white hover:bg-gray-800">
            Home
          </Button>
        </Link>
        <Link href="/saved-places">
          <Button variant="ghost" className="text-sm text-white hover:text-white hover:bg-gray-800">
            Saved Places
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="ghost" className="text-sm text-white hover:text-white hover:bg-gray-800">
            Register
          </Button>
        </Link>
        <Link href="/about">
          <Button variant="ghost" className="text-sm text-white hover:text-white hover:bg-gray-800">
            About
          </Button>
        </Link>
        <ModeToggle />
      </nav>

      {status === "loading" ? (
        <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : !session ? (
        <Button variant="ghost" size="sm" onClick={() => signIn()} className="flex items-center gap-1 text-white hover:text-white hover:bg-gray-800">
          <LogIn className="h-4 w-4" />
          <span className="hidden md:inline">Sign in</span>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
            
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
