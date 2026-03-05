import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ArrowRight, ArrowLeft, Video, Camera, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WebcamCapture from "@/components/webcam/WebcamCapture";
import ProfileAssistant from "@/components/ai/ProfileAssistant";

const cities = ["Marrakech", "Casablanca", "Rabat", "Agadir", "Tanger"];

const benefits = [
  "Collaborations avec des marques premium",
  "Shooting photos & vidéos professionnels",
  "Accompagnement créatif personnalisé",
  "Rémunération attractive",
  "Réseau de marques exclusives",
];

const UGCCreators = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    city: "",
    age: "",
    gender: "",
    instagram: "",
    tiktok: "",
  });
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = () => {
    const age = parseInt(formData.age);
    return (
      formData.firstName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.city !== "" &&
      formData.age !== "" &&
      age >= 18
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(formData.age);
    
    if (age < 18) {
      toast({
        title: "Âge minimum requis",
        description: "Vous devez avoir au moins 18 ans pour vous inscrire.",
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };

  const handlePhotoCapture = (blob: Blob) => {
    setCapturedPhoto(blob);
    setCapturedPhotoUrl(URL.createObjectURL(blob));
    toast({
      title: "Photo capturée",
      description: "Votre photo de vérification a été enregistrée.",
    });
  };

  const handleRetakePhoto = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhoto(null);
    setCapturedPhotoUrl(null);
  };

  const handleFinalSubmit = async () => {
    if (!capturedPhoto) {
      toast({
        title: "Photo requise",
        description: "Veuillez prendre une photo de vérification.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tempPassword = crypto.randomUUID();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/connexion`,
          data: {
            first_name: formData.firstName,
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast({
            title: "Email déjà utilisé",
            description: "Cet email est déjà associé à un compte. Veuillez vous connecter.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Échec de la création du compte");
      }

      const userId = authData.user.id;

      const photoFileName = `${userId}/verification-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("model-photos")
        .upload(photoFileName, capturedPhoto, {
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
      }

      const { data: publicUrlData } = supabase.storage
        .from("model-photos")
        .getPublicUrl(photoFileName);

      const verificationPhotoUrl = publicUrlData?.publicUrl || null;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          email: formData.email,
          phone: formData.phone || null,
          city: formData.city,
        })
        .eq("user_id", userId);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      const { error: modelError } = await supabase
        .from("model_profiles")
        .insert({
          user_id: userId,
          pseudo: formData.firstName,
          age: parseInt(formData.age),
          gender: formData.gender || null,
          cities_available: [formData.city],
          verification_photo_url: verificationPhotoUrl,
          status: "pending",
          categories: ["UGC"],
        });

      if (modelError) {
        console.error("Model profile error:", modelError);
        throw modelError;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "model" as const,
        });

      if (roleError) {
        console.error("Role error:", roleError);
      }

      await supabase.auth.signOut();

      toast({
        title: "Inscription réussie !",
        description: "Votre candidature est en cours d'examen. Nous vous contacterons sous 48h.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="luxury-container">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Video className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-sans">
                UGC Creators
              </p>
            </div>
            <h1 className="text-editorial mb-6">
              Devenez créateur
              <br />
              <span className="italic">UGC</span>
            </h1>
            <p className="text-subheadline text-muted-foreground max-w-xl mx-auto">
              Rejoignez notre réseau de créateurs et collaborez avec les plus grandes marques du Maroc.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-16">
        <div className="luxury-container">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-6 bg-secondary border border-border animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Sparkles className="w-6 h-6 mb-4 text-muted-foreground" />
                <p className="text-sm font-sans">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-20">
        <div className="luxury-container">
          <div className="max-w-xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
                  step >= 1
                    ? "border-foreground bg-foreground text-background"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {step > 1 ? <CheckCircle2 size={18} /> : "1"}
              </div>
              <div
                className={`w-16 h-px ${
                  step >= 2 ? "bg-foreground" : "bg-muted"
                }`}
              />
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
                  step >= 2
                    ? "border-foreground bg-foreground text-background"
                    : "border-muted text-muted-foreground"
                }`}
              >
                2
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-sans">
                Étape {step} sur 2
              </p>
              <h2 className="text-headline mb-4">
                {step === 1 ? "Vos informations" : "Vérification d'identité"}
              </h2>
              <p className="text-subheadline text-muted-foreground">
                {step === 1
                  ? "Quelques informations pour commencer"
                  : "Une photo rapide pour valider votre identité"}
              </p>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6 animate-fade-up">
                <div>
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                    Prénom ou pseudo *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Votre prénom"
                    className="h-14 bg-background border-border focus:border-foreground"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="votre@email.com"
                      className="h-14 bg-background border-border focus:border-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      className="h-14 bg-background border-border focus:border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                    Ville *
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleInputChange("city", value)}
                  >
                    <SelectTrigger className="h-14 bg-background border-border">
                      <SelectValue placeholder="Sélectionnez votre ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Âge * (18+)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="99"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="18"
                      className="h-14 bg-background border-border focus:border-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Genre (optionnel)
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger className="h-14 bg-background border-border">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      Instagram (optionnel)
                    </Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      placeholder="@votre_compte"
                      className="h-14 bg-background border-border focus:border-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok" className="text-xs uppercase tracking-wider mb-2 block font-sans">
                      TikTok (optionnel)
                    </Label>
                    <Input
                      id="tiktok"
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange("tiktok", e.target.value)}
                      placeholder="@votre_compte"
                      className="h-14 bg-background border-border focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    variant="luxury"
                    size="xl"
                    className="w-full"
                    disabled={!isStep1Valid()}
                  >
                    Continuer
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Photo Verification */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-up">
                <WebcamCapture
                  onCapture={handlePhotoCapture}
                  capturedImage={capturedPhotoUrl}
                  onRetake={handleRetakePhoto}
                />

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="xl"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft size={18} />
                    Retour
                  </Button>
                  <Button
                    variant="luxury"
                    size="xl"
                    className="flex-1"
                    onClick={handleFinalSubmit}
                    disabled={!capturedPhoto || isSubmitting}
                  >
                    {isSubmitting ? "Création..." : "Valider mon inscription"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center font-sans">
                  Votre candidature sera examinée par notre équipe. Vous recevrez une réponse sous 48h.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <ProfileAssistant type="ugc" />
    </main>
  );
};

export default UGCCreators;
