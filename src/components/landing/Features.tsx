import { 
  Search, 
  Shield, 
  Zap, 
  Users, 
  FileText, 
  MapPin, 
  IndianRupee, 
  GraduationCap, 
  Sparkles, 
  Upload, 
  MousePointer, 
  BarChart3 
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: t("features.industrySearch.title"),
      description: t("features.industrySearch.description"),
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Shield,
      title: t("features.secureAuth.title"),
      description: t("features.secureAuth.description"),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: t("features.fastPerformance.title"),
      description: t("features.fastPerformance.description"),
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: t("features.smartMatching.title"),
      description: t("features.smartMatching.description"),
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FileText,
      title: t("features.resumeParsing.title"),
      description: t("features.resumeParsing.description"),
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: MousePointer,
      title: t("features.oneClickApply.title"),
      description: t("features.oneClickApply.description"),
      color: "from-rose-500 to-red-500",
    },
  ];

  const filterCategories = [
    { icon: Sparkles, label: t("features.filters.skills"), example: t("features.filters.skillsExample") },
    { icon: MapPin, label: t("features.filters.location"), example: t("features.filters.locationExample") },
    { icon: IndianRupee, label: t("features.filters.salary"), example: t("features.filters.salaryExample") },
    { icon: GraduationCap, label: t("features.filters.education"), example: t("features.filters.educationExample") },
    { icon: BarChart3, label: t("features.filters.experience"), example: t("features.filters.experienceExample") },
    { icon: Upload, label: t("features.filters.certifications"), example: t("features.filters.certificationsExample") },
  ];

  return (
    <section id="features" className="section-padding">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{t("features.sectionLabel")}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card rounded-2xl p-6 hover-lift"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Filter Categories Preview */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12 border border-border/50">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {t("features.filterTitle")}
            </h3>
            <p className="text-muted-foreground">
              {t("features.filterSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filterCategories.map((category, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <category.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-foreground mb-1">{category.label}</div>
                <div className="text-xs text-muted-foreground">{category.example}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
