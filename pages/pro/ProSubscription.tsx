import DashboardLayout, { professionalNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SubscriptionInfo {
  subscription_status: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
}

export default function ProSubscription() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('professional_profiles')
      .select('subscription_status, subscription_start, subscription_end')
      .eq('user_id', user!.id)
      .single();
    
    if (data) {
      setSubscription(data);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Actif', className: 'bg-green-100 text-green-800' },
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
    expired: { label: 'Expiré', className: 'bg-red-100 text-red-800' },
  };

  return (
    <DashboardLayout title="Abonnement" navItems={professionalNavItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Votre abonnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge className={statusConfig[subscription.subscription_status || 'pending']?.className}>
                    {statusConfig[subscription.subscription_status || 'pending']?.label}
                  </Badge>
                </div>
                {subscription.subscription_start && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date de début</span>
                    <span>{format(new Date(subscription.subscription_start), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                )}
                {subscription.subscription_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date de fin</span>
                    <span>{format(new Date(subscription.subscription_end), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Chargement des informations d'abonnement...
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avantages inclus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                'Accès illimité à la base de mannequins',
                'Filtres de recherche avancés',
                'Contact direct avec les mannequins',
                'Gestion des réservations',
                'Messagerie intégrée',
                'Support prioritaire'
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
