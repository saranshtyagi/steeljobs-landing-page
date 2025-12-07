import { LogIn, Search, FileText, CheckCircle, UserPlus, Upload, Send, Trophy } from "lucide-react";

const HowItWorks = () => {
  const recruiterSteps = [
    {
      icon: LogIn,
      title: "Login",
      description: "Access your recruiter dashboard securely",
    },
    {
      icon: Search,
      title: "Search Candidates",
      description: "Use advanced filters to find perfect matches",
    },
    {
      icon: FileText,
      title: "Post Jobs",
      description: "Create compelling job listings in minutes",
    },
    {
      icon: CheckCircle,
      title: "Manage Applicants",
      description: "Track and organize all applications",
    },
  ];

  const seekerSteps = [
    {
      icon: UserPlus,
      title: "Create Profile",
      description: "Showcase your industrial expertise",
    },
    {
      icon: Upload,
      title: "Upload Resume",
      description: "AI extracts your skills and certifications",
    },
    {
      icon: Send,
      title: "Apply",
      description: "One-click applications to top positions",
    },
    {
      icon: Trophy,
      title: "Get Hired",
      description: "Join leading industry employers",
    },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-muted/30">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            Simple steps to success
          </h2>
          <p className="text-muted-foreground">
            Whether you're hiring skilled professionals or seeking your next role in Steel, Power, or Mining, SteelJobs.com makes it effortless.
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
              <h3 className="text-2xl font-bold text-foreground">For Recruiters</h3>
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
                        Step {index + 1}
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
              <h3 className="text-2xl font-bold text-foreground">For Job Seekers</h3>
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
                        Step {index + 1}
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
