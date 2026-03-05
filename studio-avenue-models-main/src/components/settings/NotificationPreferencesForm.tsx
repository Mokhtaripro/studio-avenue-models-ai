import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  email_new_booking: boolean;
  email_booking_update: boolean;
  email_new_message: boolean;
  email_marketing: boolean;
}

export default function NotificationPreferencesForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_new_booking: true,
    email_booking_update: true,
    email_new_message: true,
    email_marketing: false
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setPreferences({
        email_new_booking: data.email_new_booking ?? true,
        email_booking_update: data.email_booking_update ?? true,
        email_new_message: data.email_new_message ?? true,
        email_marketing: data.email_marketing ?? false
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    let error;

    if (existing) {
      const result = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', user!.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user!.id,
          ...preferences
        });
      error = result.error;
    }

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les préférences',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Préférences sauvegardées',
        description: 'Vos préférences de notification ont été mises à jour'
      });
    }

    setLoading(false);
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email_new_booking" className="text-base">Nouvelles réservations</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir un email pour chaque nouvelle demande de réservation
            </p>
          </div>
          <Switch
            id="email_new_booking"
            checked={preferences.email_new_booking}
            onCheckedChange={() => togglePreference('email_new_booking')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email_booking_update" className="text-base">Mises à jour de réservation</Label>
            <p className="text-sm text-muted-foreground">
              Être notifié des changements de statut de vos réservations
            </p>
          </div>
          <Switch
            id="email_booking_update"
            checked={preferences.email_booking_update}
            onCheckedChange={() => togglePreference('email_booking_update')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email_new_message" className="text-base">Nouveaux messages</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir un email quand vous avez un nouveau message
            </p>
          </div>
          <Switch
            id="email_new_message"
            checked={preferences.email_new_message}
            onCheckedChange={() => togglePreference('email_new_message')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email_marketing" className="text-base">Communications marketing</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des offres spéciales et actualités de StudioAvenue
            </p>
          </div>
          <Switch
            id="email_marketing"
            checked={preferences.email_marketing}
            onCheckedChange={() => togglePreference('email_marketing')}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
      </Button>
    </div>
  );
}
