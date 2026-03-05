import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Check, Plus, Search, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Equipment {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_per_day: number | null;
  image_url: string | null;
  is_available: boolean;
}

const categories = ["Éclairage", "Fonds", "Accessoires", "Audio", "Vidéo"];

const ComposerSetup = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEquipment();
    loadSavedSelection();
  }, []);

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from('equipment_items' as any)
      .select('*')
      .eq('is_available', true)
      .order('category', { ascending: true });
    
    setEquipment((data as unknown as Equipment[]) || []);
  };

  const loadSavedSelection = () => {
    const saved = localStorage.getItem('project_equipment');
    if (saved) {
      setSelectedItems(JSON.parse(saved));
    }
  };

  const toggleItem = (id: string) => {
    const newSelection = selectedItems.includes(id)
      ? selectedItems.filter(i => i !== id)
      : [...selectedItems, id];
    
    setSelectedItems(newSelection);
    localStorage.setItem('project_equipment', JSON.stringify(newSelection));
    
    toast({
      title: selectedItems.includes(id) ? "Équipement retiré" : "Équipement ajouté",
      description: "Votre sélection a été mise à jour",
    });
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPrice = equipment
    .filter(e => selectedItems.includes(e.id))
    .reduce((sum, e) => sum + (e.price_per_day || 0), 0);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="luxury-container text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans animate-fade-up">
            Étape 2
          </p>
          <h1 className="text-editorial mb-6 animate-fade-up animation-delay-100">
            Composer votre
            <br />
            <span className="italic">setup</span>
          </h1>
          <p className="text-subheadline text-muted-foreground max-w-xl mx-auto animate-fade-up animation-delay-200">
            Sélectionnez les équipements dont vous avez besoin pour votre production.
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
                placeholder="Rechercher un équipement..."
                className="pl-10 h-12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Tous
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-16">
        <div className="luxury-container">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-sans">
                Aucun équipement disponible pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Notre catalogue sera bientôt enrichi.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedItems.includes(item.id)
                      ? "border-foreground ring-1 ring-foreground"
                      : "hover:border-muted-foreground"
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted relative">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl text-muted-foreground">📷</span>
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3" variant="secondary">
                        {item.category}
                      </Badge>
                      {selectedItems.includes(item.id) && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-background" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-sans">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-medium font-sans">
                          {item.price_per_day?.toLocaleString('fr-FR')} MAD / jour
                        </p>
                        <Button
                          size="icon"
                          variant={selectedItems.includes(item.id) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                          }}
                        >
                          {selectedItems.includes(item.id) ? (
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
      {selectedItems.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-foreground text-background px-6 py-4 rounded-full flex items-center gap-6 shadow-xl">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-sans">{selectedItems.length} équipement(s)</span>
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

export default ComposerSetup;
