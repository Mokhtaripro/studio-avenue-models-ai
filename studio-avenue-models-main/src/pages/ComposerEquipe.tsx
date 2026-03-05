import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Check, Plus, Search, ShoppingCart, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string | null;
  bio: string | null;
  photo_url: string | null;
  price_per_day: number | null;
  cities_available: string[] | null;
  is_available: boolean;
}

const roles = ["Photographe", "Vidéaste", "Maquilleur", "Styliste", "Coiffeur", "Assistant"];

const ComposerEquipe = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    loadSavedSelection();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('team_members' as any)
      .select('*')
      .eq('is_available', true)
      .order('role', { ascending: true });
    
    setMembers((data as unknown as TeamMember[]) || []);
  };

  const loadSavedSelection = () => {
    const saved = localStorage.getItem('project_team');
    if (saved) {
      setSelectedMembers(JSON.parse(saved));
    }
  };

  const toggleMember = (id: string) => {
    const newSelection = selectedMembers.includes(id)
      ? selectedMembers.filter(i => i !== id)
      : [...selectedMembers, id];
    
    setSelectedMembers(newSelection);
    localStorage.setItem('project_team', JSON.stringify(newSelection));
    
    toast({
      title: selectedMembers.includes(id) ? "Membre retiré" : "Membre ajouté",
      description: "Votre équipe a été mise à jour",
    });
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchQuery || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPrice = members
    .filter(m => selectedMembers.includes(m.id))
    .reduce((sum, m) => sum + (m.price_per_day || 0), 0);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="luxury-container text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans animate-fade-up">
            Étape 3
          </p>
          <h1 className="text-editorial mb-6 animate-fade-up animation-delay-100">
            Composer votre
            <br />
            <span className="italic">équipe</span>
          </h1>
          <p className="text-subheadline text-muted-foreground max-w-xl mx-auto animate-fade-up animation-delay-200">
            Sélectionnez les professionnels qui feront partie de votre projet.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-border bg-secondary">
        <div className="luxury-container">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un professionnel..."
                className="pl-10 h-12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRole === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(null)}
              >
                Tous
              </Button>
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="luxury-container">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-sans">
                Aucun professionnel disponible pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Notre équipe sera bientôt enrichie.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedMembers.includes(member.id)
                      ? "border-foreground ring-1 ring-foreground"
                      : "hover:border-muted-foreground"
                  }`}
                  onClick={() => toggleMember(member.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <span className="text-5xl">👤</span>
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3" variant="secondary">
                        {member.role}
                      </Badge>
                      {selectedMembers.includes(member.id) && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-background" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg mb-1">{member.name}</h3>
                      {member.specialty && (
                        <p className="text-sm text-muted-foreground mb-2 font-sans">
                          {member.specialty}
                        </p>
                      )}
                      {member.cities_available && member.cities_available.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{member.cities_available.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-medium font-sans">
                          {member.price_per_day?.toLocaleString('fr-FR')} MAD / jour
                        </p>
                        <Button
                          size="icon"
                          variant={selectedMembers.includes(member.id) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMember(member.id);
                          }}
                        >
                          {selectedMembers.includes(member.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart */}
      {selectedMembers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-foreground text-background px-6 py-4 rounded-full flex items-center gap-6 shadow-xl">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-sans">{selectedMembers.length} professionnel(s)</span>
            </div>
            <div className="h-6 w-px bg-background/20" />
            <span className="font-medium">{totalPrice.toLocaleString('fr-FR')} MAD / jour</span>
            <Link to="/mon-projet">
              <Button variant="secondary" size="sm">
                Voir mon projet
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
};

export default ComposerEquipe;
