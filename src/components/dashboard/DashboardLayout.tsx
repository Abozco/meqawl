import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2, LayoutDashboard, FolderKanban, Users, Wrench, Briefcase,
  BarChart3, Settings, MessageSquare, Bell, LogOut, ChevronRight, ChevronLeft, Menu, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
  { icon: Building2, label: "الصفحة العامة", path: "/dashboard/profile" },
  { icon: FolderKanban, label: "المشاريع", path: "/dashboard/projects" },
  { icon: Users, label: "فريق العمل", path: "/dashboard/team" },
  { icon: Wrench, label: "الخدمات", path: "/dashboard/services" },
  { icon: Briefcase, label: "الأعمال", path: "/dashboard/works" },
  { icon: BarChart3, label: "الإحصائيات", path: "/dashboard/statistics" },
  { icon: MessageSquare, label: "الدعم الفني", path: "/dashboard/support" },
  { icon: Bell, label: "الإشعارات", path: "/dashboard/notifications" },
  { icon: Settings, label: "الإعدادات", path: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { signOut, role } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-accent-gradient flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-accent-foreground" />
        </div>
        {!collapsed && <span className="font-heading text-lg font-bold text-sidebar-foreground">مقاول</span>}
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
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Admin Link */}
      {role === 'admin' && (
        <div className="px-3 pb-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors w-full"
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>لوحة الأدمن</span>}
          </Link>
        </div>
      )}

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
            <span className="text-sm text-muted-foreground hidden sm:block">شركة البناء الحديث</span>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent" />
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

export default DashboardLayout;
