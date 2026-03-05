import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import DevenirModel from "./pages/DevenirModel";
import UGCCreators from "./pages/UGCCreators";
import AccesPro from "./pages/AccesPro";
import Studios from "./pages/Studios";
import ComposerSetup from "./pages/ComposerSetup";
import ComposerEquipe from "./pages/ComposerEquipe";
import Talents from "./pages/Talents";
import DirectionArtistique from "./pages/DirectionArtistique";
import MonProjet from "./pages/MonProjet";
import Connexion from "./pages/Connexion";
import DefinirMotDePasse from "./pages/DefinirMotDePasse";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import NotFound from "./pages/NotFound";

// Dashboard imports
import ModelDashboard from "./pages/model/ModelDashboard";
import ModelProfile from "./pages/model/ModelProfile";
import ModelPhotos from "./pages/model/ModelPhotos";
import ModelAvailability from "./pages/model/ModelAvailability";
import ModelBookings from "./pages/model/ModelBookings";
import ModelMessages from "./pages/model/ModelMessages";
import ModelSettings from "./pages/model/ModelSettings";
import ProDashboard from "./pages/pro/ProDashboard";
import ProSearch from "./pages/pro/ProSearch";
import ProBookings from "./pages/pro/ProBookings";
import ProFavorites from "./pages/pro/ProFavorites";
import ProMessages from "./pages/pro/ProMessages";
import ProSubscription from "./pages/pro/ProSubscription";
import ProSettings from "./pages/pro/ProSettings";
import ModelProfilePage from "./pages/pro/ModelProfilePage";
import AgencyDashboard from "./pages/agency/AgencyDashboard";
import AgencyAnalytics from "./pages/agency/AgencyAnalytics";
import AgencyModels from "./pages/agency/AgencyModels";
import AgencyProfessionals from "./pages/agency/AgencyProfessionals";
import AgencyBookings from "./pages/agency/AgencyBookings";
import AgencyMessages from "./pages/agency/AgencyMessages";
import AgencySettings from "./pages/agency/AgencySettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/devenir-model" element={<DevenirModel />} />
            <Route path="/devenir-mannequin" element={<DevenirModel />} />
            <Route path="/ugc-creators" element={<UGCCreators />} />
            <Route path="/acces-pro" element={<AccesPro />} />
            <Route path="/studios" element={<Studios />} />
            <Route path="/composer-setup" element={<ComposerSetup />} />
            <Route path="/composer-equipe" element={<ComposerEquipe />} />
            <Route path="/talents" element={<Talents />} />
            <Route path="/direction-artistique" element={<DirectionArtistique />} />
            <Route path="/mon-projet" element={<MonProjet />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/definir-mot-de-passe" element={<DefinirMotDePasse />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
            
            {/* Model Dashboard Routes */}
            <Route path="/model/dashboard" element={<ModelDashboard />} />
            <Route path="/model/profile" element={<ModelProfile />} />
            <Route path="/model/photos" element={<ModelPhotos />} />
            <Route path="/model/availability" element={<ModelAvailability />} />
            <Route path="/model/bookings" element={<ModelBookings />} />
            <Route path="/model/messages" element={<ModelMessages />} />
            <Route path="/model/settings" element={<ModelSettings />} />
            
            {/* Professional Dashboard Routes */}
            <Route path="/pro/dashboard" element={<ProDashboard />} />
            <Route path="/pro/search" element={<ProSearch />} />
            <Route path="/pro/bookings" element={<ProBookings />} />
            <Route path="/pro/favorites" element={<ProFavorites />} />
            <Route path="/pro/messages" element={<ProMessages />} />
            <Route path="/pro/subscription" element={<ProSubscription />} />
            <Route path="/pro/settings" element={<ProSettings />} />
            <Route path="/pro/model/:id" element={<ModelProfilePage />} />
            
            {/* Agency Dashboard Routes */}
            <Route path="/agency/dashboard" element={<AgencyDashboard />} />
            <Route path="/agency/analytics" element={<AgencyAnalytics />} />
            <Route path="/agency/models" element={<AgencyModels />} />
            <Route path="/agency/professionals" element={<AgencyProfessionals />} />
            <Route path="/agency/bookings" element={<AgencyBookings />} />
            <Route path="/agency/messages" element={<AgencyMessages />} />
            <Route path="/agency/settings" element={<AgencySettings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
