import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "أساسي",
    nameEn: "basic",
    price: "50",
    period: "د.ل / شهرياً",
    features: ["صفحة عامة لشركتك", "حتى 5 مشاريع", "حتى 5 خدمات", "إدارة الفريق", "دعم فني"],
    popular: false,
  },
  {
    name: "احترافي",
    nameEn: "premium",
    price: "100",
    period: "د.ل / شهرياً",
    features: ["كل مميزات الأساسي", "حتى 20 مشروع", "حتى 15 خدمة", "إحصائيات متقدمة", "توثيق الشركة", "أولوية الدعم الفني"],
    popular: true,
  },
  {
    name: "متقدم",
    nameEn: "pro",
    price: "200",
    period: "د.ل / شهرياً",
    features: ["كل مميزات الاحترافي", "مشاريع غير محدودة", "خدمات غير محدودة", "تقارير مفصلة", "دعم مخصص", "ميزات حصرية"],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-accent font-semibold text-sm mb-2 block">الأسعار</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">خطط مناسبة لكل شركة</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">اختر الخطة التي تناسب حجم شركتك واحتياجاتك.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.nameEn}
              className={`relative bg-card rounded-2xl p-8 border ${plan.popular ? 'border-accent shadow-lg shadow-accent/10 scale-105' : 'border-border card-elevated'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-gradient text-accent-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> الأكثر طلباً
                </div>
              )}
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-heading text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? 'bg-accent-gradient text-accent-foreground hover:opacity-90' : ''}`}
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link to="/register">اختر هذه الخطة</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
