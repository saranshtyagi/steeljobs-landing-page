import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import WhyChoose from "@/components/landing/WhyChoose";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/seo/SEOHead";

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      // Redirect logged-in users to their dashboard
      navigate(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate", { replace: true });
    }
  }, [user, role, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Don't render landing page for logged-in users
  if (user && role) {
    return null;
  }

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
