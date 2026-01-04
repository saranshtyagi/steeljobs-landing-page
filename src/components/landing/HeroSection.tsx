import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    if (user && role) {
      navigate(role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/candidate");
    } else {
      navigate("/auth?mode=signup");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container-narrow">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-up-delay-1">
            {t("hero.title")}{" "}
            <span className="gradient-text">{t("hero.titleHighlight")}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up-delay-2">
            {t("hero.subtitle")}
          </p>

          {/* CTA Button */}
          <div className="flex items-center justify-center mb-16 animate-fade-up-delay-3">
            <Button variant="hero" size="xl" className="w-full sm:w-auto group" onClick={handleGetStarted}>
              {user ? t("hero.goToDashboard") : t("hero.createAccount")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 animate-fade-up-delay-3">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">15K+</div>
              <div className="text-sm text-muted-foreground">{t("hero.stats.jobs")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">50K+</div>
              <div className="text-sm text-muted-foreground">{t("hero.stats.professionals")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">500+</div>
              <div className="text-sm text-muted-foreground">{t("hero.stats.companies")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">92%</div>
              <div className="text-sm text-muted-foreground">{t("hero.stats.placementRate")}</div>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="hidden xl:block absolute top-1/4 left-4 animate-float">
          <div className="glass-card rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t("hero.floatingCard.newHire")}</div>
                <div className="text-xs text-muted-foreground">{t("hero.floatingCard.plantManager")}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute top-1/2 right-8 animate-float" style={{ animationDelay: "1s" }}>
          <div className="glass-card rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t("hero.floatingCard.applicationSent")}</div>
                <div className="text-xs text-muted-foreground">{t("hero.floatingCard.tataSteelLtd")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
