import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { agencyNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Check, X, Star, Eye } from 'lucide-react';

interface Model {
  id: string;
  user_id: string;
  pseudo: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  status: string;
  is_featured: boolean;
  budget_level: string | null;
  price_per_day: number | null;
  created_at: string;
  verification_photo_url: string | null;
  model_photos: { url: string; is_primary: boolean }[];
}

export default function AgencyModels() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [editData, setEditData] = useState({ budget_level: '', price_per_day: '' });

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
      fetchModels();
    }
  }, [user, role]);

  const fetchModels = async () => {
    const { data } = await supabase
      .from('model_profiles')
      .select(`
        *,
        model_photos (url, is_primary)
      `)
      .order('created_at', { ascending: false });

    setModels(data || []);
  };

  const handleStatusChange = async (modelId: string, newStatus: string) => {
    const { error } = await supabase
      .from('model_profiles')
      .update({ status: newStatus })
      .eq('id', modelId);

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
      return;
    }

    // Send approval/rejection email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-model-approval-email', {
        body: {
          modelProfileId: modelId,
          approved: newStatus === 'approved',
        },
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({ 
          title: 'Attention', 
          description: 'Statut mis à jour mais l\'email n\'a pas pu être envoyé',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Succès', 
          description: newStatus === 'approved' 
            ? 'Mannequin approuvé, email envoyé avec lien de connexion' 
            : 'Mannequin refusé, email de notification envoyé' 
        });
      }
    } catch (err) {
      console.error('Email function error:', err);
      toast({ title: 'Statut mis à jour', description: 'Email non envoyé' });
    }

    fetchModels();
  };

  const handleToggleFeatured = async (modelId: string, currentFeatured: boolean) => {
    const { error } = await supabase
      .from('model_profiles')
      .update({ is_featured: !currentFeatured })
      .eq('id', modelId);

    if (!error) {
      toast({ title: 'Succès', description: currentFeatured ? 'Retiré de la page d\'accueil' : 'Ajouté à la page d\'accueil' });
      fetchModels();
    }
  };

  const handleSavePricing = async () => {
    if (!selectedModel) return;

    const { error } = await supabase
      .from('model_profiles')
      .update({
        budget_level: editData.budget_level || selectedModel.budget_level,
        price_per_day: editData.price_per_day ? parseFloat(editData.price_per_day) : selectedModel.price_per_day,
      })
      .eq('id', selectedModel.id);

    if (!error) {
      toast({ title: 'Succès', description: 'Tarification mise à jour' });
      setSelectedModel(null);
      fetchModels();
    }
  };

  const getPrimaryPhoto = (photos: { url: string; is_primary: boolean }[]) => {
    return photos.find((p) => p.is_primary)?.url || photos[0]?.url;
  };

  const filteredModels = models.filter((model) => {
    if (searchQuery && !model.pseudo?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && model.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-champagne/20 text-champagne-foreground' },
    approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800' },
    suspended: { label: 'Suspendu', className: 'bg-gray-100 text-gray-800' },
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Gestion des Mannequins" navItems={agencyNavItems}>
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
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Refusés</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Models Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wider font-sans">
                  <th className="p-4">Mannequin</th>
                  <th className="p-4">Info</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Tarif</th>
                  <th className="p-4">Vedette</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded bg-muted overflow-hidden">
                          {model.model_photos.length > 0 ? (
                            <img
                              src={getPrimaryPhoto(model.model_photos)}
                              alt={model.pseudo || 'Model'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              N/A
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium font-sans">{model.pseudo || 'Sans nom'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(model.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-sans">
                      {model.age && `${model.age} ans`}
                      {model.height && ` • ${model.height} cm`}
                      {model.gender && ` • ${model.gender}`}
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[model.status]?.className}>
                        {statusConfig[model.status]?.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-champagne font-medium">{model.budget_level || '-'}</span>
                      {model.price_per_day && (
                        <p className="text-xs text-muted-foreground">
                          {model.price_per_day.toLocaleString('fr-FR')} MAD/j
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        size="icon"
                        variant={model.is_featured ? 'default' : 'ghost'}
                        className={model.is_featured ? 'bg-champagne hover:bg-champagne/90' : ''}
                        onClick={() => handleToggleFeatured(model.id, model.is_featured)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {model.status === 'pending' && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleStatusChange(model.id, 'approved')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusChange(model.id, 'rejected')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedModel(model);
                            setEditData({
                              budget_level: model.budget_level || '',
                              price_per_day: model.price_per_day?.toString() || '',
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
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
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">{selectedModel?.pseudo || 'Mannequin'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Niveau de budget</Label>
              <Select
                value={editData.budget_level}
                onValueChange={(value) => setEditData((prev) => ({ ...prev, budget_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Économique</SelectItem>
                  <SelectItem value="$$">$$ - Standard</SelectItem>
                  <SelectItem value="$$$">$$$ - Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block font-sans">Prix par jour (MAD)</Label>
              <Input
                type="number"
                value={editData.price_per_day}
                onChange={(e) => setEditData((prev) => ({ ...prev, price_per_day: e.target.value }))}
                placeholder="1500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedModel(null)}>Annuler</Button>
            <Button variant="luxury" onClick={handleSavePricing}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
