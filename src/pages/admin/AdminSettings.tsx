import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminSettings = () => {
  const [footerEmail, setFooterEmail] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        data.forEach((s) => {
          if (s.key === "footer_email") setFooterEmail(s.value);
          if (s.key === "footer_phone") setFooterPhone(s.value);
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        supabase.from("site_settings").update({ value: footerEmail }).eq("key", "footer_email"),
        supabase.from("site_settings").update({ value: footerPhone }).eq("key", "footer_phone"),
      ]);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch {
      toast.error("حدث خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-8 text-muted-foreground">جاري التحميل...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent" /> إعدادات الموقع
          </h1>
          <p className="text-sm text-muted-foreground mt-1">تعديل بيانات التواصل المعروضة في أسفل الصفحة الرئيسية</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات تواصل معنا (الفوتر)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer_email">البريد الإلكتروني</Label>
              <Input id="footer_email" value={footerEmail} onChange={(e) => setFooterEmail(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer_phone">رقم الهاتف</Label>
              <Input id="footer_phone" value={footerPhone} onChange={(e) => setFooterPhone(e.target.value)} dir="ltr" />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 ml-2" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
