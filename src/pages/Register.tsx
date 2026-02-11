import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, AtSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

const plans = [
  { id: "basic" as const, name: "أساسي", price: 50, codes: 1, features: ["3 مشاريع", "5 خدمات", "3 أعضاء فريق"] },
  { id: "premium" as const, name: "مميز", price: 100, codes: 2, features: ["10 مشاريع", "15 خدمة", "10 أعضاء فريق"] },
  { id: "pro" as const, name: "احترافي", price: 200, codes: 4, features: ["50 مشروع", "50 خدمة", "50 عضو فريق"] },
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "pro" | null>(null);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

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

  const validateUsername = async (value: string) => {
    const cleaned = value.replace(/[^a-z0-9_-]/g, "").toLowerCase();
    setUsername(cleaned);
    if (cleaned.length < 3) {
      setUsernameError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
      return;
    }
    // Check uniqueness
    const { data } = await supabase.from("companies").select("id").eq("slug", cleaned).maybeSingle();
    if (data) {
      setUsernameError("اسم المستخدم مستخدم بالفعل");
    } else {
      setUsernameError("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (!selectedPlan) {
      toast.error("يرجى اختيار خطة اشتراك");
      return;
    }
    if (usernameError || username.length < 3) {
      toast.error("يرجى إدخال اسم مستخدم صالح");
      return;
    }
    if (codes.some(c => !c.trim())) {
      toast.error("يرجى إدخال جميع أكواد الشحن");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name,
          company_name: company,
          phone,
          username,
          plan: selectedPlan,
          codes: codes.join(","),
        },
      },
    });

    if (error) {
      toast.error(error.message === "User already registered" ? "هذا البريد مسجل بالفعل" : error.message);
    } else {
      setSuccess(true);
      toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl p-8 card-elevated border border-border">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">تم إرسال الدفع</h2>
            <p className="text-muted-foreground text-sm mb-2">
              أرسلنا رابط تأكيد إلى <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-muted-foreground text-sm mb-4">سيتم تفعيل حسابك قريباً بعد تأكيد الدفع</p>
            <Link to="/login">
              <Button className="mt-2 bg-accent-gradient text-accent-foreground hover:opacity-90">
                الذهاب لتسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">مقاول</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">إنشاء حساب جديد</h1>
          <p className="text-sm text-muted-foreground mt-1">سجّل شركتك واحصل على صفحة احترافية</p>
        </div>

        <div className="bg-card rounded-2xl p-8 card-elevated border border-border">
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="محمد أحمد" className="pr-10" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">اسم الشركة</Label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="company" placeholder="شركة البناء الحديث" className="pr-10" value={company} onChange={(e) => setCompany(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم (رابط الصفحة العامة)</Label>
              <div className="relative">
                <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="company-name"
                  className="pr-10 text-left"
                  dir="ltr"
                  value={username}
                  onChange={(e) => validateUsername(e.target.value)}
                  required
                  minLength={3}
                />
              </div>
              {username && (
                <p className={`text-xs ${usernameError ? "text-destructive" : "text-muted-foreground"}`}>
                  {usernameError || `رابط صفحتك: /company/${username}`}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="example@company.com" className="pr-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" placeholder="091 000 0000" className="pr-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10 pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3 pt-4 border-t border-border">
              <Label className="text-base font-bold">اختر خطة الاشتراك</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plans.map((plan) => (
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
                      <span className="font-heading font-bold text-lg">{plan.price} د.ل</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Codes */}
            {selectedPlan && (
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4 inline ml-1" />
                  وسيلة الدفع المتاحة حالياً هي كروت شحن الرصيد من شركة ليبيانا للإتصالات.
                </div>
                <Label className="text-base font-bold">أكواد الشحن</Label>
                <div className="space-y-3">
                  {codes.map((code, index) => (
                    <div key={index} className="space-y-1">
                      <Label className="text-sm text-muted-foreground">ادخل كود الشحن 50 د. ل.</Label>
                      <Input
                        placeholder="كود الشحن"
                        value={code}
                        onChange={(e) => updateCode(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full bg-accent-gradient text-accent-foreground hover:opacity-90 h-11"
              type="submit"
              disabled={loading || !selectedPlan}
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب والمتابعة"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
