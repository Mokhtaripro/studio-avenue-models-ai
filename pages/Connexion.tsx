import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Connexion = () => {
  const { user, signIn, signUp, role } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      if (role === 'admin') navigate('/agency/dashboard');
      else if (role === 'professional') navigate('/pro/dashboard');
      else if (role === 'model') navigate('/model/dashboard');
      else navigate('/');
    }
  }, [user, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur StudioAvenue.",
      });
    }

    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await signUp(signupData.email, signupData.password);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Compte créé",
        description: "Vous pouvez maintenant vous connecter.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="luxury-container w-full">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <h1 className="text-headline mb-4">Bienvenue</h1>
              <p className="text-subheadline text-muted-foreground">
                Connectez-vous ou créez votre compte
              </p>
            </div>

            <div className="animate-fade-up animation-delay-100">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted h-14">
                  <TabsTrigger
                    value="login"
                    className="text-xs uppercase tracking-[0.15em] h-full data-[state=active]:bg-background font-sans"
                  >
                    Connexion
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="text-xs uppercase tracking-[0.15em] h-full data-[state=active]:bg-background font-sans"
                  >
                    Inscription
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label
                        htmlFor="login-email"
                        className="text-xs uppercase tracking-wider mb-2 block font-sans"
                      >
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="votre@email.com"
                        className="h-14 bg-background border-border focus:border-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="login-password"
                        className="text-xs uppercase tracking-wider mb-2 block font-sans"
                      >
                        Mot de passe
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="h-14 bg-background border-border focus:border-foreground"
                        required
                      />
                    </div>
                    <div className="text-right">
                      <Link
                        to="/mot-de-passe-oublie"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <Button
                      type="submit"
                      variant="luxury"
                      size="xl"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                      <Label
                        htmlFor="signup-email"
                        className="text-xs uppercase tracking-wider mb-2 block font-sans"
                      >
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="votre@email.com"
                        className="h-14 bg-background border-border focus:border-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="signup-password"
                        className="text-xs uppercase tracking-wider mb-2 block font-sans"
                      >
                        Mot de passe
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="h-14 bg-background border-border focus:border-foreground"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="signup-confirm"
                        className="text-xs uppercase tracking-wider mb-2 block font-sans"
                      >
                        Confirmer le mot de passe
                      </Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="h-14 bg-background border-border focus:border-foreground"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="luxury"
                      size="xl"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Création..." : "Créer mon compte"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center font-sans">
                      En créant un compte, vous acceptez nos{" "}
                      <Link
                        to="/conditions"
                        className="underline hover:text-foreground"
                      >
                        conditions d'utilisation
                      </Link>
                      .
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            {/* Separator */}
            <div className="mt-12 pt-8 border-t border-border text-center animate-fade-up animation-delay-200">
              <p className="text-sm text-muted-foreground mb-4 font-sans">
                Vous souhaitez devenir model ?
              </p>
              <Link to="/devenir-model">
                <Button variant="luxuryOutline" size="lg">
                  Inscription Model
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Connexion;
