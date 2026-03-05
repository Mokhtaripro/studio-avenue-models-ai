import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { agencyNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Users, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Analytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  completedBookings: number;
  conversionRate: number;
  averageBookingValue: number;
  modelsByStatus: { status: string; count: number }[];
  modelsByCity: { city: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByMonth: { month: string; bookings: number }[];
  topModels: { pseudo: string; bookings: number; revenue: number }[];
}

const COLORS = ['hsl(var(--foreground))', 'hsl(var(--muted-foreground))', 'hsl(var(--champagne))', 'hsl(var(--accent))'];

export default function AgencyAnalytics() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    conversionRate: 0,
    averageBookingValue: 0,
    modelsByStatus: [],
    modelsByCity: [],
    revenueByMonth: [],
    bookingsByMonth: [],
    topModels: [],
  });

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
      fetchAnalytics();
    }
  }, [user, role]);

  const fetchAnalytics = async () => {
    // Fetch all bookings for revenue calculation
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, model_profiles(pseudo)');

    // Calculate revenue metrics
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.final_price || 0), 0) || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'completed') || [];
    
    // Monthly revenue (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyBookings = bookings?.filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    }) || [];
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.final_price || 0), 0);

    // Conversion rate
    const conversionRate = bookings?.length ? (confirmedBookings.length / bookings.length) * 100 : 0;
    
    // Average booking value
    const averageBookingValue = completedBookings.length ? totalRevenue / completedBookings.length : 0;

    // Models by status
    const { data: models } = await supabase.from('model_profiles').select('status, cities_available');
    const statusCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    
    models?.forEach(m => {
      statusCounts[m.status || 'pending'] = (statusCounts[m.status || 'pending'] || 0) + 1;
      if (m.cities_available) {
        m.cities_available.forEach((city: string) => {
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        });
      }
    });

    const modelsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
    const modelsByCity = Object.entries(cityCounts).map(([city, count]) => ({ city, count })).slice(0, 5);

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number }[] = [];
    const bookingsByMonth: { month: string; bookings: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      const monthBookings = bookings?.filter(b => {
        const bd = new Date(b.created_at);
        return bd.getMonth() === date.getMonth() && bd.getFullYear() === date.getFullYear();
      }) || [];
      
      revenueByMonth.push({
        month: monthName,
        revenue: monthBookings.reduce((sum, b) => sum + (b.final_price || 0), 0),
      });
      bookingsByMonth.push({
        month: monthName,
        bookings: monthBookings.length,
      });
    }

    // Top models by bookings
    const modelBookingCounts: Record<string, { pseudo: string; bookings: number; revenue: number }> = {};
    bookings?.forEach(b => {
      const modelId = b.model_id;
      const pseudo = b.model_profiles?.pseudo || 'Model';
      if (!modelBookingCounts[modelId]) {
        modelBookingCounts[modelId] = { pseudo, bookings: 0, revenue: 0 };
      }
      modelBookingCounts[modelId].bookings++;
      modelBookingCounts[modelId].revenue += b.final_price || 0;
    });
    
    const topModels = Object.values(modelBookingCounts)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    setAnalytics({
      totalRevenue,
      monthlyRevenue,
      totalBookings: bookings?.length || 0,
      completedBookings: completedBookings.length,
      conversionRate,
      averageBookingValue,
      modelsByStatus,
      modelsByCity,
      revenueByMonth,
      bookingsByMonth,
      topModels,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Analytics" navItems={agencyNavItems}>
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{analytics.totalRevenue.toLocaleString('fr-FR')} MAD</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ce mois: {analytics.monthlyRevenue.toLocaleString('fr-FR')} MAD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Réservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{analytics.totalBookings}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.completedBookings} terminées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{analytics.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Demandes → Confirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Panier moyen</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{analytics.averageBookingValue.toLocaleString('fr-FR')} MAD</p>
            <p className="text-xs text-muted-foreground mt-1">
              Par réservation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('fr-FR')} MAD`, 'Revenus']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--foreground))" 
                    fill="hsl(var(--muted))" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Réservations par mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.bookingsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Models by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Users className="h-5 w-5" />
              Models par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.modelsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                    label={({ status }) => status}
                  >
                    {analytics.modelsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Models by City */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Models par ville</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analytics.modelsByCity.map((item, index) => (
                <li key={item.city} className="flex items-center justify-between">
                  <span className="font-sans text-sm">{item.city}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 rounded-full bg-foreground"
                      style={{ width: `${Math.min(item.count * 10, 100)}px` }}
                    />
                    <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Top Models */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Top Models</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analytics.topModels.map((model, index) => (
                <li key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium font-sans">{model.pseudo}</p>
                    <p className="text-xs text-muted-foreground">{model.bookings} réservations</p>
                  </div>
                  <p className="font-medium text-green-600">
                    {model.revenue.toLocaleString('fr-FR')} MAD
                  </p>
                </li>
              ))}
              {analytics.topModels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune donnée disponible
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
