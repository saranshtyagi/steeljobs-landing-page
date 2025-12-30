import { useState, useEffect } from "react";
import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useAuth } from "@/contexts/AuthContext";
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
  Zap,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";

const DashboardStats = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { data: applications } = useMyApplications();
  const { data: savedJobs } = useSavedJobs();
  const { profile: candidateProfile } = useCandidateProfile();
  const [isPremiumLoading, setIsPremiumLoading] = useState(false);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [hasPendingPremium, setHasPendingPremium] = useState(false);
  const [hasPendingInterview, setHasPendingInterview] = useState(false);

  const appliedCount = applications?.filter(a => a.status === "applied").length || 0;
  const shortlistedCount = applications?.filter(a => a.status === "shortlisted").length || 0;

  // Fetch existing pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!candidateProfile?.id) return;

      const { data, error } = await supabase
        .from("feature_requests")
        .select("request_type")
        .eq("candidate_id", candidateProfile.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending requests:", error);
        return;
      }

      if (data) {
        setHasPendingPremium(data.some(r => r.request_type === "premium"));
        setHasPendingInterview(data.some(r => r.request_type === "mock_interview"));
      }
    };

    fetchPendingRequests();
  }, [candidateProfile?.id]);

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

  const sendFeatureRequest = async (requestType: "premium_access" | "mock_interview") => {
    const userName = profile?.name || user?.user_metadata?.name || "User";
    const userEmail = user?.email || "";

    if (!userEmail) {
      toast.error("Unable to send request. Please ensure you're logged in.");
      return;
    }

    const { data, error } = await supabase.functions.invoke("send-feature-request", {
      body: { requestType, userName, userEmail },
    });

    if (error) {
      console.error("Feature request error:", error);
      throw new Error(error.message || "Failed to submit request");
    }

    // Check if already submitted (409 status)
    if (data?.alreadySubmitted) {
      throw new Error("already_submitted");
    }

    return data;
  };

  const handlePremiumClick = async () => {
    if (hasPendingPremium) {
      toast.info("Request already submitted", {
        description: "You have already submitted a premium access request. Our team will contact you soon."
      });
      return;
    }

    setIsPremiumLoading(true);
    try {
      await sendFeatureRequest("premium_access");
      setHasPendingPremium(true);
      toast.success("Request submitted!", {
        description: "Our team will contact you shortly about premium access."
      });
    } catch (error: any) {
      console.error("Premium request error:", error);
      if (error.message === "already_submitted") {
        setHasPendingPremium(true);
        toast.info("Request already submitted", {
          description: "You have already submitted a premium access request. Our team will contact you soon."
        });
      } else {
        toast.error("Failed to submit request", {
          description: "Please try again or contact support@oppexl.com"
        });
      }
    } finally {
      setIsPremiumLoading(false);
    }
  };

  const handleBookInterview = async () => {
    if (hasPendingInterview) {
      toast.info("Request already submitted", {
        description: "You have already submitted a mock interview request. Our team will contact you soon."
      });
      return;
    }

    setIsInterviewLoading(true);
    try {
      await sendFeatureRequest("mock_interview");
      setHasPendingInterview(true);
      toast.success("Request submitted!", {
        description: "Our team will contact you to schedule your mock interview session."
      });
    } catch (error: any) {
      console.error("Interview request error:", error);
      if (error.message === "already_submitted") {
        setHasPendingInterview(true);
        toast.info("Request already submitted", {
          description: "You have already submitted a mock interview request. Our team will contact you soon."
        });
      } else {
        toast.error("Failed to submit request", {
          description: "Please try again or contact support@oppexl.com"
        });
      }
    } finally {
      setIsInterviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              <div className="flex items-center gap-2">
                {hasPendingPremium && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Requested
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  ₹2,000
                </Badge>
              </div>
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
              disabled={isPremiumLoading}
              className={`w-full ${hasPendingPremium 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              } text-white`}
            >
              {isPremiumLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : hasPendingPremium ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              {isPremiumLoading ? "Submitting..." : hasPendingPremium ? "Request Submitted" : "Unlock Premium Access"}
            </Button>
          </CardContent>
        </Card>

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
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">1-on-1 Mock Interview Session</h3>
                    {hasPendingInterview && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Requested
                      </Badge>
                    )}
                  </div>
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
                disabled={isInterviewLoading}
                variant={hasPendingInterview ? "default" : "hero"}
                size="lg"
                className={`w-full lg:w-auto ${hasPendingInterview ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                {isInterviewLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : hasPendingInterview ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Video className="w-4 h-4 mr-2" />
                )}
                {isInterviewLoading ? "Submitting..." : hasPendingInterview ? "Request Submitted" : "Book Your Session"}
              </Button>
              <p className="text-xs text-muted-foreground text-center lg:text-right">
                {hasPendingInterview ? "Our team will contact you soon" : "Limited slots available daily"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;