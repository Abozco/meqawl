
-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'company');
CREATE TYPE public.project_type AS ENUM ('سكني', 'تجاري', 'صناعي', 'بنية_تحتية');
CREATE TYPE public.project_status AS ENUM ('قيد_التنفيذ', 'مكتمل');
CREATE TYPE public.work_type AS ENUM ('تنفيذ', 'تشطيب', 'صيانة');
CREATE TYPE public.subscription_plan AS ENUM ('basic', 'premium', 'pro');
CREATE TYPE public.subscription_duration AS ENUM ('monthly', 'yearly');
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'rejected');
CREATE TYPE public.ticket_status AS ENUM ('new', 'replied', 'closed');
CREATE TYPE public.notification_sender AS ENUM ('support', 'admin', 'subscription');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'company',
  UNIQUE (user_id, role)
);

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  logo TEXT,
  city TEXT,
  description TEXT,
  founded_at DATE,
  address TEXT,
  phone_1 TEXT,
  phone_2 TEXT,
  email TEXT,
  facebook_url TEXT,
  whatsapp_number TEXT,
  slug TEXT UNIQUE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  project_type public.project_type NOT NULL,
  project_status public.project_status NOT NULL DEFAULT 'قيد_التنفيذ',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Works table
CREATE TABLE public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  work_type public.work_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  plan public.subscription_plan NOT NULL DEFAULT 'basic',
  duration public.subscription_duration NOT NULL DEFAULT 'monthly',
  price DECIMAL(10,2) NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  codes TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  plan public.subscription_plan NOT NULL,
  duration public.subscription_duration NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Statistics table
CREATE TABLE public.statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  visits INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  facebook_clicks INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (company_id, date)
);

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  status public.ticket_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_type public.notification_sender NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get company_id for current user
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.companies WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Users can update own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for team_members
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Company owners can manage team" ON public.team_members FOR ALL USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all team members" ON public.team_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for projects
CREATE POLICY "Anyone can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Company owners can manage projects" ON public.projects FOR ALL USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for services
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Company owners can manage services" ON public.services FOR ALL USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for works
CREATE POLICY "Anyone can view works" ON public.works FOR SELECT USING (true);
CREATE POLICY "Company owners can manage works" ON public.works FOR ALL USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all works" ON public.works FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subscriptions
CREATE POLICY "Company owners can view own subscriptions" ON public.subscriptions FOR SELECT USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Company owners can view own payments" ON public.payments FOR SELECT USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Company owners can create payments" ON public.payments FOR INSERT WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for statistics
CREATE POLICY "Company owners can view own stats" ON public.statistics FOR SELECT USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Anyone can update stats" ON public.statistics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can increment stats" ON public.statistics FOR UPDATE USING (true);
CREATE POLICY "Admins can view all stats" ON public.statistics FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for support_tickets
CREATE POLICY "Company owners can view own tickets" ON public.support_tickets FOR SELECT USING (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Company owners can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  company_id = public.get_user_company_id(auth.uid())
);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Company owners can view own notifications" ON public.notifications FOR SELECT USING (
  company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL
);
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile and company on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
  user_name TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, user_name, NEW.email);
  
  -- Assign company role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'company');
  
  -- Create company
  INSERT INTO public.companies (user_id, company_name, email, slug)
  VALUES (NEW.id, user_name, NEW.email, REPLACE(LOWER(NEW.id::TEXT), '-', ''))
  RETURNING id INTO new_company_id;
  
  -- Create initial subscription (basic plan, pending)
  INSERT INTO public.subscriptions (company_id, plan, duration, price, status)
  VALUES (new_company_id, 'basic', 'monthly', 0, 'pending');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
