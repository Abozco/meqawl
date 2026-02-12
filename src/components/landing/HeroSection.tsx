import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { icon: Building2, label: "شركة مسجلة", value: "+120" },
  { icon: Users, label: "مستخدم نشط", value: "+500" },
  { icon: BarChart3, label: "مشروع منفذ", value: "+2,000" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6 border border-accent/30">
              منصة إدارة المكاتب والشركات الأولى في ليبيا
            </span>
          </motion.div>

          <motion.h1
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            أدِر شركتك بذكاء مع
            <span className="text-gradient-accent block mt-2">منصة مكتبي</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            صفحة عامة احترافية لشركتك، لوحة تحكم شاملة، إدارة المشاريع والفريق والخدمات — كل ذلك في مكان واحد.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Button size="lg" className="bg-accent-gradient text-accent-foreground hover:opacity-90 text-base px-8 h-12" asChild>
              <Link to="/login">
                تسجيل الدخول
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary hover:bg-primary-foreground/10 text-base px-8 h-12" asChild>
              <Link to="/register">سجّل شركتك</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="block font-heading text-xl font-bold text-primary-foreground">{stat.value}</span>
                  <span className="text-xs text-primary-foreground/60">{stat.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
