import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { modelNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  type: string;
  is_primary: boolean;
}

export default function ModelPhotos() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<'polaroid' | 'portfolio' | 'professional'>('portfolio');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchModelAndPhotos();
    }
  }, [user]);

  const fetchModelAndPhotos = async () => {
    const { data: profile } = await supabase
      .from('model_profiles')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (profile) {
      setModelId(profile.id);
      const { data: photosData } = await supabase
        .from('model_photos')
        .select('*')
        .eq('model_id', profile.id)
        .order('created_at', { ascending: false });
      setPhotos(photosData || []);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !modelId) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('model-photos')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: 'Erreur',
          description: `Impossible d'uploader ${file.name}`,
          variant: 'destructive',
        });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('model-photos')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('model_photos')
        .insert({
          model_id: modelId,
          url: urlData.publicUrl,
          type: selectedType,
          is_primary: photos.length === 0,
        });

      if (insertError) {
        toast({
          title: 'Erreur',
          description: 'Impossible de sauvegarder la photo',
          variant: 'destructive',
        });
      }
    }

    setIsUploading(false);
    fetchModelAndPhotos();
    toast({
      title: 'Succès',
      description: 'Photos uploadées avec succès',
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photo: Photo) => {
    const fileName = photo.url.split('/').pop();
    if (!fileName) return;

    await supabase.storage
      .from('model-photos')
      .remove([`${user!.id}/${fileName}`]);

    await supabase
      .from('model_photos')
      .delete()
      .eq('id', photo.id);

    fetchModelAndPhotos();
    toast({
      title: 'Photo supprimée',
      description: 'La photo a été supprimée avec succès.',
    });
  };

  const handleSetPrimary = async (photoId: string) => {
    await supabase
      .from('model_photos')
      .update({ is_primary: false })
      .eq('model_id', modelId);

    await supabase
      .from('model_photos')
      .update({ is_primary: true })
      .eq('id', photoId);

    fetchModelAndPhotos();
    toast({
      title: 'Photo principale définie',
      description: 'Cette photo sera affichée en premier sur votre profil.',
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const photosByType = {
    polaroid: photos.filter((p) => p.type === 'polaroid'),
    portfolio: photos.filter((p) => p.type === 'portfolio'),
    professional: photos.filter((p) => p.type === 'professional'),
  };

  return (
    <DashboardLayout title="Mes Photos" navItems={modelNavItems}>
      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-serif">Ajouter des photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {(['polaroid', 'portfolio', 'professional'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'luxury' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type === 'polaroid' && 'Polaroid'}
                  {type === 'portfolio' && 'Portfolio'}
                  {type === 'professional' && 'Professionnel'}
                </Button>
              ))}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="luxuryOutline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Upload en cours...' : 'Sélectionner des photos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Sections */}
      {(['polaroid', 'portfolio', 'professional'] as const).map((type) => (
        <Card key={type} className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif capitalize">
              {type === 'polaroid' && 'Photos Polaroid'}
              {type === 'portfolio' && 'Photos Portfolio'}
              {type === 'professional' && 'Photos Professionnelles'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {photosByType[type].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p className="font-sans">Aucune photo dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photosByType[type].map((photo) => (
                  <div key={photo.id} className="relative group aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                    <img
                      src={photo.url}
                      alt="Photo mannequin"
                      className="w-full h-full object-cover"
                    />
                    {photo.is_primary && (
                      <div className="absolute top-2 left-2 bg-champagne text-champagne-foreground px-2 py-1 rounded text-xs font-sans">
                        Photo principale
                      </div>
                    )}
                    <div className="absolute inset-0 bg-noir/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.is_primary && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => handleSetPrimary(photo.id)}
                        >
                          <Star className="h-5 w-5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => handleDelete(photo)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </DashboardLayout>
  );
}
