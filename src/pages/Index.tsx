import { Hero } from "@/components/Hero";
import { GameTypes } from "@/components/GameTypes";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <GameTypes />
        <Features />
        <HowItWorks />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
