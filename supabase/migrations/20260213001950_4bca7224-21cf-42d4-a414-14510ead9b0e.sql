
-- Add category column to companies
ALTER TABLE public.companies ADD COLUMN category text NULL;

-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Company owners can manage gallery" ON public.gallery_images FOR ALL USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Admins can manage all gallery images" ON public.gallery_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add offer_type and bonus_months to plan_offers
ALTER TABLE public.plan_offers ADD COLUMN offer_type text NOT NULL DEFAULT 'price';
ALTER TABLE public.plan_offers ADD COLUMN bonus_months integer NULL;

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_amount numeric NULL,
  bonus_months integer NULL,
  is_active boolean NOT NULL DEFAULT true,
  max_uses integer NULL,
  used_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes FOR SELECT USING (true);
