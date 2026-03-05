import { useState } from 'react';
import DashboardLayout, { professionalNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import ConversationList from '@/components/messaging/ConversationList';
import MessageThread from '@/components/messaging/MessageThread';

export default function ProMessages() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Messages" navItems={professionalNavItems}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConversationList
              userType="professional"
              onSelectBooking={setSelectedBookingId}
              selectedBookingId={selectedBookingId || undefined}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedBookingId ? 'Discussion' : 'Sélectionnez une conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedBookingId ? (
              <MessageThread
                bookingId={selectedBookingId}
                currentUserType="professional"
              />
            ) : (
              <p className="text-center text-muted-foreground py-16">
                Sélectionnez une conversation pour voir les messages
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
