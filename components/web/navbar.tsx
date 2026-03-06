import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  return (
    <nav className="w-full py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
           <Link  href="/" >
           <h1 className="text-3xl font-bold">Next
                <span className="text-blue-500"> Pro</span>
                </h1> 
                </ Link>

                <div className="flex flex-center gap-2">
                    <Button asChild variant="ghost">
                    <Link href="/" >Home </Link>
                    </Button>
                    <Button asChild variant="ghost">
                    <Link href="/blog" >Blog</Link>
                    </Button>
                    <Button asChild variant="ghost">
                    <Link href="/create" >Create</Link>
                    </Button>
                </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                    <Link  href="/auth/sign-up">Sign Up</Link>
                    </Button>
                    <Button variant="outline" asChild>
                    <Link href="/auth/Login">Login</Link>
                    </Button>
                    <ThemeToggle />
                </div>
    </nav>
  )}           