import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 gradient-bg" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.05)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          
          {/* Glow Effects */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>{t("cta.badge")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
              {t("cta.title")}
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
              {t("cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="xl" 
                className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                asChild
              >
                <a href="mailto:support@oppexl.com">
                  {t("cta.contactSales")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
