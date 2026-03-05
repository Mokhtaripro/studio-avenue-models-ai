import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import logoBlack from "@/assets/logo-black.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const mainNavLinks = [
    { href: "/studios", label: "Studios" },
    { href: "/composer-setup", label: "Setup" },
    { href: "/composer-equipe", label: "Équipe" },
    { href: "/talents", label: "Talents" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="luxury-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoBlack} 
              alt="StudioAvenue" 
              className="h-8 md:h-10"
            />
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-8">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-xs uppercase tracking-[0.2em] font-sans transition-colors duration-300",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/direction-artistique"
              className={cn(
                "text-xs uppercase tracking-[0.2em] font-sans transition-colors duration-300 flex items-center gap-1",
                isActive("/direction-artistique")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Direction Artistique
            </Link>
          </nav>

          {/* Desktop CTA - Right */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/devenir-model">
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider">
                Devenir Model
              </Button>
            </Link>
            <Link to="/acces-pro">
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider">
                Espace Entreprise
              </Button>
            </Link>
            <Link to="/connexion">
              <Button variant="luxuryOutline" size="sm">
                Connexion
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 top-20 bg-background z-40 transition-transform duration-300 overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col items-center py-12 gap-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Composer votre projet
          </p>
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-xl font-serif transition-colors duration-300",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/direction-artistique"
            onClick={() => setIsOpen(false)}
            className={cn(
              "text-xl font-serif transition-colors duration-300",
              isActive("/direction-artistique")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Direction Artistique
          </Link>
          
          <div className="h-px w-32 bg-border my-4" />
          
          <Link
            to="/devenir-model"
            onClick={() => setIsOpen(false)}
            className="text-xl font-serif text-muted-foreground hover:text-foreground"
          >
            Devenir Model
          </Link>
          <Link
            to="/ugc-creators"
            onClick={() => setIsOpen(false)}
            className="text-xl font-serif text-muted-foreground hover:text-foreground"
          >
            UGC Creators
          </Link>
          <Link
            to="/acces-pro"
            onClick={() => setIsOpen(false)}
            className="text-xl font-serif text-muted-foreground hover:text-foreground"
          >
            Espace Entreprise
          </Link>
          
          <div className="h-px w-32 bg-border my-4" />
          
          <Link to="/connexion" onClick={() => setIsOpen(false)}>
            <Button variant="luxury" size="lg">
              Connexion
            </Button>
          </Link>
          
          <Link to="/mon-projet" onClick={() => setIsOpen(false)}>
            <Button variant="outline" size="lg">
              Mon Projet
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
