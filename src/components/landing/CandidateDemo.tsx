import { Upload, FileText, Briefcase, MapPin, DollarSign, Clock, Star, ChevronRight, CheckCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const CandidateDemo = () => {
  const recommendedJobs = [
    {
      company: "TechCorp",
      role: "Senior React Developer",
      location: "Remote",
      salary: "$140K - $170K",
      posted: "2 hours ago",
      match: 95,
      logo: "TC",
    },
    {
      company: "StartupXYZ",
      role: "Frontend Lead",
      location: "San Francisco, CA",
      salary: "$150K - $180K",
      posted: "5 hours ago",
      match: 92,
      logo: "SX",
    },
    {
      company: "FinanceApp",
      role: "Full Stack Engineer",
      location: "New York, NY",
      salary: "$130K - $160K",
      posted: "1 day ago",
      match: 88,
      logo: "FA",
    },
  ];

  return (
    <section id="candidates" className="section-padding">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Candidate Dashboard</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
            Your career, simplified
          </h2>
          <p className="text-muted-foreground">
            Create your profile, upload your resume, and start applying to personalized job recommendations.
          </p>
        </div>

        {/* Demo UI */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-card rounded-3xl border border-border shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
                JD
              </div>
              <h3 className="text-xl font-bold text-foreground">John Doe</h3>
              <p className="text-sm text-muted-foreground">Senior Frontend Developer</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">$140K - $170K expected</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">5 years experience</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm font-semibold text-foreground mb-3">Skills</div>
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Next.js", "Node.js", "GraphQL"].map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Status */}
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Resume Uploaded
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">john_doe_resume.pdf</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Recommended Jobs</h3>
                <p className="text-sm text-muted-foreground">Personalized based on your profile</p>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>

            <div className="divide-y divide-border">
              {recommendedJobs.map((job, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold shrink-0">
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.role}
                          </h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                          <Star className="w-3 h-3" />
                          {job.match}% Match
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {job.posted}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="hero" size="sm">
                          Quick Apply
                        </Button>
                        <Button variant="outline" size="sm" className="group/btn">
                          View Details
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-muted/30 text-center">
              <Button variant="ghost" className="text-primary">
                View All Recommendations
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CandidateDemo;
