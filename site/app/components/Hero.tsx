"use client";

import Link from "next/link";
import { GITHUB } from "../lib/links";
import { AsciiField } from "./AsciiField";

export function Hero() {
  return (
    <header className="vk-hero">
      <a className="skip-link" href="#install">
        Skip to install
      </a>
      <div className="vk-hero-bar">
        <span className="vk-wordmark">Verity</span>
        <nav aria-label="Site">
          <Link href="/docs">Docs</Link>
          <a href={GITHUB} rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>

      <div className="vk-hero-body">
        <div className="vk-hero-copy">
          <h1>Train in TypeScript.</h1>
          <p>SFT, DPO, and GRPO. One trainer. MIT.</p>
          <a className="vk-hero-install" href="#install">
            pnpm add veritykit
          </a>
        </div>

        <figure className="vk-stage">
          <AsciiField />
        </figure>
      </div>
    </header>
  );
}
