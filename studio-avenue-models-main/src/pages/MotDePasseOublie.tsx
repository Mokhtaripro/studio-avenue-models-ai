import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const MotDePasseOublie = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/definir-mot-de-passe`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-32 pb-20 min-h-screen flex items-center">
          <div className="luxury-container w-full">
            <div className="max-w-md mx-auto text-center animate-fade-up">
              <CheckCircle2 size={64} className="mx-auto mb-6 text-foreground" />
              <h1 className="text-headline mb-4">Email envoyé !</h1>
              <p className="text-muted-foreground mb-8">
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                N'oubliez pas de vérifier vos spams si vous ne trouvez pas l'email.
              </p>
              <Link to="/connexion">
                <Button variant="luxury" size="lg">
                  <ArrowLeft size={18} />
                  Retour à la connexion
                </Button>
              </Link>
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
      
      <section className="pt-32 pb-20 min-h-screen flex items-center">
        <div className="luxury-container w-full">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-12 animate-fade-up">
              <Mail size={48} className="mx-auto mb-6 text-foreground" />
              <h1 className="text-headline mb-4">Mot de passe oublié</h1>
              <p className="text-subheadline text-muted-foreground">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up animation-delay-100">
              <div>
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-wider mb-2 block font-sans"
                >
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
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
                {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>

              <div className="text-center">
                <Link
                  to="/connexion"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
                >
                  <ArrowLeft size={16} />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default MotDePasseOublie;
