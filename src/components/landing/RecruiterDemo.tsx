import { Search, MapPin, IndianRupee, GraduationCap, Briefcase, Filter, ChevronDown, Star, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecruiterDemo = () => {
  const candidates = [
    {
      name: "Sarah Johnson",
      role: "Senior Frontend Developer",
      skills: ["React", "TypeScript", "Next.js"],
      location: "San Francisco, CA",
      salary: "₹12L - ₹15L",
      experience: "5 years",
      rating: 4.9,
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Full Stack Engineer",
      skills: ["Node.js", "Python", "AWS"],
      location: "New York, NY",
      salary: "₹10L - ₹14L",
      experience: "4 years",
      rating: 4.8,
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Backend Developer",
      skills: ["Go", "PostgreSQL", "Docker"],
      location: "Remote",
      salary: "₹8L - ₹12L",
      experience: "3 years",
      rating: 4.7,
      avatar: "ED",
    },
  ];

  return (
    <section id="recruiters" className="section-padding bg-muted/30">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Recruiter Dashboard</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            Find your perfect candidate
          </h2>
          <p className="text-muted-foreground">
            Advanced search and filtering to quickly identify top talent from our database of 200,000+ candidates.
          </p>
        </div>

        {/* Demo UI */}
        <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by skills, job title, or keywords..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  defaultValue="React Developer"
                />
              </div>
              <Button variant="hero" size="lg" className="shrink-0">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Active Filters</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: MapPin, label: "Location: India Remote" },
                { icon: IndianRupee, label: "Salary: ₹8L - ₹15L" },
                { icon: GraduationCap, label: "Education: Bachelor's+" },
                { icon: Briefcase, label: "Experience: 3+ years" },
              ].map((filter, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                  <button className="ml-1 hover:bg-primary/20 rounded-full p-0.5">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">847</span> candidates
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Sort by: <span className="font-semibold text-foreground">Best Match</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <div
                  key={index}
                  className="group p-5 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-semibold text-lg shrink-0">
                      {candidate.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {candidate.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{candidate.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-foreground">{candidate.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {candidate.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" /> {candidate.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" /> {candidate.experience}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button variant="hero" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
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

export default RecruiterDemo;
