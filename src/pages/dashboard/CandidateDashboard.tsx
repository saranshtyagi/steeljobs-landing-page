import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  FileText, 
  Search, 
  Upload,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle2,
  Star
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const CandidateDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    { label: "Applications Sent", value: "24", icon: FileText, trend: "+5 this week" },
    { label: "Profile Views", value: "156", icon: Eye, trend: "+23% this week" },
    { label: "Interviews", value: "3", icon: Clock, trend: "1 upcoming" },
    { label: "Saved Jobs", value: "18", icon: Star, trend: "2 new matches" },
  ];

  const recentApplications = [
    { company: "TechCorp", position: "Senior Developer", status: "In Review", time: "2 days ago" },
    { company: "DesignStudio", position: "UI/UX Designer", status: "Interview", time: "5 days ago" },
    { company: "StartupXYZ", position: "Full Stack Dev", status: "Applied", time: "1 week ago" },
  ];

  const recommendedJobs = [
    { title: "Frontend Developer", company: "Google", location: "Remote", salary: "$120k - $160k" },
    { title: "React Developer", company: "Meta", location: "New York", salary: "$130k - $170k" },
    { title: "Software Engineer", company: "Amazon", location: "Seattle", salary: "$140k - $180k" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Interview":
        return "text-green-600 bg-green-100";
      case "In Review":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(" ")[0] || "Candidate"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your applications and find new opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="heroOutline" size="lg">
              <Upload className="w-4 h-4" />
              Update Resume
            </Button>
            <Button variant="hero" size="lg">
              <Search className="w-4 h-4" />
              Find Jobs
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-6 hover-lift"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="space-y-4">
              {recentApplications.map((app, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground font-medium text-sm">
                      {app.company.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{app.position}</p>
                      <p className="text-sm text-muted-foreground">{app.company} • {app.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="space-y-4">
              {recommendedJobs.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company} • {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{job.salary}</p>
                    <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs">
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Complete Your Profile</h2>
            <span className="text-sm text-primary font-medium">60% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div className="gradient-bg h-2 rounded-full" style={{ width: "60%" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Upload Resume", done: true },
              { label: "Add Skills", done: true },
              { label: "Add Experience", done: false },
              { label: "Add Education", done: false },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  item.done ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${item.done ? "" : "opacity-30"}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
