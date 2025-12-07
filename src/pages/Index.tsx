import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import WhyChoose from "@/components/landing/WhyChoose";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="SteelJobs.com | Steel, Power & Mining Jobs Portal"
        description="India's specialized job portal for Steel, Power, and Mining industries. Connect skilled professionals with top employers. Find jobs in metallurgy, plant operations, mining engineering, and more."
        keywords="steel jobs, power sector jobs, mining jobs, metallurgy careers, plant manager jobs, industrial jobs India, heavy industry recruitment"
        canonicalUrl="https://steeljobs.com"
        ogType="website"
      />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        <WhyChoose />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
