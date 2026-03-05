import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/notifications/NotificationBell';
import { 
  User, 
  Camera, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  Search,
  Heart,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
}

export default function DashboardLayout({ children, title, navItems }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/connexion');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-border px-6">
            <Link to="/" className="font-serif text-xl tracking-wide">
              StudioAvenue
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-sans transition-colors",
                  location.pathname === item.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate font-sans">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-8">
          <h1 className="text-2xl font-serif">{title}</h1>
          <NotificationBell />
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export const modelNavItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/model/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Mon Profil', href: '/model/profile', icon: <User className="h-4 w-4" /> },
  { label: 'Photos', href: '/model/photos', icon: <Camera className="h-4 w-4" /> },
  { label: 'Disponibilités', href: '/model/availability', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Réservations', href: '/model/bookings', icon: <FileText className="h-4 w-4" /> },
  { label: 'Messages', href: '/model/messages', icon: <MessageSquare className="h-4 w-4" /> },
  { label: 'Paramètres', href: '/model/settings', icon: <Settings className="h-4 w-4" /> },
];

export const professionalNavItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/pro/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Rechercher', href: '/pro/search', icon: <Search className="h-4 w-4" /> },
  { label: 'Favoris', href: '/pro/favorites', icon: <Heart className="h-4 w-4" /> },
  { label: 'Réservations', href: '/pro/bookings', icon: <FileText className="h-4 w-4" /> },
  { label: 'Messages', href: '/pro/messages', icon: <MessageSquare className="h-4 w-4" /> },
  { label: 'Abonnement', href: '/pro/subscription', icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Paramètres', href: '/pro/settings', icon: <Settings className="h-4 w-4" /> },
];

export const agencyNavItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/agency/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Analytics', href: '/agency/analytics', icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Models', href: '/agency/models', icon: <Users className="h-4 w-4" /> },
  { label: 'Professionnels', href: '/agency/professionals', icon: <Building className="h-4 w-4" /> },
  { label: 'Réservations', href: '/agency/bookings', icon: <FileText className="h-4 w-4" /> },
  { label: 'Messages', href: '/agency/messages', icon: <MessageSquare className="h-4 w-4" /> },
  { label: 'Paramètres', href: '/agency/settings', icon: <Settings className="h-4 w-4" /> },
];
