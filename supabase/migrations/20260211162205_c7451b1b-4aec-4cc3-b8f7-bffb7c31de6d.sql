
-- Add price column to services
ALTER TABLE public.services ADD COLUMN price numeric NULL;

-- Create site_settings table for footer/contact info
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default footer values
INSERT INTO public.site_settings (key, value) VALUES 
  ('footer_email', 'info@moqawel.ly'),
  ('footer_phone', '+218 91 000 0000');

-- Create plan_offers table
CREATE TABLE public.plan_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan NOT NULL,
  duration subscription_duration NOT NULL,
  original_price numeric NOT NULL,
  offer_price numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plan_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers" ON public.plan_offers FOR SELECT USING (true);
CREATE POLICY "Admins can manage offers" ON public.plan_offers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
