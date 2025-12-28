import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Bookmark, 
  Clock,
  Crown,
  Video,
  FileEdit,
  GraduationCap,
  BookOpen,
  CheckCircle,
  Users,
  Target,
  MessageSquare,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const DashboardStats = () => {
  const { t } = useTranslation();
  const { data: applications } = useMyApplications();
  const { data: savedJobs } = useSavedJobs();

  const appliedCount = applications?.filter(a => a.status === "applied").length || 0;
  const shortlistedCount = applications?.filter(a => a.status === "shortlisted").length || 0;

  const stats = [
    {
      label: t("candidate.stats.applied", "Applied"),
      value: appliedCount,
      icon: FileText,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: t("candidate.stats.shortlisted", "Shortlisted"),
      value: shortlistedCount,
      icon: Clock,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: t("candidate.stats.savedJobs", "Saved Jobs"),
      value: savedJobs?.length || 0,
      icon: Bookmark,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  const premiumFeatures = [
    { icon: Video, label: "Mock Interviews", description: "Practice with industry experts" },
    { icon: FileEdit, label: "Resume Building", description: "Professional resume sessions" },
    { icon: GraduationCap, label: "Learning Paths", description: "Skill development tracks" },
    { icon: BookOpen, label: "Courses", description: "Industry-specific training" },
  ];

  const mockInterviewBenefits = [
    { icon: Users, text: "1-on-1 with industry professionals" },
    { icon: Target, text: "Role-specific interview questions" },
    { icon: MessageSquare, text: "Real-time feedback & tips" },
    { icon: Zap, text: "Boost your confidence" },
  ];

  const handlePremiumClick = () => {
    toast.info("Premium features coming soon!", {
      description: "We're working on bringing you the best career tools."
    });
  };

  const handleBookInterview = () => {
    toast.info("Booking coming soon!", {
      description: "Mock interview sessions will be available shortly."
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats and Premium Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Premium Features Card */}
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Premium Career Tools</CardTitle>
                  <CardDescription>Accelerate your job search</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                ₹2,000
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {premiumFeatures.map((feature) => (
                <div 
                  key={feature.label}
                  className="flex items-start gap-2 p-2 rounded-lg bg-background/50 border border-border/50"
                >
                  <feature.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{feature.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={handlePremiumClick} 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Unlock Premium Access
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mock Interview Booking Section */}
      <Card className="relative overflow-hidden border border-border bg-gradient-to-r from-card via-card to-primary/5">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Left Content */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">1-on-1 Mock Interview Session</h3>
                  <p className="text-muted-foreground">30 minutes with an industry expert</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {mockInterviewBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - CTA */}
            <div className="flex flex-col items-center lg:items-end gap-3 lg:min-w-[200px]">
              <div className="text-center lg:text-right">
                <p className="text-3xl font-bold text-primary">₹500</p>
                <p className="text-sm text-muted-foreground">per session</p>
              </div>
              <Button 
                onClick={handleBookInterview}
                variant="hero"
                size="lg"
                className="w-full lg:w-auto"
              >
                <Video className="w-4 h-4 mr-2" />
                Book Your Session
              </Button>
              <p className="text-xs text-muted-foreground text-center lg:text-right">
                Limited slots available daily
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
