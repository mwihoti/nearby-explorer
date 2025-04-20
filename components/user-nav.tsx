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
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { LogIn } from "lucide-react"

export default function UserNav() {
    const { data: session} = useSession()

    if (!session) {
        return (
            <Button variant="ghost" size="icon" onClick={() => signIn()}>
                <LogIn className="h-[1.2rem] w-[1.2rem" />
                <span className="sr-only">Sign in</span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                        <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMonth>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link href="/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                    <Link href="/saved-places">
                    <DropdownMenuItem>Saved Places</DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}