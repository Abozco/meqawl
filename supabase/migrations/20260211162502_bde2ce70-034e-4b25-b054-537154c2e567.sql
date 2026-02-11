
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
  
  CASE user_plan
    WHEN 'basic' THEN user_amount := 50;
    WHEN 'premium' THEN user_amount := 100;
    WHEN 'pro' THEN user_amount := 200;
    ELSE user_amount := 50;
  END CASE;
  
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, user_name, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'company');
  
  -- Create company - auto verify for pro plan
  INSERT INTO public.companies (user_id, company_name, email, phone_1, slug, verified)
  VALUES (NEW.id, user_company_name, NEW.email, user_phone, user_slug, (user_plan = 'pro'))
  RETURNING id INTO new_company_id;
  
  INSERT INTO public.subscriptions (company_id, plan, duration, price, status)
  VALUES (new_company_id, user_plan, user_duration, user_amount, 'pending');
  
  -- Create welcome notification
  INSERT INTO public.notifications (company_id, title, body, sender_type)
  VALUES (new_company_id, 'تم تفعيل حسابك بنجاح', 'مرحباً بك في منصة مقاول! استمتع بخدماتنا المتميزة.', 'admin');
  
  IF user_codes != '' THEN
    INSERT INTO public.payments (company_id, plan, duration, amount, codes, status)
    VALUES (new_company_id, user_plan, user_duration, user_amount, user_codes, 'pending');
  END IF;
  
  RETURN NEW;
END;
$function$;
