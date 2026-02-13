import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const AdminPromoCodes = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  const [form, setForm] = useState({
    code: "",
    type: "discount" as "discount" | "months",
    discount_amount: "",
    bonus_months: "",
    is_active: true,
    max_uses: "",
  });

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.toUpperCase(),
        is_active: form.is_active,
        discount_amount: form.type === "discount" ? Number(form.discount_amount) : null,
        bonus_months: form.type === "months" ? Number(form.bonus_months) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
      };
      if (editingCode) {
        const { error } = await supabase.from("promo_codes").update(payload).eq("id", editingCode.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promo_codes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingCode ? "تم تحديث الرمز" : "تم إضافة الرمز");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف الرمز");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
  });

  const resetForm = () => {
    setEditingCode(null);
    setForm({ code: "", type: "discount", discount_amount: "", bonus_months: "", is_active: true, max_uses: "" });
  };

  const openEdit = (promo: any) => {
    setEditingCode(promo);
    setForm({
      code: promo.code,
      type: promo.bonus_months ? "months" : "discount",
      discount_amount: promo.discount_amount ? String(promo.discount_amount) : "",
      bonus_months: promo.bonus_months ? String(promo.bonus_months) : "",
      is_active: promo.is_active,
      max_uses: promo.max_uses ? String(promo.max_uses) : "",
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Ticket className="w-6 h-6 text-accent" /> الرموز الترويجية
            </h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة رموز الخصم والعروض الترويجية</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" /> إضافة رمز
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : codes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد رموز ترويجية بعد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {codes.map((promo: any) => (
              <Card key={promo.id} className={!promo.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">{promo.code}</CardTitle>
                    <Badge variant={promo.is_active ? "default" : "secondary"}>
                      {promo.is_active ? "مفعّل" : "معطّل"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {promo.discount_amount && (
                    <div className="text-sm">خصم: <span className="font-bold text-accent">{promo.discount_amount} د.ل</span></div>
                  )}
                  {promo.bonus_months && (
                    <div className="text-sm">إضافة: <span className="font-bold text-accent">{promo.bonus_months} شهر</span></div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    الاستخدام: {promo.used_count}{promo.max_uses ? `/${promo.max_uses}` : " (غير محدود)"}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(promo)}>
                      <Pencil className="w-4 h-4 ml-1" /> تعديل
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف الرمز</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف هذا الرمز الترويجي؟</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(promo.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCode ? "تعديل الرمز" : "إضافة رمز ترويجي جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الرمز</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="مثال: WELCOME50" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>نوع العرض</Label>
              <Select value={form.type} onValueChange={(v: "discount" | "months") => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">خصم مبلغ مالي</SelectItem>
                  <SelectItem value="months">إضافة أشهر مجانية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === "discount" && (
              <div className="space-y-2">
                <Label>مبلغ الخصم (د.ل)</Label>
                <Input type="number" min="0" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value })} />
              </div>
            )}
            {form.type === "months" && (
              <div className="space-y-2">
                <Label>عدد الأشهر المضافة</Label>
                <Input type="number" min="1" value={form.bonus_months} onChange={(e) => setForm({ ...form, bonus_months: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>الحد الأقصى للاستخدام (اتركه فارغاً لغير محدود)</Label>
              <Input type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>مفعّل</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.code || (form.type === "discount" ? !form.discount_amount : !form.bonus_months)}>
              {editingCode ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPromoCodes;
