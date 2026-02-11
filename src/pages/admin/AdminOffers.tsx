import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const planLabels: Record<string, string> = { basic: "أساسي", premium: "احترافي", pro: "متقدم" };
const durationLabels: Record<string, string> = { monthly: "شهري", yearly: "سنوي" };

const AdminOffers = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [form, setForm] = useState({ plan: "basic", duration: "monthly", original_price: "", offer_price: "", is_active: true });

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plan_offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        plan: form.plan as any,
        duration: form.duration as any,
        original_price: Number(form.original_price),
        offer_price: form.offer_price ? Number(form.offer_price) : null,
        is_active: form.is_active,
      };
      if (editingOffer) {
        const { error } = await supabase.from("plan_offers").update(payload).eq("id", editingOffer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("plan_offers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingOffer ? "تم تحديث العرض" : "تم إضافة العرض");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plan_offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف العرض");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("plan_offers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-offers"] }),
  });

  const resetForm = () => {
    setEditingOffer(null);
    setForm({ plan: "basic", duration: "monthly", original_price: "", offer_price: "", is_active: true });
  };

  const openEdit = (offer: any) => {
    setEditingOffer(offer);
    setForm({
      plan: offer.plan,
      duration: offer.duration,
      original_price: String(offer.original_price),
      offer_price: offer.offer_price ? String(offer.offer_price) : "",
      is_active: offer.is_active,
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Tag className="w-6 h-6 text-accent" /> عروض الأسعار
            </h1>
            <p className="text-sm text-muted-foreground mt-1">إدارة أسعار وعروض خطط الاشتراك</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" /> إضافة عرض
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : offers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد عروض بعد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer: any) => (
              <Card key={offer.id} className={!offer.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{planLabels[offer.plan] || offer.plan}</CardTitle>
                    <Badge variant={offer.is_active ? "default" : "secondary"}>
                      {offer.is_active ? "مفعّل" : "معطّل"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">{durationLabels[offer.duration]}</div>
                  <div className="flex items-baseline gap-2">
                    {offer.offer_price ? (
                      <>
                        <span className="text-2xl font-bold text-accent">{offer.offer_price} د.ل</span>
                        <span className="text-sm line-through text-muted-foreground">{offer.original_price} د.ل</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-foreground">{offer.original_price} د.ل</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch checked={offer.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: offer.id, is_active: v })} />
                    <span className="text-xs text-muted-foreground">{offer.is_active ? "مفعّل" : "معطّل"}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(offer)}>
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
                          <AlertDialogTitle>حذف العرض</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف هذا العرض؟</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(offer.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
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
            <DialogTitle>{editingOffer ? "تعديل العرض" : "إضافة عرض جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الخطة</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">أساسي</SelectItem>
                  <SelectItem value="premium">احترافي</SelectItem>
                  <SelectItem value="pro">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المدة</Label>
              <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>السعر الأصلي (د.ل)</Label>
              <Input type="number" min="0" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>سعر العرض (د.ل) - اختياري</Label>
              <Input type="number" min="0" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })} placeholder="اتركه فارغاً إن لم يكن هناك عرض" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>مفعّل</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.original_price}>
              {editingOffer ? "حفظ التغييرات" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOffers;
