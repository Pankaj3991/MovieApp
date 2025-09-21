"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // helps detect route changes
import { LogIn, LogOut, StickyNote, Menu, X } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const [open, setOpen] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch("/api/auth/check", {
            credentials: "include", // send cookies with the request
        })
            .then((res) => res.json())
            .then((data) => {
                setIsLoggedIn(data.loggedIn);
            })
            .catch(() => setIsLoggedIn(false));
    }, [pathname, isLoggedIn]);

    async function handleLogout() {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include", // ensure cookie is sent
            });

            if (!res.ok) {
                throw new Error("Logout failed");
            }
            setIsLoggedIn(false);
            // Redirect to home page
            router.push("/");
        } catch (err) {
            console.error("Logout error:", err);
        }
    }
    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-blue-600">
                    Movie-App
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link href="/mymovies" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                        <StickyNote size={20} />
                        <span>My Movies</span>
                    </Link>
                    {isLoggedIn ? (
                        <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600" onClick={handleLogout}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <Link href="/login" className="flex items-center space-x-1 text-gray-700 hover:text-green-600">
                            <LogIn size={20} />
                            <span>Login / Signup</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {open && (
                <div className="md:hidden bg-white border-t shadow-md">
                    <Link
                        href="/mymovies"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                    >
                        <span className="flex">
                        <StickyNote className="mr-2" size={20} />
                        <span>My Movies</span>
                        </span>

                    </Link>

                    {isLoggedIn ? (
                        <button
                            className="flex w-full items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                            onClick={() => { handleLogout(); setOpen(false) }}
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-green-600"
                            onClick={() => setOpen(false)}
                        >
                            <LogIn size={20} />
                            <span>Login / Signup</span>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
