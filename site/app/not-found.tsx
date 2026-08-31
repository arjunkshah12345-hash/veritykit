import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wheel-demo-page" data-mode="dark">
      <div className="usage-content docs-copy">
        <h2>Missing</h2>
        <p>
          That page is not here. Go <Link href="/">home</Link> or open the{" "}
          <Link href="/docs">docs</Link>.
        </p>
      </div>
    </main>
  );
}
