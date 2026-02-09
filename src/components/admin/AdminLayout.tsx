import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2, LayoutDashboard, Users, CreditCard, CheckCircle,
  Settings, Bell, LogOut, ChevronRight, ChevronLeft, Menu, MessageSquare, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/admin" },
  { icon: Building2, label: "الشركات", path: "/admin/companies" },
  { icon: CreditCard, label: "الاشتراكات", path: "/admin/subscriptions" },
  { icon: CreditCard, label: "المدفوعات", path: "/admin/payments" },
  { icon: CheckCircle, label: "التوثيق", path: "/admin/verification" },
  { icon: MessageSquare, label: "الدعم الفني", path: "/admin/support" },
  { icon: Bell, label: "الإشعارات", path: "/admin/notifications" },
  { icon: BarChart3, label: "الإحصائيات", path: "/admin/statistics" },
  { icon: Settings, label: "الإعدادات", path: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-destructive flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-destructive-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold text-sidebar-foreground">مقاول</span>
            <span className="text-xs text-destructive">لوحة الأدمن</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-destructive/10 text-destructive"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar border-l border-sidebar-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 mx-3 mb-3 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronLeft className="w-4 h-4 mx-auto" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">مدير النظام</span>
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-destructive" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
