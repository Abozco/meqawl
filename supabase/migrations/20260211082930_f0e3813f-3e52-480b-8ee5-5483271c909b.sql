
-- Add banned and restricted columns to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS restricted boolean DEFAULT false;

-- Update handle_new_user to use the username as slug if provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_company_id UUID;
  user_name TEXT;
  user_company_name TEXT;
  user_phone TEXT;
  user_slug TEXT;
  user_plan subscription_plan;
  user_duration subscription_duration;
  user_codes TEXT;
  user_amount NUMERIC;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  user_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', user_name);
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_slug := COALESCE(NEW.raw_user_meta_data->>'username', REPLACE(LOWER(NEW.id::TEXT), '-', ''));
  user_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'basic')::subscription_plan;
  user_duration := 'monthly'::subscription_duration;
  user_codes := COALESCE(NEW.raw_user_meta_data->>'codes', '');
  
  -- Calculate amount based on plan
  CASE user_plan
    WHEN 'basic' THEN user_amount := 50;
    WHEN 'premium' THEN user_amount := 100;
    WHEN 'pro' THEN user_amount := 200;
    ELSE user_amount := 50;
  END CASE;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, user_name, NEW.email);
  
  -- Assign company role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'company');
  
  -- Create company with metadata
  INSERT INTO public.companies (user_id, company_name, email, phone_1, slug)
  VALUES (NEW.id, user_company_name, NEW.email, user_phone, user_slug)
  RETURNING id INTO new_company_id;
  
  -- Create initial subscription (pending until admin confirms payment)
  INSERT INTO public.subscriptions (company_id, plan, duration, price, status)
  VALUES (new_company_id, user_plan, user_duration, user_amount, 'pending');
  
  -- Create payment record
  IF user_codes != '' THEN
    INSERT INTO public.payments (company_id, plan, duration, amount, codes, status)
    VALUES (new_company_id, user_plan, user_duration, user_amount, user_codes, 'pending');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add unique constraint on slug
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_slug_unique;
ALTER TABLE public.companies ADD CONSTRAINT companies_slug_unique UNIQUE (slug);
