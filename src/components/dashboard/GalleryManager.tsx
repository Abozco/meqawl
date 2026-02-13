import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Images, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import ImageUpload from "./ImageUpload";

const MAX_GALLERY_IMAGES = 5;

const GalleryManager = () => {
  const { company } = useCompany();
  const [images, setImages] = useState<{ id: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (company) fetchImages();
  }, [company]);

  const fetchImages = async () => {
    if (!company) return;
    const { data } = await supabase
      .from("gallery_images")
      .select("id, image_url")
      .eq("company_id", company.id)
      .order("created_at", { ascending: true });
    setImages(data || []);
    setLoading(false);
  };

  const handleUpload = async (url: string) => {
    if (!company) return;
    const { error } = await supabase.from("gallery_images").insert({
      company_id: company.id,
      image_url: url,
    });
    if (error) {
      toast.error("حدث خطأ في إضافة الصورة");
    } else {
      toast.success("تم إضافة الصورة للمعرض");
      fetchImages();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) {
      toast.error("حدث خطأ في حذف الصورة");
    } else {
      toast.success("تم حذف الصورة");
      fetchImages();
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="w-5 h-5 text-accent" /> معرض الصور
        </CardTitle>
        <CardDescription>أضف حتى {MAX_GALLERY_IMAGES} صور لمعرض شركتك ({images.length}/{MAX_GALLERY_IMAGES})</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.image_url}
                alt="Gallery"
                className="w-full h-24 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-1 left-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(img.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {images.length < MAX_GALLERY_IMAGES && company && (
          <ImageUpload
            companyId={company.id}
            folder="gallery"
            onUpload={handleUpload}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default GalleryManager;
