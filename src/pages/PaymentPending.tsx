import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

const planCodeCount: Record<string, number> = { basic: 1, premium: 2, pro: 4 };

const PaymentPending = () => {
  const { companyId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("basic");
  const [codes, setCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && companyId) {
      checkPaymentStatus();
    }
  }, [authLoading, companyId]);

  const checkPaymentStatus = async () => {
    if (!companyId) return;
    
    // Check subscription status
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, plan")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub?.status === "active") {
      navigate("/dashboard", { replace: true });
      return;
    }

    setPlan(sub?.plan || "basic");

    // Check latest payment
    const { data: payment } = await supabase
      .from("payments")
      .select("status")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setPaymentStatus(payment?.status || "pending");
    const count = planCodeCount[sub?.plan || "basic"] || 1;
    setCodes(Array(count).fill(""));
    setCheckLoading(false);
  };

  const handleResubmit = async () => {
    if (codes.some(c => !c.trim())) {
      toast.error("يرجى إدخال جميع أكواد الشحن");
      return;
    }
    if (!companyId) return;

    setSubmitting(true);
    const amount = plan === "pro" ? 200 : plan === "premium" ? 100 : 50;

    const { error } = await supabase.from("payments").insert({
      company_id: companyId,
      plan: plan as "basic" | "premium" | "pro",
      duration: "monthly" as const,
      amount,
      codes: codes.join(","),
    });

    if (error) {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } else {
      toast.success("تم إعادة إرسال أكواد الشحن");
      setPaymentStatus("pending");
    }
    setSubmitting(false);
  };

  if (authLoading || checkLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const isRejected = paymentStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-2xl p-8 card-elevated border border-border">
          <div className={`w-16 h-16 rounded-full ${isRejected ? "bg-destructive/10" : "bg-accent/10"} flex items-center justify-center mx-auto mb-4`}>
            {isRejected ? <XCircle className="w-8 h-8 text-destructive" /> : <Clock className="w-8 h-8 text-accent" />}
          </div>

          {isRejected ? (
            <>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">خطأ</h2>
              <p className="text-destructive text-sm mb-6">كود الشحن غير صالح، الرجاء التأكد من بياناتك</p>

              <div className="space-y-3 text-right">
                {codes.map((code, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-sm text-muted-foreground">ادخل كود الشحن 50 د. ل.</Label>
                    <Input
                      value={code}
                      onChange={(e) => {
                        const newCodes = [...codes];
                        newCodes[i] = e.target.value;
                        setCodes(newCodes);
                      }}
                      placeholder="كود الشحن"
                    />
                  </div>
                ))}
              </div>

              <Button
                className="w-full mt-4 bg-accent-gradient text-accent-foreground hover:opacity-90"
                onClick={handleResubmit}
                disabled={submitting}
              >
                <Send className="w-4 h-4 ml-2" />
                {submitting ? "جاري الإرسال..." : "إعادة الإرسال"}
              </Button>
            </>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">في انتظار التأكيد</h2>
              <p className="text-muted-foreground text-sm">سيتم تفعيل حسابك قريباً بعد تأكيد الدفع</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => checkPaymentStatus()}
              >
                تحقق من الحالة
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
