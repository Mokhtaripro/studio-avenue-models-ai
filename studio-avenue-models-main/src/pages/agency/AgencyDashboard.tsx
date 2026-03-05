import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { agencyNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Stats {
  totalModels: number;
  pendingModels: number;
  approvedModels: number;
  totalProfessionals: number;
  pendingProfessionals: number;
  activeProfessionals: number;
  pendingBookings: number;
  confirmedBookings: number;
}

interface PendingItem {
  id: string;
  name: string;
  type: 'model' | 'professional';
  created_at: string;
}

export default function AgencyDashboard() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalModels: 0,
    pendingModels: 0,
    approvedModels: 0,
    totalProfessionals: 0,
    pendingProfessionals: 0,
    activeProfessionals: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

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
      fetchStats();
      fetchPendingItems();
    }
  }, [user, role]);

  const fetchStats = async () => {
    // Models
    const { count: totalModels } = await supabase
      .from('model_profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingModels } = await supabase
      .from('model_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { count: approvedModels } = await supabase
      .from('model_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Professionals
    const { count: totalProfessionals } = await supabase
      .from('professional_profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingProfessionals } = await supabase
      .from('professional_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'pending');
    
    const { count: activeProfessionals } = await supabase
      .from('professional_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    // Bookings
    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { count: confirmedBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    setStats({
      totalModels: totalModels || 0,
      pendingModels: pendingModels || 0,
      approvedModels: approvedModels || 0,
      totalProfessionals: totalProfessionals || 0,
      pendingProfessionals: pendingProfessionals || 0,
      activeProfessionals: activeProfessionals || 0,
      pendingBookings: pendingBookings || 0,
      confirmedBookings: confirmedBookings || 0,
    });
  };

  const fetchPendingItems = async () => {
    const items: PendingItem[] = [];

    // Pending models
    const { data: models } = await supabase
      .from('model_profiles')
      .select('id, pseudo, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    models?.forEach((m) => {
      items.push({
        id: m.id,
        name: m.pseudo || 'Mannequin',
        type: 'model',
        created_at: m.created_at,
      });
    });

    // Pending professionals
    const { data: pros } = await supabase
      .from('professional_profiles')
      .select('id, company_name, created_at')
      .eq('subscription_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    pros?.forEach((p) => {
      items.push({
        id: p.id,
        name: p.company_name,
        type: 'professional',
        created_at: p.created_at,
      });
    });

    // Sort by date
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPendingItems(items.slice(0, 10));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Administration" navItems={agencyNavItems}>
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Mannequins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{stats.totalModels}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">{stats.approvedModels} approuvés</span>
              <span className="text-xs text-champagne">{stats.pendingModels} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Professionnels</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{stats.totalProfessionals}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">{stats.activeProfessionals} actifs</span>
              <span className="text-xs text-champagne">{stats.pendingProfessionals} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Réservations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{stats.pendingBookings + stats.confirmedBookings}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-green-600">{stats.confirmedBookings} confirmées</span>
              <span className="text-xs text-champagne">{stats.pendingBookings} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Actions requises</CardTitle>
            <AlertCircle className="h-4 w-4 text-champagne" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif text-champagne">
              {stats.pendingModels + stats.pendingProfessionals + stats.pendingBookings}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Validations en attente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Validations */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Validations en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingItems.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-sans">Aucune validation en attente</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium font-sans">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {item.type === 'model' ? 'Mannequin' : 'Professionnel'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="luxuryOutline"
                        onClick={() => navigate(item.type === 'model' ? '/agency/models' : '/agency/professionals')}
                      >
                        Voir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="luxuryOutline"
              className="w-full justify-start"
              onClick={() => navigate('/agency/models')}
            >
              <Users className="h-4 w-4 mr-3" />
              Gérer les mannequins
              {stats.pendingModels > 0 && (
                <Badge className="ml-auto bg-champagne text-champagne-foreground">
                  {stats.pendingModels}
                </Badge>
              )}
            </Button>
            <Button
              variant="luxuryOutline"
              className="w-full justify-start"
              onClick={() => navigate('/agency/professionals')}
            >
              <Building className="h-4 w-4 mr-3" />
              Gérer les professionnels
              {stats.pendingProfessionals > 0 && (
                <Badge className="ml-auto bg-champagne text-champagne-foreground">
                  {stats.pendingProfessionals}
                </Badge>
              )}
            </Button>
            <Button
              variant="luxuryOutline"
              className="w-full justify-start"
              onClick={() => navigate('/agency/bookings')}
            >
              <FileText className="h-4 w-4 mr-3" />
              Gérer les réservations
              {stats.pendingBookings > 0 && (
                <Badge className="ml-auto bg-champagne text-champagne-foreground">
                  {stats.pendingBookings}
                </Badge>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
