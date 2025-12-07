import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { Button } from "@/components/ui/button";
import { FileText, Search, Upload, TrendingUp, Eye, Clock, Star, Edit } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileSetupModal from "@/components/candidate/ProfileSetupModal";
import ProfileCompletionCard from "@/components/candidate/ProfileCompletionCard";
import RecommendedJobsList from "@/components/candidate/RecommendedJobsList";
import MyApplicationsList from "@/components/candidate/MyApplicationsList";

const CandidateDashboard = () => {
  const { profile: authProfile } = useAuth();
  const { profile, isLoading, calculateCompletion } = useCandidateProfile();
  const { data: applications } = useMyApplications();
  const { data: savedJobs } = useSavedJobs();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Show profile setup modal if no profile exists
  useEffect(() => {
    if (!isLoading && !profile) {
      setShowProfileModal(true);
      setIsEditing(false);
    }
  }, [isLoading, profile]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setShowProfileModal(true);
  };

  const stats = [
    { label: "Applications Sent", value: applications?.length || 0, icon: FileText, trend: "Track your progress" },
    { label: "Profile Views", value: "-", icon: Eye, trend: "Coming soon" },
    { label: "Interviews", value: applications?.filter(a => a.status === "shortlisted").length || 0, icon: Clock, trend: "Shortlisted" },
    { label: "Saved Jobs", value: savedJobs?.length || 0, icon: Star, trend: "Your bookmarks" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {authProfile?.name?.split(" ")[0] || "Candidate"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your applications and find new opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="heroOutline" size="lg" onClick={handleEditProfile}>
              {profile?.resume_url ? <Edit className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {profile?.resume_url ? "Edit Profile" : "Upload Resume"}
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
            <div key={stat.label} className="bg-card rounded-xl border border-border p-6 hover-lift">
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
            </div>
            <MyApplicationsList limit={3} showViewAll={true} />
          </div>

          {/* Recommended Jobs */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
            </div>
            <RecommendedJobsList limit={3} showViewAll={true} />
          </div>
        </div>

        {/* Profile Completion */}
        {profile && calculateCompletion(profile) < 100 && (
          <ProfileCompletionCard onEditProfile={handleEditProfile} />
        )}
      </div>

      {/* Profile Setup/Edit Modal */}
      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialData={isEditing ? profile || undefined : undefined}
        isEditing={isEditing}
      />
    </DashboardLayout>
  );
};

export default CandidateDashboard;
