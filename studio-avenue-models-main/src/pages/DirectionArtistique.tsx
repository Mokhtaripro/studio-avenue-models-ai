import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Palette, Eye, Target, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

const services = [
  {
    icon: <Palette className="h-8 w-8" />,
    title: "Création de concept",
    description: "Développement d'un concept créatif unique adapté à votre marque et vos objectifs."
  },
  {
    icon: <Eye className="h-8 w-8" />,
    title: "Moodboard & Références",
    description: "Création de moodboards visuels et sélection de références pour guider la production."
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Direction sur set",
    description: "Présence d'un directeur artistique sur le plateau pour garantir la cohérence visuelle."
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Post-production",
    description: "Supervision de la retouche et du montage pour un rendu final parfait."
  }
];

const DirectionArtistique = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    projectDescription: "",
    hasExistingProject: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save to localStorage that DA is selected
    localStorage.setItem('project_da', 'true');
    localStorage.setItem('project_da_notes', formData.projectDescription);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Direction artistique ajoutée",
      description: "Cette option a été ajoutée à votre projet.",
    });

    setIsSubmitting(false);
    navigate('/mon-projet');
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-foreground text-background">
        <div className="luxury-container text-center">
          <div className="inline-flex items-center gap-2 bg-background/10 px-4 py-2 rounded-full mb-6 animate-fade-up">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em] font-sans">Option Premium</span>
          </div>
          <h1 className="text-editorial mb-6 animate-fade-up animation-delay-100">
            Direction
            <br />
            <span className="italic">Artistique</span>
          </h1>
          <p className="text-subheadline text-background/70 max-w-xl mx-auto animate-fade-up animation-delay-200">
            Confiez la vision créative de votre projet à nos directeurs artistiques expérimentés.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="luxury-container">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans">
              Nos services
            </p>
            <h2 className="text-headline">Une vision créative complète</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="text-center border-none bg-secondary animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full mb-6">
                    {service.icon}
                  </div>
                  <h3 className="font-serif text-lg mb-3">{service.title}</h3>
                  <p className="text-sm text-muted-foreground font-sans">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-secondary">
        <div className="luxury-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans">
                Notre processus
              </p>
              <h2 className="text-headline mb-8">
                Du brief à la
                <br />
                <span className="italic">réalisation</span>
              </h2>
              <div className="space-y-6">
                {[
                  "Brief créatif et analyse des objectifs",
                  "Proposition de concepts et moodboards",
                  "Validation et ajustements",
                  "Direction sur le plateau",
                  "Supervision post-production"
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0 text-sm font-sans">
                      {index + 1}
                    </div>
                    <p className="font-sans text-muted-foreground pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-xl mb-6">Ajouter à mon projet</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Nom de l'entreprise
                    </Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Votre entreprise"
                      className="h-12"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@exemple.com"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                        Téléphone
                      </Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+212 6XX XXX XXX"
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Décrivez votre projet
                    </Label>
                    <Textarea
                      value={formData.projectDescription}
                      onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                      placeholder="Objectifs, style souhaité, références..."
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="existing"
                      checked={formData.hasExistingProject}
                      onCheckedChange={(checked) => handleInputChange("hasExistingProject", checked as boolean)}
                    />
                    <label
                      htmlFor="existing"
                      className="text-sm font-sans text-muted-foreground cursor-pointer"
                    >
                      J'ai déjà composé mon projet (studio, équipe, talents)
                    </label>
                  </div>
                  <Button
                    type="submit"
                    variant="luxury"
                    size="xl"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Ajout en cours..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Ajouter la direction artistique
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="luxury-container text-center">
          <p className="text-muted-foreground font-sans mb-4">
            Vous n'avez pas encore composé votre projet ?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/studios">
              <Button variant="outline" size="lg">
                Choisir un studio
              </Button>
            </Link>
            <Link to="/mon-projet">
              <Button variant="luxury" size="lg">
                Voir mon projet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default DirectionArtistique;
