-- Create professional_favorites table for saving favorite models
CREATE TABLE public.professional_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL,
    model_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(professional_id, model_id)
);

-- Enable RLS
ALTER TABLE public.professional_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_favorites
CREATE POLICY "Professionals can manage their own favorites"
ON public.professional_favorites
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM professional_profiles pp
        WHERE pp.id = professional_favorites.professional_id
        AND pp.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all favorites"
ON public.professional_favorites
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email_new_booking BOOLEAN DEFAULT true,
    email_booking_update BOOLEAN DEFAULT true,
    email_new_message BOOLEAN DEFAULT true,
    email_marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification preferences"
ON public.notification_preferences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;