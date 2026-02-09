import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
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
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="محمد أحمد" className="pr-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">اسم الشركة</Label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="company" placeholder="شركة البناء الحديث" className="pr-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@company.com" className="pr-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" placeholder="091 000 0000" className="pr-10" />
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

            <Button className="w-full bg-accent-gradient text-accent-foreground hover:opacity-90 h-11" type="submit">
              إنشاء الحساب
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
