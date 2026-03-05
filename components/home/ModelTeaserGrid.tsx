import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import model1 from "@/assets/model-1.jpg";
import model2 from "@/assets/model-2.jpg";
import model3 from "@/assets/model-3.jpg";
import model4 from "@/assets/model-4.jpg";

interface ModelCard {
  id: string;
  name: string;
  city: string;
  image: string;
  categories: string[];
}

const featuredModels: ModelCard[] = [
  {
    id: "1",
    name: "Alexandre M.",
    city: "Marrakech",
    image: model1,
    categories: ["Fashion", "Editorial"],
  },
  {
    id: "2",
    name: "Sofia L.",
    city: "Casablanca",
    image: model2,
    categories: ["Beauty", "Commercial"],
  },
  {
    id: "3",
    name: "Amina K.",
    city: "Rabat",
    image: model3,
    categories: ["Fashion", "Runway"],
  },
  {
    id: "4",
    name: "Youssef B.",
    city: "Tanger",
    image: model4,
    categories: ["Editorial", "UGC"],
  },
];

const ModelTeaserGrid = () => {
  const [selectedModel, setSelectedModel] = useState<ModelCard | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Demande envoyée !",
      description: `Votre demande concernant ${selectedModel?.name} a été transmise. Notre équipe vous contactera sous 48h.`,
    });

    setIsSubmitting(false);
    setSelectedModel(null);
    setFormData({ companyName: "", email: "", phone: "", message: "" });
  };

  const isFormValid = () => {
    return (
      formData.companyName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== ""
    );
  };

  return (
    <section className="editorial-spacing bg-background">
      <div className="luxury-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans">
            Nos Talents
          </p>
          <h2 className="text-headline mb-6">Sélection exclusive</h2>
          <p className="text-subheadline text-muted-foreground max-w-xl mx-auto">
            Un aperçu de notre roster. Accès complet réservé aux professionnels
            partenaires.
          </p>
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {featuredModels.map((model, index) => (
            <div
              key={model.id}
              className="group relative aspect-[3/4] overflow-hidden bg-muted animate-fade-up cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedModel(model)}
            >
              <img
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <h3 className="text-lg font-serif text-primary-foreground mb-1">
                  {model.name}
                </h3>
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70 font-sans">
                  {model.city}
                </p>
                <div className="flex gap-2 mt-3">
                  {model.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] uppercase tracking-wider bg-primary-foreground/20 px-2 py-1 text-primary-foreground font-sans"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-muted border border-border">
            <Lock size={16} className="text-muted-foreground" />
            <span className="text-sm font-sans text-muted-foreground">
              Accès complet réservé aux professionnels partenaires
            </span>
          </div>
          <div className="mt-8">
            <a
              href="/acces-pro"
              className="text-xs uppercase tracking-[0.2em] text-foreground underline underline-offset-4 hover:no-underline transition-all font-sans"
            >
              Demander l'accès professionnel →
            </a>
          </div>
        </div>
      </div>

      {/* Model Request Dialog */}
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Demande d'informations</DialogTitle>
          </DialogHeader>

          {selectedModel && (
            <div className="space-y-6">
              {/* Model Preview */}
              <div className="flex gap-4 p-4 bg-muted border border-border">
                <img
                  src={selectedModel.image}
                  alt={selectedModel.name}
                  className="w-20 h-28 object-cover"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="font-serif text-lg">{selectedModel.name}</h3>
                  <p className="text-sm text-muted-foreground font-sans">{selectedModel.city}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedModel.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] uppercase tracking-wider bg-foreground/10 px-2 py-1 font-sans"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Request Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                    Entreprise / Marque *
                  </Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Nom de votre entreprise"
                    className="h-12 bg-background border-border focus:border-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Email *
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="votre@email.com"
                      className="h-12 bg-background border-border focus:border-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Téléphone *
                    </Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      className="h-12 bg-background border-border focus:border-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                    Votre besoin
                  </Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Décrivez brièvement votre projet..."
                    className="min-h-[100px] bg-background border-border focus:border-foreground resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="luxury"
                  size="lg"
                  className="w-full"
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Demander l'accès"}
                </Button>

                <p className="text-xs text-muted-foreground text-center font-sans">
                  Notre équipe vous contactera sous 48h pour discuter de vos besoins.
                </p>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ModelTeaserGrid;
