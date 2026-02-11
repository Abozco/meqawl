
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
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  user_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', user_name);
  user_phone := NEW.raw_user_meta_data->>'phone';
  
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, user_name, NEW.email);
  
  -- Assign company role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'company');
  
  -- Create company with metadata
  INSERT INTO public.companies (user_id, company_name, email, phone_1, slug)
  VALUES (NEW.id, user_company_name, NEW.email, user_phone, REPLACE(LOWER(NEW.id::TEXT), '-', ''))
  RETURNING id INTO new_company_id;
  
  -- Create initial subscription (basic plan, pending)
  INSERT INTO public.subscriptions (company_id, plan, duration, price, status)
  VALUES (new_company_id, 'basic', 'monthly', 0, 'pending');
  
  RETURN NEW;
END;
$function$;
