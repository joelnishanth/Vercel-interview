"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignOutButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const OWNER_EMAIL = "joelnishanthreddy@gmail.com";

const publicLinks = [
  { href: "/", label: "Product" },
  { href: "/demo", label: "Demo" },
  { href: "/architecture", label: "Architecture" },
  { href: "/eval", label: "Eval" },
  { href: "/presentation", label: "Presentation" },
];

const ownerLinks = [
  { href: "/prep", label: "Prep" },
];

export function NavBar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  const isOwner = email === OWNER_EMAIL;
  const links = isOwner ? [...publicLinks, ...ownerLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold text-foreground">
            Offlyn Token Audit
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                pathname === link.href
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          {isLoaded && isSignedIn ? (
            <>
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-8 w-8" },
                }}
              />
              <SignOutButton>
                <button className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Sign out
                </button>
              </SignOutButton>
            </>
          ) : isLoaded ? (
            <SignInButton mode="modal">
              <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent/90">
                Sign in
              </button>
            </SignInButton>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
