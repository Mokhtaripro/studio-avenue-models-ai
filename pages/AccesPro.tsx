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
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Building2, ArrowRight, ArrowLeft, CheckCircle2, Shield, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  "Accès exclusif à notre base de models",
  "Filtres avancés (ville, physique, budget...)",
  "Chat anonyme avec l'agence",
  "Réservations centralisées",
  "Support prioritaire dédié",
];

const companyTypes = [
  "Agence de publicité",
  "Marque / E-commerce",
  "Studio photo / vidéo",
  "Production audiovisuelle",
  "Agence événementielle",
  "Média / Presse",
  "Autre",
];

const modelTypes = [
  { id: "fashion", label: "Fashion" },
  { id: "commercial", label: "Commercial" },
  { id: "beauty", label: "Beauty" },
  { id: "editorial", label: "Editorial" },
  { id: "ugc", label: "UGC Creators" },
  { id: "runway", label: "Runway" },
];

const AccesPro = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: "",
    companyType: "",
    website: "",
    // Step 2: Contact Info
    contactName: "",
    email: "",
    phone: "",
    // Step 3: Needs
    projectDescription: "",
    modelTypes: [] as string[],
    budgetRange: "",
    timeline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModelTypeToggle = (typeId: string) => {
    setFormData((prev) => ({
      ...prev,
      modelTypes: prev.modelTypes.includes(typeId)
        ? prev.modelTypes.filter((t) => t !== typeId)
        : [...prev.modelTypes, typeId],
    }));
  };

  const isStep1Valid = () => {
    return formData.companyName.trim() !== "" && formData.companyType !== "";
  };

  const isStep2Valid = () => {
    return (
      formData.contactName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== ""
    );
  };

  const isStep3Valid = () => {
    return formData.projectDescription.trim() !== "" && formData.modelTypes.length > 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Demande envoyée !",
      description: "Notre équipe examine chaque demande avec attention. Nous vous contacterons sous 48h.",
    });

    setIsSubmitting(false);
    setStep(4); // Confirmation step
  };

  const totalSteps = 3;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="luxury-container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Benefits */}
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-sans">
                  Accès sur candidature
                </p>
              </div>
              <h1 className="text-editorial mb-8">
                Réservé aux
                <br />
                <span className="italic">professionnels</span>
              </h1>
              <p className="text-subheadline text-muted-foreground mb-12 max-w-md">
                Notre plateforme est accessible uniquement sur candidature. Nous examinons chaque demande pour garantir une expérience premium à nos models et partenaires.
              </p>

              <ul className="space-y-4 mb-12">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 text-foreground font-sans"
                  >
                    <span className="w-6 h-6 bg-foreground flex items-center justify-center">
                      <Check size={14} className="text-background" />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="p-8 bg-muted border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans">
                    Processus de sélection
                  </p>
                </div>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Chaque demande est examinée par notre équipe. Nous privilégions les partenaires qui partagent nos valeurs de professionnalisme et de respect envers nos talents.
                </p>
              </div>
            </div>

            {/* Right: Multi-step Form */}
            <div className="animate-fade-up animation-delay-200">
              <div className="bg-secondary p-8 lg:p-12 border border-border">
                {step <= totalSteps && (
                  <>
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-8">
                      {[1, 2, 3].map((s, index) => (
                        <div key={s} className="flex items-center">
                          <div
                            className={`w-8 h-8 flex items-center justify-center border-2 transition-colors text-sm ${
                              step >= s
                                ? "border-foreground bg-foreground text-background"
                                : "border-muted text-muted-foreground"
                            }`}
                          >
                            {step > s ? <CheckCircle2 size={14} /> : s}
                          </div>
                          {index < 2 && (
                            <div
                              className={`w-12 md:w-20 h-px mx-2 ${
                                step > s ? "bg-foreground" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                      <Building2 size={24} />
                      <div>
                        <h2 className="text-xl font-serif">Demande d'accès</h2>
                        <p className="text-xs text-muted-foreground font-sans">
                          Étape {step} sur {totalSteps}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 1: Company Info */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-up">
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Nom de l'entreprise *
                      </Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="Votre entreprise"
                        className="h-14 bg-background border-border focus:border-foreground"
                      />
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Type d'activité *
                      </Label>
                      <Select
                        value={formData.companyType}
                        onValueChange={(value) => handleInputChange("companyType", value)}
                      >
                        <SelectTrigger className="h-14 bg-background border-border">
                          <SelectValue placeholder="Sélectionnez votre activité" />
                        </SelectTrigger>
                        <SelectContent>
                          {companyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Site web (optionnel)
                      </Label>
                      <Input
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://votresite.com"
                        className="h-14 bg-background border-border focus:border-foreground"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="luxury"
                        size="xl"
                        className="w-full"
                        disabled={!isStep1Valid()}
                        onClick={() => setStep(2)}
                      >
                        Continuer
                        <ArrowRight size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Info */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-up">
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Nom complet *
                      </Label>
                      <Input
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        placeholder="Prénom Nom"
                        className="h-14 bg-background border-border focus:border-foreground"
                      />
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Email professionnel *
                      </Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="votre@entreprise.com"
                        className="h-14 bg-background border-border focus:border-foreground"
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
                        className="h-14 bg-background border-border focus:border-foreground"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="outline"
                        size="xl"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft size={18} />
                        Retour
                      </Button>
                      <Button
                        variant="luxury"
                        size="xl"
                        className="flex-1"
                        disabled={!isStep2Valid()}
                        onClick={() => setStep(3)}
                      >
                        Continuer
                        <ArrowRight size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Needs */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-up">
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Décrivez votre projet *
                      </Label>
                      <Textarea
                        value={formData.projectDescription}
                        onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                        placeholder="Décrivez brièvement vos besoins et le type de projets que vous réalisez..."
                        className="min-h-[120px] bg-background border-border focus:border-foreground resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-4 block font-sans">
                        Types de models recherchés *
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {modelTypes.map((type) => (
                          <div
                            key={type.id}
                            className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${
                              formData.modelTypes.includes(type.id)
                                ? "border-foreground bg-background"
                                : "border-border bg-background hover:border-foreground/50"
                            }`}
                            onClick={() => handleModelTypeToggle(type.id)}
                          >
                            <Checkbox
                              checked={formData.modelTypes.includes(type.id)}
                              onCheckedChange={() => handleModelTypeToggle(type.id)}
                            />
                            <span className="text-sm font-sans">{type.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Budget estimé (optionnel)
                      </Label>
                      <Select
                        value={formData.budgetRange}
                        onValueChange={(value) => handleInputChange("budgetRange", value)}
                      >
                        <SelectTrigger className="h-14 bg-background border-border">
                          <SelectValue placeholder="Sélectionnez une fourchette" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Moins de 5 000 MAD</SelectItem>
                          <SelectItem value="medium">5 000 - 15 000 MAD</SelectItem>
                          <SelectItem value="high">15 000 - 50 000 MAD</SelectItem>
                          <SelectItem value="premium">Plus de 50 000 MAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        variant="outline"
                        size="xl"
                        className="flex-1"
                        onClick={() => setStep(2)}
                      >
                        <ArrowLeft size={18} />
                        Retour
                      </Button>
                      <Button
                        variant="luxury"
                        size="xl"
                        className="flex-1"
                        disabled={!isStep3Valid() || isSubmitting}
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center font-sans">
                      En soumettant ce formulaire, vous acceptez nos conditions d'utilisation.
                    </p>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="text-center py-8 animate-fade-up">
                    <div className="w-16 h-16 bg-foreground flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-background" />
                    </div>
                    <h2 className="text-2xl font-serif mb-4">Demande envoyée !</h2>
                    <p className="text-muted-foreground font-sans mb-8 max-w-sm mx-auto">
                      Notre équipe examine votre candidature. Vous recevrez une réponse par email sous 48h.
                    </p>
                    <Button
                      variant="luxuryOutline"
                      size="lg"
                      onClick={() => window.location.href = "/"}
                    >
                      Retour à l'accueil
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AccesPro;
