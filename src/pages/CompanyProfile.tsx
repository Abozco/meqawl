import { useParams } from "react-router-dom";
import {
  Building2, MapPin, Phone, Mail, Users, FolderKanban, Wrench, CheckCircle2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for demo
const mockCompany = {
  company_name: "شركة البناء الحديث",
  description: "شركة رائدة في مجال المقاولات العامة والتشييد في ليبيا. نقدم خدمات البناء والتشطيب والصيانة بأعلى معايير الجودة.",
  city: "طرابلس",
  address: "طرابلس - طريق المطار",
  phone_1: "091 000 0000",
  phone_2: "092 111 1111",
  email: "info@albenaa.ly",
  facebook_url: "https://facebook.com/albenaa",
  whatsapp_number: "091 000 0000",
  verified: true,
  founded_at: "2015",
  projects: [
    { title: "فيلا سكنية فاخرة", project_type: "سكني", project_status: "مكتمل" },
    { title: "مجمع تجاري حديث", project_type: "تجاري", project_status: "قيد التنفيذ" },
    { title: "مصنع الأمل", project_type: "صناعي", project_status: "مكتمل" },
  ],
  services: [
    { title: "تصميم معماري", description: "تصميم شامل للمباني السكنية والتجارية" },
    { title: "بناء وتشييد", description: "تنفيذ مشاريع البناء بكافة أنواعها" },
    { title: "تشطيبات", description: "تشطيبات داخلية وخارجية بأعلى جودة" },
  ],
  team: [
    { name: "م. أحمد محمد", position: "مدير المشاريع" },
    { name: "م. سارة علي", position: "مهندسة تصميم" },
    { name: "م. خالد حسن", position: "مدير التنفيذ" },
  ],
};

const CompanyProfile = () => {
  const { slug: _slug } = useParams();
  const company = mockCompany;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-card/10 border border-primary-foreground/20 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-3xl font-bold text-primary-foreground">{company.company_name}</h1>
                {company.verified && <CheckCircle2 className="w-6 h-6 text-accent" />}
              </div>
              <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.city}</span>
                <span>تأسست عام {company.founded_at}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">عن الشركة</h2>
              <p className="text-muted-foreground leading-relaxed">{company.description}</p>
            </div>

            {/* Projects */}
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-accent" /> المشاريع
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.projects.map((p) => (
                  <div key={p.title} className="border border-border rounded-xl p-4 hover:border-accent/30 transition-colors">
                    <div className="w-full h-32 rounded-lg bg-muted mb-3 flex items-center justify-center">
                      <FolderKanban className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{p.project_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.project_status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-accent/10 text-accent'}`}>
                        {p.project_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-accent" /> الخدمات
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {company.services.map((s) => (
                  <div key={s.title} className="border border-border rounded-xl p-4 text-center hover:border-accent/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <Wrench className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> فريق العمل
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {company.team.map((t) => (
                  <div key={t.name} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                      <Users className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.position}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Info */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border space-y-4 sticky top-20">
              <h3 className="font-heading text-lg font-bold text-foreground">معلومات التواصل</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-foreground">{company.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-foreground">{company.phone_1}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-foreground">{company.email}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <Button className="w-full bg-accent text-accent-foreground hover:opacity-90" asChild>
                  <a href={`https://wa.me/${company.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                    واتساب
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={company.facebook_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 ml-2" /> فيسبوك
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
