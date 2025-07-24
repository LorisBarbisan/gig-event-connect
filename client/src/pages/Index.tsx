import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { JobListings } from "@/components/JobListings";
import { CTASection } from "@/components/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <JobListings />
      <CTASection />
    </Layout>
  );
};

export default Index;
