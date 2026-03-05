import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        .select('model_id')
        .eq('professional_id', profile.id);

      if (favs) {
        setFavorites(new Set(favs.map(f => f.model_id)));
      }
    }
    setLoading(false);
  };

  const toggleFavorite = async (modelId: string) => {
    if (!professionalId) return;

    const isFavorite = favorites.has(modelId);

    if (isFavorite) {
      const { error } = await supabase
        .from('professional_favorites')
        .delete()
        .eq('professional_id', professionalId)
        .eq('model_id', modelId);

      if (!error) {
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(modelId);
          return next;
        });
        toast({
          title: 'Favori retiré',
          description: 'Le mannequin a été retiré de vos favoris'
        });
      }
    } else {
      const { error } = await supabase
        .from('professional_favorites')
        .insert({
          professional_id: professionalId,
          model_id: modelId
        });

      if (!error) {
        setFavorites(prev => new Set(prev).add(modelId));
        toast({
          title: 'Favori ajouté',
          description: 'Le mannequin a été ajouté à vos favoris'
        });
      }
    }
  };

  const isFavorite = (modelId: string) => favorites.has(modelId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  };
}
