import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Building2, MapPin, Phone, Mail, Users, FolderKanban, Wrench, CheckCircle2, ExternalLink, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CompanyProfile = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: comp } = await supabase
        .from("companies").select("*").eq("slug", slug).maybeSingle();
      if (!comp) { setLoading(false); return; }
      setCompany(comp);

      const [p, s, t] = await Promise.all([
        supabase.from("projects").select("*").eq("company_id", comp.id),
        supabase.from("services").select("*").eq("company_id", comp.id),
        supabase.from("team_members").select("*").eq("company_id", comp.id),
      ]);
      setProjects(p.data || []);
      setServices(s.data || []);
      setTeam(t.data || []);

      // Track visit
      const today = new Date().toISOString().split("T")[0];
      const { data: stat } = await supabase
        .from("statistics").select("id, visits").eq("company_id", comp.id).eq("date", today).maybeSingle();
      if (stat) {
        await supabase.from("statistics").update({ visits: (stat.visits || 0) + 1 }).eq("id", stat.id);
      } else {
        await supabase.from("statistics").insert({ company_id: comp.id, date: today, visits: 1 });
      }

      setLoading(false);
    };
    fetchCompany();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جاري التحميل...</div>;
  if (!company) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">الشركة غير موجودة</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-card/10 border border-primary-foreground/20 flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <img src={company.logo} alt={company.company_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-accent" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-3xl font-bold text-primary-foreground">{company.company_name}</h1>
                {company.verified && <CheckCircle2 className="w-6 h-6 text-accent" />}
              </div>
              <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
                {company.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.city}</span>}
                {company.founded_at && <span>تأسست عام {new Date(company.founded_at).getFullYear()}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {company.description && (
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <h2 className="font-heading text-xl font-bold text-foreground mb-3">عن الشركة</h2>
                <p className="text-muted-foreground leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-accent" /> المشاريع
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <div key={p.id} className="border border-border rounded-xl p-4 hover:border-accent/30 transition-colors">
                      <div className="w-full h-32 rounded-lg bg-muted mb-3 flex items-center justify-center overflow-hidden">
                        {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <FolderKanban className="w-8 h-8 text-muted-foreground/30" />}
                      </div>
                      <h3 className="font-heading font-bold text-foreground text-sm">{p.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{p.project_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.project_status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-accent/10 text-accent'}`}>
                          {p.project_status === 'قيد_التنفيذ' ? 'قيد التنفيذ' : p.project_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-accent" /> الخدمات
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((s) => (
                    <div key={s.id} className="border border-border rounded-xl p-4 text-center hover:border-accent/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <Wrench className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-heading font-bold text-foreground text-sm mb-1">{s.title}</h3>
                      {s.description && <p className="text-xs text-muted-foreground mb-2">{s.description}</p>}
                      {s.price != null && <p className="text-sm font-bold text-accent mb-3">{s.price} د.ل</p>}
                      {company.whatsapp_number && (
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                          <a href={`https://wa.me/${company.whatsapp_number}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن خدمة: ${s.title}`)}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4 ml-1" /> طلب عبر واتساب
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {team.length > 0 && (
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" /> فريق العمل
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {team.map((t) => (
                    <div key={t.id} className="text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center overflow-hidden">
                        {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-muted-foreground/30" />}
                      </div>
                      <h3 className="font-heading font-bold text-foreground text-sm">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">{t.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border space-y-4 sticky top-20">
              <h3 className="font-heading text-lg font-bold text-foreground">معلومات التواصل</h3>
              <div className="space-y-3">
                {company.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-foreground">{company.address}</span>
                  </div>
                )}
                {company.phone_1 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-foreground">{company.phone_1}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-foreground">{company.email}</span>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                {company.whatsapp_number && (
                  <Button className="w-full bg-accent text-accent-foreground hover:opacity-90" asChild>
                    <a href={`https://wa.me/${company.whatsapp_number}`} target="_blank" rel="noopener noreferrer">واتساب</a>
                  </Button>
                )}
                {company.facebook_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={company.facebook_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 ml-2" /> فيسبوك
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
