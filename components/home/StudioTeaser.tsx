import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import studioImage from "@/assets/studio-space.jpg";

const StudioTeaser = () => {
  return (
    <section className="editorial-spacing bg-secondary">
      <div className="luxury-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden animate-fade-up">
            <img
              src={studioImage}
              alt="Studio photo professionnel"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="animate-fade-up animation-delay-200">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans">
              Location de Studios
            </p>
            <h2 className="text-headline mb-6">
              Espaces de création
              <br />
              <span className="italic">exceptionnels</span>
            </h2>
            <p className="text-subheadline text-muted-foreground mb-8 leading-relaxed">
              Studios photo et espaces de production haut de gamme disponibles à
              la location. Équipements professionnels, cycloramas, lumière
              naturelle.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                "Studios équipés professionnellement",
                "Cycloramas blanc et noir",
                "Équipe technique sur demande",
                "Disponible à l'heure ou à la journée",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm font-sans text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 bg-foreground" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/studios">
              <Button variant="luxury" size="xl">
                Découvrir nos studios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudioTeaser;
