import { Target, Palette, Zap, Shield, CheckCircle } from "lucide-react";

const WhyChoose = () => {
  const reasons = [
    {
      icon: Target,
      title: "Industry Expertise",
      description: "Purpose-built for Steel, Power, and Mining sectors with specialized filters for technical roles and certifications.",
      points: ["Industry-specific job categories", "Technical skill matching", "Certification verification"],
    },
    {
      icon: Palette,
      title: "Modern UI",
      description: "A clean, intuitive interface that makes navigation effortless for both field professionals and HR teams.",
      points: ["Clean, minimal design", "Responsive on all devices", "Accessibility-first"],
    },
    {
      icon: Zap,
      title: "Smooth Experience",
      description: "Lightning-fast performance with no lag, no waiting, and no frustration. Just seamless workflows.",
      points: ["Sub-second search", "Instant updates", "Real-time notifications"],
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security trusted by leading industrial companies across India.",
      points: ["End-to-end encryption", "Data compliance", "99.9% uptime SLA"],
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why SteelJobs</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            The Industrial Hiring Advantage
          </h2>
          <p className="text-muted-foreground">
            Built specifically for heavy industries with the expertise and features that matter most to Steel, Power, and Mining professionals.
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
