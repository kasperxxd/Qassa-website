import { Link, useLocation } from "wouter";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/book", label: "احجز موعداً" },
    { href: "/gallery", label: "المعرض" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">Qassa</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
            <Link 
              href="/admin" 
              className="text-xs font-medium text-muted-foreground/60 hover:text-primary transition-colors ml-4"
            >
              الإدارة
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Qassa. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}