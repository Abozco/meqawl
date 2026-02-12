import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FloatingWhatsApp = () => {
  const { data: whatsappNumber } = useQuery({
    queryKey: ["support-whatsapp"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "support_whatsapp")
        .maybeSingle();
      return data?.value || "";
    },
  });

  if (!whatsappNumber) return null;

  const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("مرحباً، أحتاج مساعدة بخصوص الاشتراك في منصة مقاول")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default FloatingWhatsApp;
