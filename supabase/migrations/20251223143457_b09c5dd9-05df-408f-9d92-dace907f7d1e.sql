-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view active testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials"
ON public.testimonials
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for plugin files
INSERT INTO storage.buckets (id, name, public) VALUES ('plugins', 'plugins', true);

-- Storage policies for plugin files
CREATE POLICY "Anyone can view plugin files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'plugins');

CREATE POLICY "Admins can upload plugin files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'plugins' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update plugin files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'plugins' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete plugin files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'plugins' AND is_admin(auth.uid()));