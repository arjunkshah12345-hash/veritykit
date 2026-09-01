import { Hero } from "./components/Hero";
import { Methods } from "./components/Methods";
import { UsageGuide } from "./components/UsageGuide";

export default function Home() {
  return (
    <main className="wheel-demo-page" data-mode="dark">
      <Hero />
      <Methods />
      <UsageGuide />
    </main>
  );
}
