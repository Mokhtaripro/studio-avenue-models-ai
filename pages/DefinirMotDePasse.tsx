import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";

const DefinirMotDePasse = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      // Check if user came from a recovery link
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        // Try to exchange the token from URL if present
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        
        if (token && type === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "recovery",
          });
          
          if (!verifyError) {
            setIsValidSession(true);
          } else {
            console.error("Token verification failed:", verifyError);
          }
        }
      }
      
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth state changes (recovery link will trigger this)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setIsValidSession(true);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const isPasswordValid = () => {
    return password.length >= 8 && password === confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Mot de passe créé !",
        description: "Vous pouvez maintenant accéder à votre espace mannequin.",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/model/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </section>
        <Footer />
      </main>
    );
  }

  if (!isValidSession && !isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-20 min-h-screen">
          <div className="luxury-container">
            <div className="max-w-md mx-auto text-center">
              <h1 className="text-headline mb-4">Lien invalide</h1>
              <p className="text-muted-foreground mb-8">
                Ce lien de réinitialisation a expiré ou est invalide. 
                Veuillez contacter l'équipe si vous avez besoin d'aide.
              </p>
              <Button variant="luxury" onClick={() => navigate("/connexion")}>
                Retour à la connexion
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-20 min-h-screen">
          <div className="luxury-container">
            <div className="max-w-md mx-auto text-center">
              <CheckCircle2 size={64} className="mx-auto mb-6 text-foreground" />
              <h1 className="text-headline mb-4">Mot de passe créé !</h1>
              <p className="text-muted-foreground mb-8">
                Redirection vers votre espace mannequin...
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-32 pb-20 min-h-screen">
        <div className="luxury-container">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12">
              <Lock size={48} className="mx-auto mb-6 text-foreground" />
              <h1 className="text-headline mb-4">Créez votre mot de passe</h1>
              <p className="text-subheadline text-muted-foreground">
                Définissez un mot de passe sécurisé pour accéder à votre espace mannequin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
              <div>
                <Label htmlFor="password" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="h-14 bg-background border-border focus:border-foreground pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre mot de passe"
                  className="h-14 bg-background border-border focus:border-foreground"
                  required
                />
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Les mots de passe ne correspondent pas</p>
              )}

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="luxury"
                  size="xl"
                  className="w-full"
                  disabled={!isPasswordValid() || isSubmitting}
                >
                  {isSubmitting ? "Création..." : "Créer mon mot de passe"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default DefinirMotDePasse;
