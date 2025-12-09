import { LogIn, Search, FileText, CheckCircle, UserPlus, Upload, Send, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const recruiterSteps = [
    {
      icon: LogIn,
      title: t("howItWorks.recruiter.login.title"),
      description: t("howItWorks.recruiter.login.description"),
    },
    {
      icon: Search,
      title: t("howItWorks.recruiter.searchCandidates.title"),
      description: t("howItWorks.recruiter.searchCandidates.description"),
    },
    {
      icon: FileText,
      title: t("howItWorks.recruiter.postJobs.title"),
      description: t("howItWorks.recruiter.postJobs.description"),
    },
    {
      icon: CheckCircle,
      title: t("howItWorks.recruiter.manageApplicants.title"),
      description: t("howItWorks.recruiter.manageApplicants.description"),
    },
  ];

  const seekerSteps = [
    {
      icon: UserPlus,
      title: t("howItWorks.seeker.createProfile.title"),
      description: t("howItWorks.seeker.createProfile.description"),
    },
    {
      icon: Upload,
      title: t("howItWorks.seeker.uploadResume.title"),
      description: t("howItWorks.seeker.uploadResume.description"),
    },
    {
      icon: Send,
      title: t("howItWorks.seeker.apply.title"),
      description: t("howItWorks.seeker.apply.description"),
    },
    {
      icon: Trophy,
      title: t("howItWorks.seeker.getHired.title"),
      description: t("howItWorks.seeker.getHired.description"),
    },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-muted/30">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{t("howItWorks.sectionLabel")}</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* Two Columns */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Recruiters */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-md">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{t("howItWorks.forRecruiters")}</h3>
            </div>

            <div className="space-y-6">
              {recruiterSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {t("howItWorks.step")} {index + 1}
                      </span>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Seekers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{t("howItWorks.forJobSeekers")}</h3>
            </div>

            <div className="space-y-6">
              {seekerSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center group-hover:border-green-500/50 group-hover:bg-green-500/5 transition-all duration-300">
                      <step.icon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                        {t("howItWorks.step")} {index + 1}
                      </span>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
