import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import RecruiterDemo from "@/components/landing/RecruiterDemo";
import CandidateDemo from "@/components/landing/CandidateDemo";
import WhyChoose from "@/components/landing/WhyChoose";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        <RecruiterDemo />
        <CandidateDemo />
        <WhyChoose />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
