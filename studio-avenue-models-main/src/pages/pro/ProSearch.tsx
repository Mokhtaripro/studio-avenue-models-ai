import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import DashboardLayout, { professionalNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Heart, Filter, X } from 'lucide-react';

const CITIES = ['Marrakech', 'Casablanca', 'Rabat', 'Agadir', 'Tanger'];
const CATEGORIES = ['Fashion', 'Beauty', 'Commercial', 'UGC', 'Fitness', 'Lingerie', 'Runway'];
const HAIR_COLORS = ['Noir', 'Brun', 'Châtain', 'Blond', 'Roux'];
const BUDGET_LEVELS = ['$', '$$', '$$$'];

interface Model {
  id: string;
  pseudo: string | null;
  age: number | null;
  height: number | null;
  hair_color: string | null;
  eye_color: string | null;
  categories: string[] | null;
  cities_available: string[] | null;
  budget_level: string | null;
  price_per_day: number | null;
  model_photos: { url: string; is_primary: boolean }[];
}

interface Filters {
  city: string;
  category: string;
  hair_color: string;
  budget_level: string;
  min_height: string;
  max_height: string;
}

export default function ProSearch() {
  const { user, loading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    city: '',
    category: '',
    hair_color: '',
    budget_level: '',
    min_height: '',
    max_height: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchModels();
    }
  }, [user]);

  const fetchModels = async () => {
    let query = supabase
      .from('model_profiles')
      .select(`
        id, pseudo, age, height, hair_color, eye_color, 
        categories, cities_available, budget_level, price_per_day,
        model_photos (url, is_primary)
      `)
      .eq('status', 'approved');

    const { data } = await query.order('created_at', { ascending: false });
    setModels(data || []);
  };

  const filteredModels = models.filter((model) => {
    if (searchQuery && !model.pseudo?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.city && !model.cities_available?.includes(filters.city)) {
      return false;
    }
    if (filters.category && !model.categories?.includes(filters.category)) {
      return false;
    }
    if (filters.hair_color && model.hair_color !== filters.hair_color) {
      return false;
    }
    if (filters.budget_level && model.budget_level !== filters.budget_level) {
      return false;
    }
    if (filters.min_height && model.height && model.height < parseInt(filters.min_height)) {
      return false;
    }
    if (filters.max_height && model.height && model.height > parseInt(filters.max_height)) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({
      city: '',
      category: '',
      hair_color: '',
      budget_level: '',
      min_height: '',
      max_height: '',
    });
    setSearchQuery('');
  };

  const getPrimaryPhoto = (photos: { url: string; is_primary: boolean }[]) => {
    return photos.find((p) => p.is_primary)?.url || photos[0]?.url;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Rechercher" navItems={professionalNavItems}>
      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom..."
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'luxury' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Ville</Label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Catégorie</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Cheveux</Label>
                <Select
                  value={filters.hair_color}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, hair_color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    {HAIR_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Budget</Label>
                <Select
                  value={filters.budget_level}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, budget_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Taille min (cm)</Label>
                <Input
                  type="number"
                  value={filters.min_height}
                  onChange={(e) => setFilters((prev) => ({ ...prev, min_height: e.target.value }))}
                  placeholder="160"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Taille max (cm)</Label>
                <Input
                  type="number"
                  value={filters.max_height}
                  onChange={(e) => setFilters((prev) => ({ ...prev, max_height: e.target.value }))}
                  placeholder="185"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4 font-sans">
        {filteredModels.length} mannequin(s) trouvé(s)
      </p>

      {/* Model Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredModels.map((model) => (
          <Card 
            key={model.id} 
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/pro/model/${model.id}`)}
          >
            <div className="aspect-[3/4] relative bg-muted">
              {model.model_photos.length > 0 ? (
                <img
                  src={getPrimaryPhoto(model.model_photos)}
                  alt={model.pseudo || 'Mannequin'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Pas de photo
                </div>
              )}
              <Button
                size="icon"
                variant="ghost"
                className={`absolute top-2 right-2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity ${
                  isFavorite(model.id) ? 'text-red-500' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(model.id);
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorite(model.id) ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-serif text-lg">{model.pseudo || 'Mannequin'}</h3>
                  <p className="text-sm text-muted-foreground font-sans">
                    {model.age && `${model.age} ans`}
                    {model.height && ` • ${model.height} cm`}
                  </p>
                </div>
                <span className="text-champagne font-medium">{model.budget_level || '$'}</span>
              </div>
              {model.categories && model.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {model.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="text-xs bg-muted px-2 py-1 rounded font-sans">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              {model.price_per_day && (
                <p className="text-sm text-muted-foreground mt-2 font-sans">
                  {model.price_per_day.toLocaleString('fr-FR')} MAD / jour
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-sans">Aucun mannequin ne correspond à vos critères.</p>
          <Button variant="link" onClick={clearFilters}>
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
