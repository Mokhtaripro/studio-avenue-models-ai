import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-model.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="StudioAvenue - Agence de mannequins"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 luxury-container w-full">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 animate-fade-up font-sans">
            TheModelAgency by StudioAvenue
          </p>
          <h1 className="text-editorial mb-8 animate-fade-up animation-delay-100">
            L'élégance
            <br />
            <span className="italic">à portée de clic</span>
          </h1>
          <p className="text-subheadline text-muted-foreground mb-12 max-w-lg animate-fade-up animation-delay-200">
            Découvrez les talents de demain. Marrakech, Casablanca, Rabat,
            Agadir, Tanger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-300">
            <Link to="/devenir-mannequin">
              <Button variant="luxury" size="xl">
                Devenir Mannequin
              </Button>
            </Link>
            <Link to="/acces-pro">
              <Button variant="luxuryOutline" size="xl">
                Accès Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-foreground/30 to-foreground/60" />
      </div>
    </section>
  );
};

export default HeroSection;
