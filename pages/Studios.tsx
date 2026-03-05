import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import studioImage from "@/assets/studio-space.jpg";

const studios = [
  {
    id: "studio-a",
    name: "Studio A",
    city: "Marrakech",
    size: "150m²",
    features: ["Cyclorama blanc", "Lumière naturelle", "Vestiaire"],
    priceHour: 800,
    priceDay: 5000,
  },
  {
    id: "studio-b",
    name: "Studio B",
    city: "Casablanca",
    size: "200m²",
    features: ["Cyclorama noir & blanc", "Blackout", "Maquillage"],
    priceHour: 1000,
    priceDay: 6500,
  },
  {
    id: "studio-c",
    name: "Studio C",
    city: "Rabat",
    size: "120m²",
    features: ["Lumière naturelle", "Terrasse", "Parking"],
    priceHour: 600,
    priceDay: 4000,
  },
];

const cities = ["Marrakech", "Casablanca", "Rabat", "Agadir", "Tanger"];

const Studios = () => {
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    date: "",
    duration: "",
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

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Demande envoyée !",
      description: "Notre équipe vous contactera sous 24h pour confirmer votre réservation.",
    });

    setIsSubmitting(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      city: "",
      date: "",
      duration: "",
      message: "",
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 opacity-10">
          <img
            src={studioImage}
            alt="Studio"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative luxury-container text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans animate-fade-up">
            Location de Studios
          </p>
          <h1 className="text-editorial mb-6 animate-fade-up animation-delay-100">
            Espaces
            <br />
            <span className="italic">d'exception</span>
          </h1>
          <p className="text-subheadline text-muted-foreground max-w-xl mx-auto animate-fade-up animation-delay-200">
            Studios photo professionnels disponibles à la location dans les
            principales villes du Maroc.
          </p>
        </div>
      </section>

      {/* Studios Grid */}
      <section className="py-20 bg-secondary">
        <div className="luxury-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studios.map((studio, index) => (
              <div
                key={studio.id}
                className={`bg-background border transition-all duration-300 cursor-pointer animate-fade-up ${
                  selectedStudio === studio.id
                    ? "border-foreground"
                    : "border-border hover:border-muted-foreground"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedStudio(studio.id)}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={studioImage}
                    alt={studio.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 px-3 py-1">
                    <MapPin size={12} />
                    <span className="text-xs font-sans">{studio.city}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-serif mb-1">{studio.name}</h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        {studio.size}
                      </p>
                    </div>
                    {selectedStudio === studio.id && (
                      <div className="w-6 h-6 bg-foreground flex items-center justify-center">
                        <Check size={14} className="text-background" />
                      </div>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {studio.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-muted-foreground flex items-center gap-2 font-sans"
                      >
                        <span className="w-1 h-1 bg-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-4 text-sm font-sans">
                    <div>
                      <span className="text-muted-foreground">À l'heure:</span>{" "}
                      <span className="font-medium">{studio.priceHour} MAD</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">À la journée:</span>{" "}
                      <span className="font-medium">{studio.priceDay} MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20">
        <div className="luxury-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans">
                Réservation
              </p>
              <h2 className="text-headline mb-4">Réserver un studio</h2>
              <p className="text-subheadline text-muted-foreground">
                Complétez le formulaire ci-dessous et notre équipe vous
                recontactera rapidement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-xs uppercase tracking-wider mb-2 block font-sans"
                  >
                    Nom complet *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Prénom Nom"
                    className="h-14 bg-background border-border focus:border-foreground"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="text-xs uppercase tracking-wider mb-2 block font-sans"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="votre@email.com"
                    className="h-14 bg-background border-border focus:border-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="phone"
                    className="text-xs uppercase tracking-wider mb-2 block font-sans"
                  >
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+212 6XX XXX XXX"
                    className="h-14 bg-background border-border focus:border-foreground"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="city"
                    className="text-xs uppercase tracking-wider mb-2 block font-sans"
                  >
                    Ville souhaitée *
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleInputChange("city", value)}
                  >
                    <SelectTrigger className="h-14 bg-background border-border">
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="date"
                    className="text-xs uppercase tracking-wider mb-2 block font-sans"
                  >
                    <Calendar size={14} className="inline mr-2" />
                    Date souhaitée
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="h-14 bg-background border-border focus:border-foreground"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="duration"
                    className="text-xs uppercase tracking-wider mb-2 block font-sans"
                  >
                    <Clock size={14} className="inline mr-2" />
                    Durée
                  </Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) =>
                      handleInputChange("duration", value)
                    }
                  >
                    <SelectTrigger className="h-14 bg-background border-border">
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2h">2 heures</SelectItem>
                      <SelectItem value="4h">4 heures (demi-journée)</SelectItem>
                      <SelectItem value="8h">8 heures (journée)</SelectItem>
                      <SelectItem value="multi">Plusieurs jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="message"
                  className="text-xs uppercase tracking-wider mb-2 block font-sans"
                >
                  Détails du projet
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Décrivez votre projet (type de shooting, équipe, besoins spécifiques...)"
                  className="min-h-[120px] bg-background border-border focus:border-foreground resize-none"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="luxury"
                  size="xl"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Demander un devis"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Studios;
