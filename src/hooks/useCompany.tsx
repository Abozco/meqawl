import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Company {
  id: string;
  company_name: string;
  logo: string | null;
  city: string | null;
  description: string | null;
  founded_at: string | null;
  address: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  facebook_url: string | null;
  whatsapp_number: string | null;
  slug: string | null;
  verified: boolean;
}

interface Subscription {
  id: string;
  plan: 'basic' | 'premium' | 'pro';
  status: string;
  ends_at: string | null;
}

// Plan limits
const planLimits = {
  basic: { projects: 7, services: 7, team: 4, works: 7 },
  premium: { projects: 15, services: 15, team: 7, works: 15 },
  pro: { projects: 25, services: 25, team: 10, works: 25 },
};

export const useCompany = () => {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCompanyData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchCompanyData = async () => {
    if (!user) return;

    try {
      // Fetch company
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyData) {
        setCompany(companyData);

        // Fetch subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData) {
          setSubscription(subData as Subscription);
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLimits = () => {
    const plan = subscription?.plan || 'basic';
    return planLimits[plan];
  };

  const canAdd = (type: 'projects' | 'services' | 'team' | 'works', currentCount: number) => {
    const limits = getLimits();
    return currentCount < limits[type];
  };

  const refetch = () => {
    fetchCompanyData();
  };

  return {
    company,
    subscription,
    loading,
    getLimits,
    canAdd,
    refetch,
  };
};
