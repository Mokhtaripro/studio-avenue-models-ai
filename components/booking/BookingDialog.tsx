import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROJECT_TYPES = ['Fashion', 'Beauty', 'Commercial', 'UGC', 'Fitness', 'Lingerie', 'Runway', 'Autre'];
const CITIES = ['Marrakech', 'Casablanca', 'Rabat', 'Agadir', 'Tanger'];

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: string;
  modelName: string;
}

export default function BookingDialog({ open, onOpenChange, modelId, modelName }: BookingDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_type: '',
    project_description: '',
    location: '',
    budget_proposed: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
  });

  useEffect(() => {
    if (user) {
      fetchProfessionalId();
    }
  }, [user]);

  const fetchProfessionalId = async () => {
    const { data } = await supabase
      .from('professional_profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setProfessionalId(data.id);
    }
  };

  const handleSubmit = async () => {
    if (!professionalId || !formData.start_date || !formData.end_date || !formData.project_type) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('bookings')
      .insert({
        model_id: modelId,
        professional_id: professionalId,
        project_type: formData.project_type,
        project_description: formData.project_description,
        location: formData.location,
        budget_proposed: formData.budget_proposed ? parseFloat(formData.budget_proposed) : null,
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(formData.end_date, 'yyyy-MM-dd'),
        status: 'pending'
      });

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la réservation',
        variant: 'destructive'
      });
    } else {
      // Create notification for the model
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('user_id')
        .eq('id', modelId)
        .single();

      if (modelProfile) {
        await supabase.from('notifications').insert({
          user_id: modelProfile.user_id,
          type: 'booking_request',
          title: 'Nouvelle demande de réservation',
          message: `Vous avez reçu une nouvelle demande de réservation pour ${formData.project_type}`,
          link: '/model/bookings'
        });
      }

      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de réservation a été envoyée avec succès'
      });
      onOpenChange(false);
      setFormData({
        project_type: '',
        project_description: '',
        location: '',
        budget_proposed: '',
        start_date: undefined,
        end_date: undefined,
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Réserver {modelName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.start_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'dd MMM yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    disabled={(date) => date < new Date()}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.end_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, 'dd MMM yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                    disabled={(date) => date < (formData.start_date || new Date())}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type de projet *</Label>
            <Select
              value={formData.project_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lieu</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une ville" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Budget proposé (MAD)</Label>
            <Input
              type="number"
              value={formData.budget_proposed}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_proposed: e.target.value }))}
              placeholder="Ex: 5000"
            />
          </div>

          <div className="space-y-2">
            <Label>Description du projet</Label>
            <Textarea
              value={formData.project_description}
              onChange={(e) => setFormData(prev => ({ ...prev, project_description: e.target.value }))}
              placeholder="Décrivez votre projet..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
