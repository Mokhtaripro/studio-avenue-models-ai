import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { agencyNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Eye, MessageSquare, Check, X } from 'lucide-react';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  project_type: string | null;
  project_description: string | null;
  location: string | null;
  budget_proposed: number | null;
  final_price: number | null;
  agency_notes: string | null;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  model_profiles: {
    pseudo: string | null;
    user_id: string;
  } | null;
  professional_profiles: {
    company_name: string;
    user_id: string;
  } | null;
}

export default function AgencyBookings() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editData, setEditData] = useState({ status: '', final_price: '', agency_notes: '' });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; booking: Booking | null; reason: string }>({
    open: false,
    booking: null,
    reason: ''
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
      fetchBookings();
    }
  }, [user, role]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        model_profiles (pseudo, user_id),
        professional_profiles (company_name, user_id)
      `)
      .order('created_at', { ascending: false });

    setBookings((data as any) || []);
  };

  const handleSaveBooking = async () => {
    if (!selectedBooking) return;

    const updates: Record<string, unknown> = {};
    if (editData.status) updates.status = editData.status;
    if (editData.final_price) updates.final_price = parseFloat(editData.final_price);
    if (editData.agency_notes) updates.agency_notes = editData.agency_notes;

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', selectedBooking.id);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour la réservation', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Réservation mise à jour' });
      setSelectedBooking(null);
      fetchBookings();
    }
  };

  const handleApprove = async (booking: Booking) => {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed', 
        approved_at: new Date().toISOString(),
        approved_by: user?.id 
      })
      .eq('id', booking.id);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'approuver la réservation', variant: 'destructive' });
      return;
    }

    // Send notifications to model and professional
    const notifications = [];
    
    if (booking.model_profiles?.user_id) {
      notifications.push({
        user_id: booking.model_profiles.user_id,
        type: 'booking_approved',
        title: 'Réservation confirmée',
        message: `Votre réservation avec ${booking.professional_profiles?.company_name || 'un client'} a été confirmée.`,
        link: '/model/bookings'
      });
    }
    
    if (booking.professional_profiles?.user_id) {
      notifications.push({
        user_id: booking.professional_profiles.user_id,
        type: 'booking_approved',
        title: 'Réservation confirmée',
        message: `Votre réservation avec ${booking.model_profiles?.pseudo || 'un model'} a été confirmée.`,
        link: '/pro/bookings'
      });
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    toast({ title: 'Succès', description: 'Réservation approuvée et notifications envoyées' });
    fetchBookings();
  };

  const handleReject = async () => {
    if (!rejectDialog.booking) return;

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled', 
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectDialog.reason || 'Refusé par l\'agence'
      })
      .eq('id', rejectDialog.booking.id);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de refuser la réservation', variant: 'destructive' });
      return;
    }

    // Send notifications
    const notifications = [];
    const booking = rejectDialog.booking;
    
    if (booking.model_profiles?.user_id) {
      notifications.push({
        user_id: booking.model_profiles.user_id,
        type: 'booking_rejected',
        title: 'Réservation annulée',
        message: `Votre réservation a été annulée. ${rejectDialog.reason ? `Motif: ${rejectDialog.reason}` : ''}`,
        link: '/model/bookings'
      });
    }
    
    if (booking.professional_profiles?.user_id) {
      notifications.push({
        user_id: booking.professional_profiles.user_id,
        type: 'booking_rejected',
        title: 'Réservation annulée',
        message: `Votre réservation a été annulée. ${rejectDialog.reason ? `Motif: ${rejectDialog.reason}` : ''}`,
        link: '/pro/bookings'
      });
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }

    toast({ title: 'Réservation refusée', description: 'Les parties ont été notifiées' });
    setRejectDialog({ open: false, booking: null, reason: '' });
    fetchBookings();
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && 
      !booking.model_profiles?.pseudo?.toLowerCase().includes(searchLower) &&
      !booking.professional_profiles?.company_name.toLowerCase().includes(searchLower)) {
      return false;
    }
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-champagne/20 text-champagne-foreground' },
    quoted: { label: 'Devis envoyé', className: 'bg-blue-100 text-blue-800' },
    confirmed: { label: 'Confirmé', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Terminé', className: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800' },
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Gestion des Réservations" navItems={agencyNavItems}>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
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
            <SelectItem value="quoted">Devis envoyé</SelectItem>
            <SelectItem value="confirmed">Confirmés</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
            <SelectItem value="cancelled">Annulés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wider font-sans">
                  <th className="p-4">Mannequin</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Projet</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30">
                    <td className="p-4 font-medium font-sans">
                      {booking.model_profiles?.pseudo || 'Mannequin'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-sans">
                      {booking.professional_profiles?.company_name || 'Client'}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-sans text-sm">{booking.project_type || 'Projet'}</p>
                        {booking.location && (
                          <p className="text-xs text-muted-foreground">{booking.location}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-sans">
                      {format(new Date(booking.start_date), 'dd MMM', { locale: fr })} - {format(new Date(booking.end_date), 'dd MMM', { locale: fr })}
                    </td>
                    <td className="p-4">
                      {booking.final_price ? (
                        <span className="font-medium text-green-600">
                          {booking.final_price.toLocaleString('fr-FR')} MAD
                        </span>
                      ) : booking.budget_proposed ? (
                        <span className="text-muted-foreground">
                          {booking.budget_proposed.toLocaleString('fr-FR')} MAD
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[booking.status]?.className}>
                        {statusConfig[booking.status]?.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(booking)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectDialog({ open: true, booking, reason: '' })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Refuser
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setEditData({
                              status: booking.status,
                              final_price: booking.final_price?.toString() || '',
                              agency_notes: booking.agency_notes || '',
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-sans">Mannequin</p>
                  <p className="font-medium">{selectedBooking.model_profiles?.pseudo || 'Mannequin'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-sans">Client</p>
                  <p className="font-medium">{selectedBooking.professional_profiles?.company_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-sans">Dates</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.start_date), 'dd/MM/yyyy')} - {format(new Date(selectedBooking.end_date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-sans">Lieu</p>
                  <p className="font-medium">{selectedBooking.location || '-'}</p>
                </div>
              </div>

              {selectedBooking.project_description && (
                <div>
                  <p className="text-muted-foreground font-sans text-sm">Description du projet</p>
                  <p className="text-sm">{selectedBooking.project_description}</p>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Statut</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="quoted">Devis envoyé</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Prix final (MAD)</Label>
                  <Input
                    type="number"
                    value={editData.final_price}
                    onChange={(e) => setEditData((prev) => ({ ...prev, final_price: e.target.value }))}
                    placeholder={selectedBooking.budget_proposed?.toString() || 'Montant'}
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Notes internes</Label>
                  <Textarea
                    value={editData.agency_notes}
                    onChange={(e) => setEditData((prev) => ({ ...prev, agency_notes: e.target.value }))}
                    placeholder="Notes visibles uniquement par l'agence..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>Annuler</Button>
            <Button variant="luxury" onClick={handleSaveBooking}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, booking: null, reason: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action annulera la réservation et notifiera le model et le professionnel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Motif du refus (optionnel)</Label>
            <Textarea
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Expliquez la raison du refus..."
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmer le refus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
