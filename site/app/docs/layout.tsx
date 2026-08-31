import { DocsNav } from "../components/DocsNav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="wheel-demo-page" data-mode="dark">
      <DocsNav />
      <div className="usage-content docs-copy">{children}</div>
    </main>
  );
}
