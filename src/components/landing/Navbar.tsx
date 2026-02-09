import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent-gradient flex items-center justify-center">
            <Building2 className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">مقاول</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">المميزات</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">الأسعار</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">عن المنصة</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">تسجيل الدخول</Link>
          </Button>
          <Button className="bg-accent-gradient text-accent-foreground hover:opacity-90" asChild>
            <Link to="/register">سجّل شركتك</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border p-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>المميزات</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>الأسعار</a>
          <a href="#about" className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>عن المنصة</a>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button variant="ghost" asChild className="w-full">
              <Link to="/login">تسجيل الدخول</Link>
            </Button>
            <Button className="bg-accent-gradient text-accent-foreground w-full" asChild>
              <Link to="/register">سجّل شركتك</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
