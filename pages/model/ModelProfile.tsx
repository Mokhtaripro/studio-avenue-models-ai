import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { modelNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CITIES = ['Marrakech', 'Casablanca', 'Rabat', 'Agadir', 'Tanger'];
const CATEGORIES = ['Fashion', 'Beauty', 'Commercial', 'UGC', 'Fitness', 'Lingerie', 'Runway'];
const HAIR_COLORS = ['Noir', 'Brun', 'Châtain', 'Blond', 'Roux', 'Autre'];
const EYE_COLORS = ['Noir', 'Marron', 'Vert', 'Bleu', 'Gris', 'Noisette'];

interface ProfileFormData {
  pseudo: string;
  age: number | null;
  gender: string;
  height: number | null;
  weight: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoe_size: number | null;
  hair_color: string;
  eye_color: string;
  nationality: string;
  languages: string[];
  categories: string[];
  cities_available: string[];
  bio: string;
}

export default function ModelProfile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    pseudo: '',
    age: null,
    gender: '',
    height: null,
    weight: null,
    bust: null,
    waist: null,
    hips: null,
    shoe_size: null,
    hair_color: '',
    eye_color: '',
    nationality: '',
    languages: [],
    categories: [],
    cities_available: [],
    bio: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('model_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setProfileId(data.id);
      setFormData({
        pseudo: data.pseudo || '',
        age: data.age,
        gender: data.gender || '',
        height: data.height,
        weight: data.weight,
        bust: data.bust,
        waist: data.waist,
        hips: data.hips,
        shoe_size: data.shoe_size,
        hair_color: data.hair_color || '',
        eye_color: data.eye_color || '',
        nationality: data.nationality || '',
        languages: data.languages || [],
        categories: data.categories || [],
        cities_available: data.cities_available || [],
        bio: data.bio || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('model_profiles')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès.',
      });
    }
  };

  const handleArrayChange = (field: keyof ProfileFormData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Mon Profil" navItems={modelNavItems}>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Informations de base</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Pseudo</Label>
              <Input
                value={formData.pseudo}
                onChange={(e) => setFormData((prev) => ({ ...prev, pseudo: e.target.value }))}
                placeholder="Votre pseudo"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Âge</Label>
              <Input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: parseInt(e.target.value) || null }))}
                min={18}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Genre</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="non-binary">Non-binaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Nationalité</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData((prev) => ({ ...prev, nationality: e.target.value }))}
                placeholder="Ex: Marocaine"
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Mensurations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-4">
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Taille (cm)</Label>
              <Input
                type="number"
                value={formData.height || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, height: parseInt(e.target.value) || null }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Poids (kg)</Label>
              <Input
                type="number"
                value={formData.weight || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight: parseInt(e.target.value) || null }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Tour de poitrine</Label>
              <Input
                type="number"
                value={formData.bust || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, bust: parseInt(e.target.value) || null }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Tour de taille</Label>
              <Input
                type="number"
                value={formData.waist || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, waist: parseInt(e.target.value) || null }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Tour de hanches</Label>
              <Input
                type="number"
                value={formData.hips || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, hips: parseInt(e.target.value) || null }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Pointure</Label>
              <Input
                type="number"
                value={formData.shoe_size || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, shoe_size: parseInt(e.target.value) || null }))}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Couleur des cheveux</Label>
              <Select
                value={formData.hair_color}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, hair_color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {HAIR_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Couleur des yeux</Label>
              <Select
                value={formData.eye_color}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, eye_color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {EYE_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categories & Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Catégories & Disponibilité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-xs uppercase tracking-wider mb-3 block font-sans">Catégories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={formData.categories.includes(category) ? 'luxury' : 'outline'}
                    size="sm"
                    onClick={() => handleArrayChange('categories', category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-3 block font-sans">Villes disponibles</Label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <Button
                    key={city}
                    type="button"
                    variant={formData.cities_available.includes(city) ? 'luxury' : 'outline'}
                    size="sm"
                    onClick={() => handleArrayChange('cities_available', city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Biographie</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Parlez-nous de vous, de votre expérience..."
              rows={5}
            />
          </CardContent>
        </Card>

        <Button type="submit" variant="luxury" size="xl" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </DashboardLayout>
  );
}
