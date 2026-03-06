import Hero from "../components/Hero";
import Features from "../components/Features";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-black min-h-screen">
      <Hero />
      <Features />
    </div>
  );
}