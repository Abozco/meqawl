import { motion } from "framer-motion";
import {
  Globe, LayoutDashboard, FolderKanban, Users, Wrench, BarChart3, Shield, CreditCard
} from "lucide-react";

const features = [
  { icon: Globe, title: "صفحة عامة احترافية", desc: "موقع إلكتروني جاهز لشركتك يعرض مشاريعك وخدماتك وفريقك بشكل احترافي." },
  { icon: LayoutDashboard, title: "لوحة تحكم شاملة", desc: "إدارة كاملة لبيانات شركتك من مكان واحد بتصميم بسيط وسهل الاستخدام." },
  { icon: FolderKanban, title: "إدارة المشاريع", desc: "تتبع مشاريعك السكنية والتجارية والصناعية وعرض حالة التنفيذ." },
  { icon: Users, title: "إدارة الفريق", desc: "أضف أعضاء فريقك مع مناصبهم وصورهم لعرضهم في صفحتك العامة." },
  { icon: Wrench, title: "الخدمات والأعمال", desc: "عرض خدمات شركتك وأعمالك السابقة بتصنيفات واضحة." },
  { icon: BarChart3, title: "إحصائيات مفصلة", desc: "تتبع زيارات صفحتك ونقرات التواصل مع رسوم بيانية تفاعلية." },
  { icon: Shield, title: "أمان وحماية", desc: "حماية كاملة لبياناتك مع تشفير متقدم وصلاحيات محددة." },
  { icon: CreditCard, title: "خطط اشتراك مرنة", desc: "اختر الخطة المناسبة لشركتك مع إمكانية الترقية في أي وقت." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-accent font-semibold text-sm mb-2 block">لماذا مكتبي؟</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">كل ما تحتاجه شركتك في منصة واحدة</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">أدوات متكاملة صُممت خصيصاً لتلبية احتياجات المكاتب والشركات في ليبيا.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-card rounded-xl p-6 card-elevated border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
