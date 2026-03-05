
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'model', 'professional');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Model profiles table
CREATE TABLE public.model_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    pseudo TEXT,
    age INTEGER,
    gender TEXT,
    height INTEGER,
    weight INTEGER,
    bust INTEGER,
    waist INTEGER,
    hips INTEGER,
    shoe_size INTEGER,
    hair_color TEXT,
    eye_color TEXT,
    nationality TEXT,
    languages TEXT[],
    categories TEXT[],
    cities_available TEXT[],
    bio TEXT,
    budget_level TEXT DEFAULT '$',
    price_per_day DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_featured BOOLEAN DEFAULT false,
    verification_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.model_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Models can view their own profile"
ON public.model_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Models can update their own profile"
ON public.model_profiles FOR UPDATE
USING (auth.uid() = user_id AND status = 'approved');

CREATE POLICY "Models can insert their own profile"
ON public.model_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all model profiles"
ON public.model_profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professionals can view approved models"
ON public.model_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'professional') AND status = 'approved');

-- Model photos table
CREATE TABLE public.model_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.model_profiles(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'portfolio' CHECK (type IN ('polaroid', 'portfolio', 'professional')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.model_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Models can manage their own photos"
ON public.model_photos FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.model_profiles mp 
    WHERE mp.id = model_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all photos"
ON public.model_photos FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professionals can view approved model photos"
ON public.model_photos FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.model_profiles mp 
    WHERE mp.id = model_id AND mp.status = 'approved'
) AND public.has_role(auth.uid(), 'professional'));

-- Model availability table
CREATE TABLE public.model_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.model_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (model_id, date)
);

ALTER TABLE public.model_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Models can manage their own availability"
ON public.model_availability FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.model_profiles mp 
    WHERE mp.id = model_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Admins can view all availability"
ON public.model_availability FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professionals can view availability"
ON public.model_availability FOR SELECT
USING (public.has_role(auth.uid(), 'professional'));

-- Professional profiles table
CREATE TABLE public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    company_type TEXT,
    siret TEXT,
    website TEXT,
    description TEXT,
    payment_method TEXT DEFAULT 'online' CHECK (payment_method IN ('online', 'transfer', 'cash')),
    subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'cancelled')),
    subscription_start DATE,
    subscription_end DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own profile"
ON public.professional_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update their own profile"
ON public.professional_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can insert their own profile"
ON public.professional_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all professional profiles"
ON public.professional_profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES public.model_profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'confirmed', 'completed', 'cancelled')),
    project_type TEXT,
    project_description TEXT,
    location TEXT,
    budget_proposed DECIMAL(10,2),
    final_price DECIMAL(10,2),
    agency_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Models can view their own bookings"
ON public.bookings FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.model_profiles mp 
    WHERE mp.id = model_id AND mp.user_id = auth.uid()
));

CREATE POLICY "Professionals can manage their own bookings"
ON public.bookings FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.professional_profiles pp 
    WHERE pp.id = professional_id AND pp.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all bookings"
ON public.bookings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Messages table for anonymous chat
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('model', 'professional', 'agency')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their bookings"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.model_profiles mp ON b.model_id = mp.id
        WHERE b.id = booking_id AND mp.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.professional_profiles pp ON b.professional_id = pp.id
        WHERE b.id = booking_id AND pp.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can send messages for their bookings"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND (
        EXISTS (
            SELECT 1 FROM public.bookings b
            JOIN public.model_profiles mp ON b.model_id = mp.id
            WHERE b.id = booking_id AND mp.user_id = auth.uid()
        ) OR EXISTS (
            SELECT 1 FROM public.bookings b
            JOIN public.professional_profiles pp ON b.professional_id = pp.id
            WHERE b.id = booking_id AND pp.user_id = auth.uid()
        ) OR public.has_role(auth.uid(), 'admin')
    )
);

-- Create storage bucket for model photos
INSERT INTO storage.buckets (id, name, public) VALUES ('model-photos', 'model-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view model photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'model-photos');

CREATE POLICY "Models can upload their photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'model-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Models can update their photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'model-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Models can delete their photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'model-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_model_profiles_updated_at BEFORE UPDATE ON public.model_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON public.professional_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, first_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'first_name');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
