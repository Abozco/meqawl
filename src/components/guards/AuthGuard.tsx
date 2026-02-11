import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, companyId } = useAuth();
  const [checking, setChecking] = useState(true);
  const [banned, setBanned] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    if (!loading && companyId) {
      checkStatus();
    } else if (!loading) {
      setChecking(false);
    }
  }, [loading, companyId]);

  const checkStatus = async () => {
    if (!companyId) { setChecking(false); return; }

    // Check banned
    const { data: company } = await supabase
      .from('companies')
      .select('banned')
      .eq('id', companyId)
      .maybeSingle();

    if (company?.banned) {
      setBanned(true);
      setChecking(false);
      return;
    }

    // Check subscription status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub?.status !== 'active') {
      setPaymentPending(true);
    }

    setChecking(false);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (banned) {
    return <Navigate to="/account-banned" replace />;
  }

  if (paymentPending) {
    return <Navigate to="/payment-pending" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
