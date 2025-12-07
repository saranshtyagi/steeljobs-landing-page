import { 
  Search, 
  Shield, 
  Zap, 
  Users, 
  FileText, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Sparkles, 
  Upload, 
  MousePointer, 
  BarChart3 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Search,
      title: "Industry-Specific Search",
      description: "Filter candidates by technical skills, certifications, plant experience, and more with lightning-fast results.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Enterprise-grade security with encrypted data and secure login for all users.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Blazing Fast Performance",
      description: "Optimized architecture handles thousands of industrial job listings with sub-second response times.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Smart Matching",
      description: "AI-powered recommendations connect skilled professionals with the right industrial opportunities.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FileText,
      title: "Resume Parsing",
      description: "Automatically extract certifications, safety training, and technical skills from resumes.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: MousePointer,
      title: "One-Click Apply",
      description: "Streamlined application process lets professionals apply in seconds, not minutes.",
      color: "from-rose-500 to-red-500",
    },
  ];

  const filterCategories = [
    { icon: Sparkles, label: "Skills", example: "Welding, PLC, Metallurgy" },
    { icon: MapPin, label: "Location", example: "Jamshedpur, Bokaro, Rourkela" },
    { icon: DollarSign, label: "Salary Range", example: "₹8L - ₹25L" },
    { icon: GraduationCap, label: "Education", example: "B.Tech, Diploma, ITI" },
    { icon: BarChart3, label: "Experience", example: "5-10 years, Senior" },
    { icon: Upload, label: "Certifications", example: "Safety, ISO, Six Sigma" },
  ];

  return (
    <section id="features" className="section-padding">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            Built for Heavy Industries
          </h2>
          <p className="text-muted-foreground">
            Powerful tools designed specifically for Steel, Power, and Mining recruitment and job search.
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
              Powerful Search Filters
            </h3>
            <p className="text-muted-foreground">
              Find exactly what you're looking for with our comprehensive filtering system
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
