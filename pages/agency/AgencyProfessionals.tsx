import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { agencyNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Check, X, ExternalLink } from 'lucide-react';

interface Professional {
  id: string;
  user_id: string;
  company_name: string;
  company_type: string | null;
  siret: string | null;
  website: string | null;
  payment_method: string | null;
  subscription_status: string;
  subscription_start: string | null;
  subscription_end: string | null;
  created_at: string;
}

export default function AgencyProfessionals() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
    if (!loading && role !== 'admin') {
      navigate('/');
    }
  }, [user, loading, role, navigate]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchProfessionals();
    }
  }, [user, role]);

  const fetchProfessionals = async () => {
    const { data } = await supabase
      .from('professional_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setProfessionals(data || []);
  };

  const handleStatusChange = async (proId: string, userId: string, newStatus: string) => {
    const updates: Record<string, unknown> = { subscription_status: newStatus };
    
    if (newStatus === 'active') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      updates.subscription_start = startDate.toISOString().split('T')[0];
      updates.subscription_end = endDate.toISOString().split('T')[0];
    }

    const { error } = await supabase
      .from('professional_profiles')
      .update(updates)
      .eq('id', proId);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
    } else {
      // Add role if activated
      if (newStatus === 'active') {
        await supabase.from('user_roles').upsert({
          user_id: userId,
          role: 'professional',
        });
      }
      toast({ title: 'Succès', description: 'Statut mis à jour' });
      fetchProfessionals();
    }
  };

  const filteredProfessionals = professionals.filter((pro) => {
    if (searchQuery && !pro.company_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && pro.subscription_status !== statusFilter) {
      return false;
    }
    return true;
  });

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-champagne/20 text-champagne-foreground' },
    active: { label: 'Actif', className: 'bg-green-100 text-green-800' },
    expired: { label: 'Expiré', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Annulé', className: 'bg-gray-100 text-gray-800' },
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Gestion des Professionnels" navItems={agencyNavItems}>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une entreprise..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="expired">Expirés</SelectItem>
            <SelectItem value="cancelled">Annulés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Professionals Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wider font-sans">
                  <th className="p-4">Entreprise</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">SIRET</th>
                  <th className="p-4">Paiement</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Abonnement</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProfessionals.map((pro) => (
                  <tr key={pro.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium font-sans">{pro.company_name}</p>
                        {pro.website && (
                          <a
                            href={pro.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            {pro.website.replace(/^https?:\/\//, '')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-sans">
                      {pro.company_type || '-'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-sans">
                      {pro.siret || '-'}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">
                        {pro.payment_method === 'online' && 'En ligne'}
                        {pro.payment_method === 'transfer' && 'Virement'}
                        {pro.payment_method === 'cash' && 'Espèces'}
                        {!pro.payment_method && '-'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[pro.subscription_status]?.className}>
                        {statusConfig[pro.subscription_status]?.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-sans">
                      {pro.subscription_end ? (
                        <span>
                          Jusqu'au {new Date(pro.subscription_end).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {pro.subscription_status === 'pending' && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleStatusChange(pro.id, pro.user_id, 'active')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusChange(pro.id, pro.user_id, 'cancelled')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {pro.subscription_status === 'expired' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(pro.id, pro.user_id, 'active')}
                          >
                            Renouveler
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
