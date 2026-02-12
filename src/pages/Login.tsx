import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message === "Invalid login credentials" 
        ? "بيانات الدخول غير صحيحة" 
        : error.message === "Email not confirmed"
        ? "يرجى تأكيد بريدك الإلكتروني أولاً"
        : error.message);
    } else {
      toast.success("تم تسجيل الدخول بنجاح");
      // Check if user is admin to redirect to admin panel
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '');
      
      const isAdmin = roles?.some(r => r.role === 'admin');
      navigate(isAdmin ? "/admin" : "/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="مكتبي" className="w-10 h-10 rounded-lg object-contain" />
            <span className="font-heading text-2xl font-bold text-foreground">مكتبي</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground mt-1">أدخل بيانات حسابك للوصول إلى لوحة التحكم</p>
        </div>

        <div className="bg-card rounded-2xl p-8 card-elevated border border-border">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@company.com" className="pr-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

            <Button className="w-full bg-accent-gradient text-accent-foreground hover:opacity-90 h-11" type="submit" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="text-accent font-medium hover:underline">سجّل شركتك الآن</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
