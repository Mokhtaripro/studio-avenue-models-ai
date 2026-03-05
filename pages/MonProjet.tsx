import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building, 
  Camera, 
  Users, 
  Star, 
  Sparkles, 
  Trash2, 
  Send,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface ProjectItem {
  id: string;
  name: string;
  price: number;
}

const MonProjet = () => {
  const [studio, setStudio] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<ProjectItem[]>([]);
  const [team, setTeam] = useState<ProjectItem[]>([]);
  const [talents, setTalents] = useState<ProjectItem[]>([]);
  const [hasDA, setHasDA] = useState(false);
  const [daNotes, setDaNotes] = useState("");
  
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    // Load studio selection
    const savedStudio = localStorage.getItem('project_studio');
    if (savedStudio) setStudio(savedStudio);

    // Load equipment
    const savedEquipment = localStorage.getItem('project_equipment');
    if (savedEquipment) {
      const ids = JSON.parse(savedEquipment);
      const { data } = await supabase
        .from('equipment_items' as any)
        .select('id, name, price_per_day')
        .in('id', ids);
      const items = (data as unknown as { id: string; name: string; price_per_day: number | null }[]) || [];
      setEquipment(items.map(e => ({ id: e.id, name: e.name, price: e.price_per_day || 0 })));
    }

    // Load team
    const savedTeam = localStorage.getItem('project_team');
    if (savedTeam) {
      const ids = JSON.parse(savedTeam);
      const { data } = await supabase
        .from('team_members' as any)
        .select('id, name, price_per_day')
        .in('id', ids);
      const items = (data as unknown as { id: string; name: string; price_per_day: number | null }[]) || [];
      setTeam(items.map(t => ({ id: t.id, name: t.name, price: t.price_per_day || 0 })));
    }

    // Load talents
    const savedTalents = localStorage.getItem('project_talents');
    if (savedTalents) {
      const ids = JSON.parse(savedTalents);
      const { data } = await supabase
        .from('model_profiles')
        .select('id, pseudo, price_per_day')
        .in('id', ids);
      setTalents(data?.map(t => ({ id: t.id, name: t.pseudo || 'Model', price: t.price_per_day || 0 })) || []);
    }

    // Load DA
    const savedDA = localStorage.getItem('project_da');
    const savedDANotes = localStorage.getItem('project_da_notes');
    if (savedDA === 'true') setHasDA(true);
    if (savedDANotes) setDaNotes(savedDANotes);
  };

  const removeItem = (type: 'equipment' | 'team' | 'talents' | 'da', id?: string) => {
    if (type === 'equipment' && id) {
      const newItems = equipment.filter(e => e.id !== id);
      setEquipment(newItems);
      localStorage.setItem('project_equipment', JSON.stringify(newItems.map(e => e.id)));
    } else if (type === 'team' && id) {
      const newItems = team.filter(t => t.id !== id);
      setTeam(newItems);
      localStorage.setItem('project_team', JSON.stringify(newItems.map(t => t.id)));
    } else if (type === 'talents' && id) {
      const newItems = talents.filter(t => t.id !== id);
      setTalents(newItems);
      localStorage.setItem('project_talents', JSON.stringify(newItems.map(t => t.id)));
    } else if (type === 'da') {
      setHasDA(false);
      setDaNotes("");
      localStorage.removeItem('project_da');
      localStorage.removeItem('project_da_notes');
    }
    
    toast({
      title: "Élément retiré",
      description: "Votre projet a été mis à jour",
    });
  };

  const clearProject = () => {
    setStudio(null);
    setEquipment([]);
    setTeam([]);
    setTalents([]);
    setHasDA(false);
    setDaNotes("");
    
    localStorage.removeItem('project_studio');
    localStorage.removeItem('project_equipment');
    localStorage.removeItem('project_team');
    localStorage.removeItem('project_talents');
    localStorage.removeItem('project_da');
    localStorage.removeItem('project_da_notes');
    
    toast({
      title: "Projet réinitialisé",
      description: "Votre projet a été vidé",
    });
  };

  const totalPrice = 
    equipment.reduce((sum, e) => sum + e.price, 0) +
    team.reduce((sum, t) => sum + t.price, 0) +
    talents.reduce((sum, t) => sum + t.price, 0);

  const isEmpty = !studio && equipment.length === 0 && team.length === 0 && talents.length === 0 && !hasDA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Demande envoyée !",
      description: "Notre équipe vous contactera sous 24h.",
    });
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-20 min-h-[80vh] flex items-center">
          <div className="luxury-container text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-8">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-editorial mb-6">
              Demande
              <br />
              <span className="italic">envoyée !</span>
            </h1>
            <p className="text-subheadline text-muted-foreground max-w-xl mx-auto mb-8">
              Merci pour votre demande. Notre équipe reviendra vers vous dans les 24 heures
              pour discuter de votre projet et vous proposer un devis personnalisé.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/">
                <Button variant="outline" size="lg">
                  Retour à l'accueil
                </Button>
              </Link>
              <Button 
                variant="luxury" 
                size="lg"
                onClick={() => {
                  clearProject();
                  setIsSubmitted(false);
                }}
              >
                Nouveau projet
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="luxury-container text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans animate-fade-up">
            Récapitulatif
          </p>
          <h1 className="text-editorial mb-6 animate-fade-up animation-delay-100">
            Mon
            <br />
            <span className="italic">projet</span>
          </h1>
        </div>
      </section>

      {isEmpty ? (
        <section className="py-20">
          <div className="luxury-container text-center">
            <div className="max-w-md mx-auto">
              <p className="text-muted-foreground font-sans mb-8">
                Votre projet est vide. Commencez par sélectionner les éléments dont vous avez besoin.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/studios">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Building className="h-6 w-6" />
                    <span className="font-sans text-sm">Studios</span>
                  </Button>
                </Link>
                <Link to="/composer-setup">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Camera className="h-6 w-6" />
                    <span className="font-sans text-sm">Setup</span>
                  </Button>
                </Link>
                <Link to="/composer-equipe">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span className="font-sans text-sm">Équipe</span>
                  </Button>
                </Link>
                <Link to="/talents">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2">
                    <Star className="h-6 w-6" />
                    <span className="font-sans text-sm">Talents</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-8 pb-20">
          <div className="luxury-container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Project Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Studio */}
                {studio && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Studio
                      </CardTitle>
                      <Link to="/studios">
                        <Button variant="ghost" size="sm">Modifier</Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <p className="font-sans">{studio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Equipment */}
                {equipment.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Setup ({equipment.length})
                      </CardTitle>
                      <Link to="/composer-setup">
                        <Button variant="ghost" size="sm">Modifier</Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {equipment.map((item) => (
                          <li key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="font-sans">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {item.price.toLocaleString('fr-FR')} MAD
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => removeItem('equipment', item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Team */}
                {team.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Équipe ({team.length})
                      </CardTitle>
                      <Link to="/composer-equipe">
                        <Button variant="ghost" size="sm">Modifier</Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {team.map((item) => (
                          <li key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="font-sans">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {item.price.toLocaleString('fr-FR')} MAD
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => removeItem('team', item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Talents */}
                {talents.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Talents ({talents.length})
                      </CardTitle>
                      <Link to="/talents">
                        <Button variant="ghost" size="sm">Modifier</Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {talents.map((item) => (
                          <li key={item.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="font-sans">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {item.price.toLocaleString('fr-FR')} MAD
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => removeItem('talents', item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Direction Artistique */}
                {hasDA && (
                  <Card className="border-champagne">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-serif flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-champagne" />
                        Direction Artistique
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeItem('da')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    {daNotes && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground font-sans">{daNotes}</p>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Add more items */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {!studio && (
                    <Link to="/studios">
                      <Button variant="outline" size="sm">
                        <Building className="h-4 w-4 mr-2" />
                        Ajouter un studio
                      </Button>
                    </Link>
                  )}
                  <Link to="/composer-setup">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Ajouter du matériel
                    </Button>
                  </Link>
                  <Link to="/composer-equipe">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Ajouter des pros
                    </Button>
                  </Link>
                  <Link to="/talents">
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Ajouter des talents
                    </Button>
                  </Link>
                  {!hasDA && (
                    <Link to="/direction-artistique">
                      <Button variant="outline" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Direction artistique
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quote Request Form */}
              <div className="lg:col-span-1">
                <Card className="sticky top-28">
                  <CardHeader>
                    <CardTitle className="font-serif">Demander un devis</CardTitle>
                    <p className="text-sm text-muted-foreground font-sans">
                      Estimation : {totalPrice.toLocaleString('fr-FR')} MAD / jour
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                          Nom complet *
                        </Label>
                        <Input
                          value={contactForm.name}
                          onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Prénom Nom"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                          Entreprise *
                        </Label>
                        <Input
                          value={contactForm.company}
                          onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Nom de votre entreprise"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                          Email *
                        </Label>
                        <Input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@exemple.com"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                          Téléphone
                        </Label>
                        <Input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+212 6XX XXX XXX"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                          Date souhaitée
                        </Label>
                        <Input
                          type="date"
                          value={contactForm.date}
                          onChange={(e) => setContactForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">
                          Message
                        </Label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Détails supplémentaires..."
                          rows={3}
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="luxury"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Envoi en cours..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer ma demande
                          </>
                        )}
                      </Button>
                    </form>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4 text-muted-foreground"
                      onClick={clearProject}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Vider mon projet
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default MonProjet;
