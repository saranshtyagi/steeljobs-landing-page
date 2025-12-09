import { Target, Palette, Zap, Shield, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const WhyChoose = () => {
  const { t } = useTranslation();

  const reasons = [
    {
      icon: Target,
      title: t("whyChoose.industryExpertise.title"),
      description: t("whyChoose.industryExpertise.description"),
      points: t("whyChoose.industryExpertise.points", { returnObjects: true }) as string[],
    },
    {
      icon: Palette,
      title: t("whyChoose.modernUI.title"),
      description: t("whyChoose.modernUI.description"),
      points: t("whyChoose.modernUI.points", { returnObjects: true }) as string[],
    },
    {
      icon: Zap,
      title: t("whyChoose.smoothExperience.title"),
      description: t("whyChoose.smoothExperience.description"),
      points: t("whyChoose.smoothExperience.points", { returnObjects: true }) as string[],
    },
    {
      icon: Shield,
      title: t("whyChoose.secureReliable.title"),
      description: t("whyChoose.secureReliable.description"),
      points: t("whyChoose.secureReliable.points", { returnObjects: true }) as string[],
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{t("whyChoose.sectionLabel")}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            {t("whyChoose.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("whyChoose.subtitle")}
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-8 hover-lift"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-lg">
                  <reason.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{reason.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{reason.description}</p>
                  <ul className="space-y-2">
                    {reason.points.map((point, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
