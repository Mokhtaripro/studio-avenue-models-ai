import { useState, useEffect } from 'react';
import DashboardLayout, { professionalNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, MapPin, Ruler } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FavoriteModel {
  id: string;
  model_id: string;
  model_profiles: {
    id: string;
    pseudo: string | null;
    age: number | null;
    height: number | null;
    cities_available: string[] | null;
    categories: string[] | null;
    budget_level: string | null;
    model_photos: { url: string; is_primary: boolean }[];
  };
}

export default function ProFavorites() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteModel[]>([]);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfessionalAndFavorites();
    }
  }, [user]);

  const fetchProfessionalAndFavorites = async () => {
    const { data: profile } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (profile) {
      setProfessionalId(profile.id);
      
      const { data: favs } = await supabase
        .from('professional_favorites')
        .select(`
          id,
          model_id,
          model_profiles(
            id,
            pseudo,
            age,
            height,
            cities_available,
            categories,
            budget_level,
            model_photos(url, is_primary)
          )
        `)
        .eq('professional_id', profile.id);

      if (favs) {
        setFavorites(favs as unknown as FavoriteModel[]);
      }
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from('professional_favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer ce favori',
        variant: 'destructive'
      });
    } else {
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: 'Favori supprimé',
        description: 'Le mannequin a été retiré de vos favoris'
      });
    }
  };

  const getPrimaryPhoto = (photos: { url: string; is_primary: boolean }[]) => {
    if (!photos || photos.length === 0) return null;
    const primary = photos.find(p => p.is_primary);
    return primary?.url || photos[0]?.url;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Favoris" navItems={professionalNavItems}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Vos mannequins favoris ({favorites.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucun favori pour le moment.
              </p>
              <Button onClick={() => navigate('/pro/search')}>
                Rechercher des mannequins
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => {
                const model = favorite.model_profiles;
                const photo = getPrimaryPhoto(model?.model_photos || []);

                return (
                  <Card key={favorite.id} className="overflow-hidden group">
                    <div className="aspect-[3/4] relative bg-muted">
                      {photo ? (
                        <img
                          src={photo}
                          alt={model?.pseudo || 'Mannequin'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Pas de photo
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg">{model?.pseudo || 'Anonyme'}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {model?.age && <span>{model.age} ans</span>}
                        {model?.height && (
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            {model.height} cm
                          </span>
                        )}
                      </div>
                      {model?.cities_available && model.cities_available.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <MapPin className="h-3 w-3" />
                          {model.cities_available.slice(0, 2).join(', ')}
                        </div>
                      )}
                      {model?.budget_level && (
                        <Badge variant="secondary" className="mt-2">
                          {model.budget_level}
                        </Badge>
                      )}
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => navigate('/pro/search')}
                      >
                        Voir le profil
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
