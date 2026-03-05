import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import DashboardLayout, { professionalNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MapPin, Ruler, Calendar as CalendarIcon, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BookingDialog from '@/components/booking/BookingDialog';

interface ModelProfile {
  id: string;
  pseudo: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoe_size: number | null;
  hair_color: string | null;
  eye_color: string | null;
  nationality: string | null;
  languages: string[] | null;
  categories: string[] | null;
  cities_available: string[] | null;
  bio: string | null;
  budget_level: string | null;
  price_per_day: number | null;
  model_photos: { id: string; url: string; type: string | null; is_primary: boolean }[];
}

interface Availability {
  date: string;
  is_available: boolean;
}

export default function ModelProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchModel();
      fetchAvailability();
    }
  }, [id, user]);

  const fetchModel = async () => {
    const { data } = await supabase
      .from('model_profiles')
      .select(`
        id, pseudo, age, gender, height, weight, bust, waist, hips, shoe_size,
        hair_color, eye_color, nationality, languages, categories, cities_available,
        bio, budget_level, price_per_day,
        model_photos(id, url, type, is_primary)
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (data) {
      setModel(data);
      const primaryIndex = data.model_photos.findIndex(p => p.is_primary);
      if (primaryIndex > -1) setSelectedPhotoIndex(primaryIndex);
    }
  };

  const fetchAvailability = async () => {
    const { data } = await supabase
      .from('model_availability')
      .select('date, is_available')
      .eq('model_id', id)
      .gte('date', new Date().toISOString().split('T')[0]);

    if (data) {
      setAvailability(data);
    }
  };

  const getUnavailableDates = () => {
    return availability
      .filter(a => !a.is_available)
      .map(a => new Date(a.date));
  };

  const groupPhotosByType = () => {
    if (!model?.model_photos) return {};
    return model.model_photos.reduce((acc, photo) => {
      const type = photo.type || 'portfolio';
      if (!acc[type]) acc[type] = [];
      acc[type].push(photo);
      return acc;
    }, {} as Record<string, typeof model.model_photos>);
  };

  if (loading || !model) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  const photosByType = groupPhotosByType();
  const allPhotos = model.model_photos || [];

  return (
    <DashboardLayout title="Profil Mannequin" navItems={professionalNavItems}>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-[4/5] relative bg-muted">
              {allPhotos.length > 0 ? (
                <>
                  <img
                    src={allPhotos[selectedPhotoIndex]?.url}
                    alt={model.pseudo || 'Mannequin'}
                    className="w-full h-full object-cover"
                  />
                  {allPhotos.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                        onClick={() => setSelectedPhotoIndex(prev => 
                          prev === 0 ? allPhotos.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                        onClick={() => setSelectedPhotoIndex(prev => 
                          prev === allPhotos.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Pas de photo
                </div>
              )}
            </div>
          </Card>

          {/* Thumbnails by type */}
          {Object.entries(photosByType).map(([type, photos]) => (
            <div key={type}>
              <h3 className="text-sm font-medium mb-2 capitalize">{type}</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => {
                  const globalIndex = allPhotos.findIndex(p => p.id === photo.id);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(globalIndex)}
                      className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                        globalIndex === selectedPhotoIndex ? 'border-foreground' : 'border-transparent'
                      }`}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-serif">{model.pseudo || 'Anonyme'}</h1>
                  <p className="text-muted-foreground">
                    {model.age && `${model.age} ans`}
                    {model.nationality && ` • ${model.nationality}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(model.id)}
                  className={isFavorite(model.id) ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(model.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {model.budget_level && (
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-lg">{model.budget_level}</Badge>
                  {model.price_per_day && (
                    <span className="text-muted-foreground">
                      {model.price_per_day.toLocaleString('fr-FR')} MAD / jour
                    </span>
                  )}
                </div>
              )}

              <Button className="w-full" onClick={() => setShowBookingDialog(true)}>
                Demander une réservation
              </Button>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Mensurations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {model.height && (
                  <div>
                    <span className="text-muted-foreground">Taille</span>
                    <p className="font-medium">{model.height} cm</p>
                  </div>
                )}
                {model.weight && (
                  <div>
                    <span className="text-muted-foreground">Poids</span>
                    <p className="font-medium">{model.weight} kg</p>
                  </div>
                )}
                {model.bust && (
                  <div>
                    <span className="text-muted-foreground">Poitrine</span>
                    <p className="font-medium">{model.bust} cm</p>
                  </div>
                )}
                {model.waist && (
                  <div>
                    <span className="text-muted-foreground">Taille</span>
                    <p className="font-medium">{model.waist} cm</p>
                  </div>
                )}
                {model.hips && (
                  <div>
                    <span className="text-muted-foreground">Hanches</span>
                    <p className="font-medium">{model.hips} cm</p>
                  </div>
                )}
                {model.shoe_size && (
                  <div>
                    <span className="text-muted-foreground">Pointure</span>
                    <p className="font-medium">{model.shoe_size}</p>
                  </div>
                )}
                {model.hair_color && (
                  <div>
                    <span className="text-muted-foreground">Cheveux</span>
                    <p className="font-medium">{model.hair_color}</p>
                  </div>
                )}
                {model.eye_color && (
                  <div>
                    <span className="text-muted-foreground">Yeux</span>
                    <p className="font-medium">{model.eye_color}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories & Cities */}
          {(model.categories?.length || model.cities_available?.length) && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {model.categories && model.categories.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Catégories</p>
                    <div className="flex flex-wrap gap-1">
                      {model.categories.map(cat => (
                        <Badge key={cat} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {model.cities_available && model.cities_available.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Disponible à
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {model.cities_available.map(city => (
                        <Badge key={city} variant="secondary">{city}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {model.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{model.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Availability Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Disponibilités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                disabled={getUnavailableDates()}
                locale={fr}
                className="rounded-md border"
                modifiers={{
                  unavailable: getUnavailableDates()
                }}
                modifiersClassNames={{
                  unavailable: 'line-through text-muted-foreground opacity-50'
                }}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Les dates barrées ne sont pas disponibles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        modelId={model.id}
        modelName={model.pseudo || 'Mannequin'}
      />
    </DashboardLayout>
  );
}
