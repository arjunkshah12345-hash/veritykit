"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/install", label: "Install" },
  { href: "/docs/bridges", label: "Bridges" },
  { href: "/docs/methods", label: "Methods" },
  { href: "/docs/environments", label: "Environments" },
  { href: "/docs/paint", label: "Paint JS" },
  { href: "/docs/examples", label: "Examples" },
  { href: "/docs/api", label: "API" },
];

export function DocsNav() {
  const pathname = usePathname();

  return (
    <header className="docs-top">
      <Link className="docs-wordmark" href="/">
        Verity
      </Link>
      <nav className="docs-nav" aria-label="Docs">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} data-active={pathname === link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
