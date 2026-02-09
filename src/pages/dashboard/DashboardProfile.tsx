import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, MapPin, Phone, Mail, Globe, MessageCircle, 
  CheckCircle, ExternalLink, Copy, Eye 
} from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const DashboardProfile = () => {
  const { company, subscription, loading } = useCompany();
  const [copied, setCopied] = useState(false);

  const profileUrl = company?.slug ? `${window.location.origin}/company/${company.slug}` : '';

  const copyLink = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const planLabels: Record<string, string> = {
    basic: "أساسي",
    premium: "احترافي",
    pro: "متقدم",
  };

  const statusLabels: Record<string, string> = {
    active: "نشط",
    expired: "منتهي",
    cancelled: "ملغي",
    pending: "في انتظار التفعيل",
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الصفحة العامة</h1>
            <p className="text-muted-foreground">معاينة وإدارة صفحة شركتك العامة</p>
          </div>
          {company?.slug && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyLink}>
                <Copy className="w-4 h-4 ml-2" />
                {copied ? "تم النسخ!" : "نسخ الرابط"}
              </Button>
              <Button asChild>
                <Link to={`/company/${company.slug}`} target="_blank">
                  <Eye className="w-4 h-4 ml-2" />
                  معاينة
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company.company_name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{company?.company_name}</h2>
                    {company?.verified && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  {company?.city && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{company.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {company?.description && (
                <div>
                  <h3 className="font-medium mb-2">نبذة عن الشركة</h3>
                  <p className="text-muted-foreground">{company.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company?.phone_1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{company.phone_1}</span>
                  </div>
                )}
                {company?.whatsapp_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span>{company.whatsapp_number}</span>
                  </div>
                )}
                {company?.facebook_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={company.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      فيسبوك
                    </a>
                  </div>
                )}
              </div>

              {!company?.description && !company?.phone_1 && (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground mb-2">صفحتك غير مكتملة</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/settings">
                      أكمل بيانات شركتك
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle>الاشتراك</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">الخطة</span>
                <Badge variant="outline" className="text-base">
                  {planLabels[subscription?.plan || 'basic']}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">الحالة</span>
                <Badge 
                  className={
                    subscription?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }
                >
                  {statusLabels[subscription?.status || 'pending']}
                </Badge>
              </div>

              {subscription?.ends_at && subscription.status === 'active' && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ينتهي في</span>
                  <span className="text-sm">
                    {new Date(subscription.ends_at).toLocaleDateString('ar-LY')}
                  </span>
                </div>
              )}

              {subscription?.status !== 'active' && (
                <Button className="w-full mt-4">
                  ترقية الاشتراك
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile URL */}
        {company?.slug && (
          <Card>
            <CardHeader>
              <CardTitle>رابط صفحتك العامة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm overflow-x-auto">
                  {profileUrl}
                </code>
                <Button variant="ghost" size="sm" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                شارك هذا الرابط مع عملائك ليتعرفوا على شركتك
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfile;
