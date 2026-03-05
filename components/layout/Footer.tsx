import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-20">
      <div className="luxury-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img 
              src={logoWhite} 
              alt="StudioAvenue" 
              className="h-8 mb-4"
            />
            <p className="text-sm text-primary-foreground/70 font-sans leading-relaxed">
              L'agence de models et studios photo de référence au Maroc.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 font-sans">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/devenir-model"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-sans"
                >
                  Devenir Model
                </Link>
              </li>
              <li>
                <Link
                  to="/ugc-creators"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-sans"
                >
                  UGC Creators
                </Link>
              </li>
              <li>
                <Link
                  to="/acces-pro"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-sans"
                >
                  Accès Pro
                </Link>
              </li>
              <li>
                <Link
                  to="/studios"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-sans"
                >
                  Studios
                </Link>
              </li>
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 font-sans">
              Villes
            </h4>
            <ul className="space-y-3">
              {["Marrakech", "Casablanca", "Rabat", "Agadir", "Tanger"].map(
                (city) => (
                  <li key={city}>
                    <span className="text-sm text-primary-foreground/70 font-sans">
                      {city}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6 font-sans">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@studioavenue.ma"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors font-sans"
                >
                  contact@studioavenue.ma
                </a>
              </li>
              <li>
                <span className="text-sm text-primary-foreground/70 font-sans">
                  +212 5 XX XX XX XX
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/50 font-sans">
            © {currentYear} StudioAvenue. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link
              to="/mentions-legales"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors font-sans"
            >
              Mentions légales
            </Link>
            <Link
              to="/confidentialite"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors font-sans"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
