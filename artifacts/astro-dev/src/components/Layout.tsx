import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import PushOptIn from "./PushOptIn";
import SeoHead from "./SeoHead";
import { siteSchema } from "./SeoHead";

const navLinks = [
  { href: "/", label: "Today" },
  { href: "/tools", label: "Tools" },
  { href: "/guides", label: "Guides" },
  { href: "/hn", label: "HN Feed" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Default SEO — pages override via SeoHead */}
      <SeoHead schema={siteSchema()} />

      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-7 h-7 rounded bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-mono font-bold text-sm tracking-widest text-foreground">
              ASTRO<span className="text-primary cursor-blink">_</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1" data-testid="nav-desktop">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? location === "/" : location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors font-mono ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="ml-2 pl-2 border-l border-border">
              <PushOptIn />
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            className="sm:hidden p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="nav-mobile-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1" data-testid="nav-mobile">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? location === "/" : location.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded text-sm font-mono font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="px-3 pt-2">
              <PushOptIn />
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-sm tracking-widest">ASTRO_</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daily dev resources for indie hackers and solo builders. Tool scorecards, guides, and curated HN.
              </p>
            </div>

            {/* Nav */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Pages</div>
              <div className="space-y-1.5">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    <Link href={link.href} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </div>
                ))}
                <div>
                  <Link href="/compare" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                    Compare Tools
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <NewsletterForm />
            </div>
          </div>

          <div className="border-t border-border pt-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>ASTRO_ — daily dev resource for indie hackers</span>
            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
