import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Search, 
  Plus,
  TrendingUp,
  Eye,
  Clock
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const RecruiterDashboard = () => {
  const { profile } = useAuth();

  const stats = [
    { label: "Active Jobs", value: "12", icon: Briefcase, trend: "+2 this week" },
    { label: "Total Applicants", value: "248", icon: Users, trend: "+18 this week" },
    { label: "Interviews Scheduled", value: "15", icon: Clock, trend: "5 today" },
    { label: "Profile Views", value: "1.2K", icon: Eye, trend: "+12% vs last week" },
  ];

  const recentApplicants = [
    { name: "Sarah Johnson", position: "Senior Developer", time: "2 hours ago" },
    { name: "Michael Chen", position: "Product Designer", time: "4 hours ago" },
    { name: "Emily Davis", position: "Marketing Manager", time: "5 hours ago" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(" ")[0] || "Recruiter"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your job postings
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="heroOutline" size="lg">
              <Search className="w-4 h-4" />
              Search Candidates
            </Button>
            <Button variant="hero" size="lg">
              <Plus className="w-4 h-4" />
              Post New Job
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applicants */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Applicants</h2>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="space-y-4">
              {recentApplicants.map((applicant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-medium">
                      {applicant.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{applicant.name}</p>
                      <p className="text-sm text-muted-foreground">{applicant.position}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{applicant.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Active Job Posts</h2>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Senior React Developer", applicants: 45, views: 320 },
                { title: "Product Designer", applicants: 28, views: 215 },
                { title: "Marketing Manager", applicants: 32, views: 180 },
              ].map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.applicants} applicants • {job.views} views
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
