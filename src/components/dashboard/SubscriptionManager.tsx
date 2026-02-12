import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ArrowUpCircle, RefreshCw, Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const plans = [
  { id: "basic" as const, name: "أساسي", price: 50, codes: 1, features: ["5 مشاريع", "5 خدمات", "5 أعضاء فريق", "دعم فني"] },
  { id: "premium" as const, name: "احترافي", price: 100, codes: 2, features: ["10 مشاريع", "10 خدمات", "7 أعضاء فريق", "إحصائيات متقدمة", "أولوية الدعم الفني"] },
  { id: "pro" as const, name: "متقدم", price: 200, codes: 4, features: ["20 مشروع", "20 خدمة", "10 أعضاء فريق", "دعم مخصص", "توثيق تلقائي بالعلامة الزرقاء"] },
];

const statusLabels: Record<string, string> = {
  active: "نشط",
  expired: "منتهي",
  cancelled: "ملغي",
  pending: "معلق",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  pending: "bg-amber-100 text-amber-800",
};

const SubscriptionManager = () => {
  const { company, subscription, refetch } = useCompany();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"upgrade" | "renew">("upgrade");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "pro" | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const currentPlanIndex = plans.findIndex(p => p.id === subscription?.plan);

  const openUpgrade = () => {
    setDialogMode("upgrade");
    setSelectedPlan(null);
    setCodes([]);
    setDialogOpen(true);
  };

  const openRenew = () => {
    setDialogMode("renew");
    if (subscription) {
      const plan = plans.find(p => p.id === subscription.plan);
      setSelectedPlan(subscription.plan);
      setCodes(Array(plan?.codes || 1).fill(""));
    }
    setDialogOpen(true);
  };

  const handlePlanSelect = (planId: "basic" | "premium" | "pro") => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId)!;
    setCodes(Array(plan.codes).fill(""));
  };

  const updateCode = (index: number, value: string) => {
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
  };

  const handleSubmit = async () => {
    if (!company || !selectedPlan) return;
    if (codes.some(c => !c.trim())) {
      toast.error("يرجى إدخال جميع أكواد الشحن");
      return;
    }

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan)!;

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        company_id: company.id,
        plan: selectedPlan,
        duration: "monthly" as const,
        amount: plan.price,
        codes: codes.join(","),
        status: "pending" as const,
      });

      if (paymentError) throw paymentError;

      // Create new subscription record (pending admin approval)
      const { error: subError } = await supabase.from("subscriptions").insert({
        company_id: company.id,
        plan: selectedPlan,
        duration: "monthly" as const,
        price: plan.price,
        status: "pending" as const,
      });

      if (subError) throw subError;

      toast.success(
        dialogMode === "upgrade"
          ? "تم إرسال طلب الترقية! سيتم تفعيله بعد تأكيد الدفع"
          : "تم إرسال طلب التجديد! سيتم تفعيله بعد تأكيد الدفع"
      );
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const availablePlans = dialogMode === "upgrade"
    ? plans.filter((_, i) => i > currentPlanIndex)
    : plans.filter(p => p.id === subscription?.plan);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>الاشتراك الحالي</CardTitle>
          <CardDescription>تفاصيل اشتراكك والخطة الحالية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">الخطة</p>
                  <Badge variant="outline" className="text-base">
                    {plans.find(p => p.id === subscription.plan)?.name || subscription.plan}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                  <Badge className={statusColors[subscription.status] || ""}>
                    {statusLabels[subscription.status] || subscription.status}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">تاريخ الانتهاء</p>
                  <span className="text-sm font-medium">
                    {subscription.ends_at
                      ? new Date(subscription.ends_at).toLocaleDateString("ar-LY")
                      : "غير محدد"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {currentPlanIndex < plans.length - 1 && (
                  <Button onClick={openUpgrade} className="bg-accent-gradient text-accent-foreground hover:opacity-90">
                    <ArrowUpCircle className="w-4 h-4 ml-2" />
                    ترقية الاشتراك
                  </Button>
                )}
                {(subscription.status === "expired" || subscription.status === "active") && (
                  <Button onClick={openRenew} variant="outline">
                    <RefreshCw className="w-4 h-4 ml-2" />
                    تجديد الاشتراك
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">لا يوجد اشتراك نشط</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "upgrade" ? "ترقية الاشتراك" : "تجديد الاشتراك"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "upgrade"
                ? "اختر الخطة التي تريد الترقية إليها"
                : "قم بإدخال أكواد الشحن لتجديد اشتراكك"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Plan selection for upgrade */}
            {dialogMode === "upgrade" && (
              <div className="grid gap-3">
                {availablePlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`rounded-xl p-4 border-2 transition-all text-right ${
                      selectedPlan === plan.id
                        ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={selectedPlan === plan.id ? "default" : "outline"} className={selectedPlan === plan.id ? "bg-accent-gradient" : ""}>
                        {plan.name}
                      </Badge>
                      <span className="font-heading font-bold text-lg">{plan.price} د.ل/شهرياً</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-accent" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            )}

            {/* Renew - show current plan info */}
            {dialogMode === "renew" && selectedPlan && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span>
                  <span className="text-sm text-muted-foreground mr-auto">{plans.find(p => p.id === selectedPlan)?.price} د.ل/شهرياً</span>
                </div>
              </div>
            )}

            {/* Payment codes */}
            {selectedPlan && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4 inline ml-1" />
                  وسيلة الدفع: كروت شحن ليبيانا (50 د.ل)
                </div>
                <Label className="font-bold">أكواد الشحن</Label>
                {codes.map((code, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-sm text-muted-foreground">كود الشحن {index + 1} (50 د.ل)</Label>
                    <Input
                      placeholder="أدخل كود الشحن"
                      value={code}
                      onChange={(e) => updateCode(index, e.target.value)}
                    />
                  </div>
                ))}

                <Button
                  onClick={handleSubmit}
                  disabled={loading || codes.some(c => !c.trim())}
                  className="w-full bg-accent-gradient text-accent-foreground hover:opacity-90"
                >
                  {loading ? "جاري الإرسال..." : dialogMode === "upgrade" ? "إرسال طلب الترقية" : "إرسال طلب التجديد"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionManager;
