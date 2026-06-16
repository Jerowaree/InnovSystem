import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import ChallengesSection from "@/components/ChallengesSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ReportsSection from "@/components/ReportsSection";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#fcfdff] text-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl flex-1 px-6 pt-8 pb-24 lg:px-8">
        <Hero />
        <TrustSection />
        <ChallengesSection />
        <SolutionSection />
        <HowItWorksSection />
        <ReportsSection />
      </main>
      <CTABanner />
      <Footer />
    </div>
  );
}
