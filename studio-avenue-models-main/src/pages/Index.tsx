import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ModelTeaserGrid from "@/components/home/ModelTeaserGrid";
import StudioTeaser from "@/components/home/StudioTeaser";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ModelTeaserGrid />
      <StudioTeaser />
      <Footer />
    </main>
  );
};

export default Index;
