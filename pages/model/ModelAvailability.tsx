import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { modelNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Availability {
  id: string;
  date: string;
  is_available: boolean;
  notes: string | null;
}

export default function ModelAvailability() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modelId, setModelId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchModelAndAvailability();
    }
  }, [user]);

  const fetchModelAndAvailability = async () => {
    const { data: profile } = await supabase
      .from('model_profiles')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (profile) {
      setModelId(profile.id);
      const { data: availabilityData } = await supabase
        .from('model_availability')
        .select('*')
        .eq('model_id', profile.id);
      setAvailability(availabilityData || []);
      
      const unavailableDates = (availabilityData || [])
        .filter((a) => !a.is_available)
        .map((a) => new Date(a.date));
      setSelectedDates(unavailableDates);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !modelId) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = availability.find((a) => a.date === dateStr);

    if (existing) {
      // Toggle availability
      const newAvailable = !existing.is_available;
      await supabase
        .from('model_availability')
        .update({ is_available: newAvailable })
        .eq('id', existing.id);
    } else {
      // Create new unavailable entry
      await supabase
        .from('model_availability')
        .insert({
          model_id: modelId,
          date: dateStr,
          is_available: false,
        });
    }

    fetchModelAndAvailability();
    toast({
      title: 'Disponibilité mise à jour',
      description: `${format(date, 'dd MMMM yyyy', { locale: fr })}`,
    });
  };

  const handleMarkAvailable = async () => {
    if (!modelId || selectedDates.length === 0) return;

    for (const date of selectedDates) {
      const dateStr = format(date, 'yyyy-MM-dd');
      await supabase
        .from('model_availability')
        .delete()
        .eq('model_id', modelId)
        .eq('date', dateStr);
    }

    fetchModelAndAvailability();
    toast({
      title: 'Dates marquées comme disponibles',
      description: `${selectedDates.length} dates mises à jour`,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const unavailableDates = availability
    .filter((a) => !a.is_available)
    .map((a) => new Date(a.date));

  return (
    <DashboardLayout title="Mes Disponibilités" navItems={modelNavItems}>
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Calendrier</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              onDayClick={handleDateSelect}
              locale={fr}
              modifiers={{
                unavailable: unavailableDates,
              }}
              modifiersStyles={{
                unavailable: {
                  backgroundColor: 'hsl(var(--destructive))',
                  color: 'hsl(var(--destructive-foreground))',
                },
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm font-sans">
              <p className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-destructive"></span>
                <span className="text-muted-foreground">Dates indisponibles</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-background border"></span>
                <span className="text-muted-foreground">Dates disponibles</span>
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-4 font-sans">
                Cliquez sur une date pour basculer sa disponibilité. Les dates marquées en rouge
                sont indisponibles pour les réservations.
              </p>
              
              {selectedDates.length > 0 && (
                <Button variant="luxuryOutline" onClick={handleMarkAvailable}>
                  Marquer {selectedDates.length} date(s) comme disponible(s)
                </Button>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 font-sans">Prochaines indisponibilités</h4>
              {unavailableDates.length === 0 ? (
                <p className="text-sm text-muted-foreground font-sans">
                  Aucune date bloquée
                </p>
              ) : (
                <ul className="space-y-2">
                  {unavailableDates
                    .filter((d) => d >= new Date())
                    .sort((a, b) => a.getTime() - b.getTime())
                    .slice(0, 5)
                    .map((date) => (
                      <li key={date.toISOString()} className="text-sm font-sans">
                        {format(date, 'EEEE dd MMMM yyyy', { locale: fr })}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
