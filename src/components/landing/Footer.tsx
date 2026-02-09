import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent-gradient flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">مقاول</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              المنصة الأولى لإدارة شركات ومكاتب المقاولات في ليبيا. حلول رقمية متكاملة لتنمية أعمالك.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#features" className="hover:text-accent transition-colors">المميزات</a></li>
              <li><a href="#pricing" className="hover:text-accent transition-colors">الأسعار</a></li>
              <li><Link to="/login" className="hover:text-accent transition-colors">تسجيل الدخول</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>البريد: info@moqawel.ly</li>
              <li>الهاتف: +218 91 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} منصة مقاول. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
