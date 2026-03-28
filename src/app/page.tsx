'use client';
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/home/HeroSection";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import StepsSection from "@/components/home/StepsSection";
import MiniSiteShowcase from "@/components/home/MiniSiteShowcase";
import PricingSection from "@/components/home/PricingSection";
import BoostShowcase from "@/components/home/BoostShowcase";
import CtaSection from "@/components/home/CtaSection";
import DirectorySection from "@/components/home/DirectorySection";
import SlugListingsDirectory from "@/components/home/SlugListingsDirectory";
import PremiumFooter from "@/components/home/PremiumFooter";

const Index = () => {
  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <SEOHead
        title="TrustBank – Claim Your Premium Slug"
        description="The premium identity directory. Claim your keyword, build your luxury mini-site, and rise in the rankings."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "TrustBank",
          url: window.location.origin,
          description: "Premium Identity Directory — Mini Sites, Paywall Videos & Professional Directory",
        }}
      />
      <Header />
      <HeroSection />
      <FeaturesGrid />
      <StepsSection />
      <MiniSiteShowcase />
      <PricingSection />
      <BoostShowcase />
      <SlugListingsDirectory />
      <DirectorySection />
      <CtaSection />
      <PremiumFooter />
    </div>
  );
};

export default Index;
