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
      <main className="flex-1 pb-24">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Hero />
        </div>
        
        <TrustSection />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ChallengesSection />
        </div>

        <SolutionSection />
        <HowItWorksSection />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ReportsSection />
        </div>
      </main>
      <CTABanner />
      <Footer />
    </div>
  );
}


