import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Check, Plus, Search, ShoppingCart, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Model {
  id: string;
  pseudo: string | null;
  gender: string | null;
  height: number | null;
  cities_available: string[] | null;
  categories: string[] | null;
  budget_level: string | null;
  price_per_day: number | null;
  primary_photo?: string | null;
}

const cities = ["Marrakech", "Casablanca", "Rabat", "Agadir", "Tanger"];
const categories = ["Fashion", "Beauty", "Commercial", "Editorial", "UGC"];

const Talents = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("models");
  const { toast } = useToast();

  useEffect(() => {
    fetchModels();
    loadSavedSelection();
  }, []);

  const fetchModels = async () => {
    const { data } = await supabase
      .from('model_profiles')
      .select('id, pseudo, gender, height, cities_available, categories, budget_level, price_per_day')
      .eq('status', 'approved');
    
    // Fetch primary photos
    if (data) {
      const modelsWithPhotos = await Promise.all(
        data.map(async (model) => {
          const { data: photos } = await supabase
            .from('model_photos')
            .select('url')
            .eq('model_id', model.id)
            .eq('is_primary', true)
            .limit(1);
          
          return {
            ...model,
            primary_photo: photos?.[0]?.url || null,
          };
        })
      );
      setModels(modelsWithPhotos);
    }
  };

  const loadSavedSelection = () => {
    const saved = localStorage.getItem('project_talents');
    if (saved) {
      setSelectedModels(JSON.parse(saved));
    }
  };

  const toggleModel = (id: string) => {
    const newSelection = selectedModels.includes(id)
      ? selectedModels.filter(i => i !== id)
      : [...selectedModels, id];
    
    setSelectedModels(newSelection);
    localStorage.setItem('project_talents', JSON.stringify(newSelection));
    
    toast({
      title: selectedModels.includes(id) ? "Talent retiré" : "Talent ajouté",
      description: "Votre sélection a été mise à jour",
    });
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = !searchQuery || 
      model.pseudo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || 
      model.cities_available?.includes(selectedCity);
    const matchesCategory = selectedCategory === "all" || 
      model.categories?.includes(selectedCategory);
    return matchesSearch && matchesCity && matchesCategory;
  });

  const budgetDisplay = (level: string | null) => {
    switch (level) {
      case '$': return '€';
      case '$$': return '€€';
      case '$$$': return '€€€';
      default: return '€';
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="luxury-container text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans animate-fade-up">
            Étape 4
          </p>
          <h1 className="text-editorial mb-6 animate-fade-up animation-delay-100">
            Choisir vos
            <br />
            <span className="italic">talents</span>
          </h1>
          <p className="text-subheadline text-muted-foreground max-w-xl mx-auto animate-fade-up animation-delay-200">
            Sélectionnez les models et créateurs UGC pour votre projet.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 border-y border-border bg-secondary">
        <div className="luxury-container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <TabsList className="bg-background">
                <TabsTrigger value="models" className="px-6">Models</TabsTrigger>
                <TabsTrigger value="ugc" className="px-6">UGC Creators</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-10 h-10"
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="models" className="mt-0">
              {/* Content rendered below */}
            </TabsContent>
            <TabsContent value="ugc" className="mt-0">
              {/* Content rendered below */}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Talents Grid */}
      <section className="py-16">
        <div className="luxury-container">
          {filteredModels.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-sans">
                Aucun talent disponible avec ces critères.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Essayez de modifier vos filtres.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModels.map((model) => (
                <Card
                  key={model.id}
                  className={`group cursor-pointer transition-all duration-300 ${
                    selectedModels.includes(model.id)
                      ? "border-foreground ring-1 ring-foreground"
                      : "hover:border-muted-foreground"
                  }`}
                  onClick={() => toggleModel(model.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {model.primary_photo ? (
                        <img
                          src={model.primary_photo}
                          alt={model.pseudo || 'Model'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <span className="text-5xl">👤</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary">{budgetDisplay(model.budget_level)}</Badge>
                      </div>
                      {selectedModels.includes(model.id) && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-background" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif text-lg">{model.pseudo || 'Model'}</h3>
                        {model.height && (
                          <span className="text-sm text-muted-foreground font-sans">{model.height} cm</span>
                        )}
                      </div>
                      {model.cities_available && model.cities_available.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          <span>{model.cities_available.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                      {model.categories && model.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {model.categories.slice(0, 3).map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-medium font-sans text-sm">
                          {model.price_per_day?.toLocaleString('fr-FR')} MAD / jour
                        </p>
                        <Button
                          size="icon"
                          variant={selectedModels.includes(model.id) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModel(model.id);
                          }}
                        >
                          {selectedModels.includes(model.id) ? (
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
      {selectedModels.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-foreground text-background px-6 py-4 rounded-full flex items-center gap-6 shadow-xl">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-sans">{selectedModels.length} talent(s)</span>
            </div>
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

export default Talents;
