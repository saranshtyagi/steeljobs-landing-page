import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { 
  useCandidateEducation, useCandidateLanguages, useCandidateInternships,
  useCandidateProjects, useCandidateEmployment, useCandidateAccomplishments, useCandidateExams 
} from "@/hooks/useCandidateData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import PreferencesSection from "@/components/profile/sections/PreferencesSection";
import EducationSection from "@/components/profile/sections/EducationSection";
import SkillsSection from "@/components/profile/sections/SkillsSection";
import LanguagesSection from "@/components/profile/sections/LanguagesSection";
import InternshipsSection from "@/components/profile/sections/InternshipsSection";
import ProjectsSection from "@/components/profile/sections/ProjectsSection";
import SummarySection from "@/components/profile/sections/SummarySection";
import AccomplishmentsSection from "@/components/profile/sections/AccomplishmentsSection";
import ExamsSection from "@/components/profile/sections/ExamsSection";
import EmploymentSection from "@/components/profile/sections/EmploymentSection";
import ResumeSection from "@/components/profile/sections/ResumeSection";
import DashboardStats from "@/components/candidate/DashboardStats";
import ProfileCompletionCard from "@/components/candidate/ProfileCompletionCard";
import RecommendedJobsList from "@/components/candidate/RecommendedJobsList";
import MyApplicationsList from "@/components/candidate/MyApplicationsList";
import SavedJobsList from "@/components/candidate/SavedJobsList";
import AllJobsList from "@/components/candidate/AllJobsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Bookmark, User, Sparkles, Search, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const CandidateDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { profile, isLoading } = useCandidateProfile();
  const { education } = useCandidateEducation();
  const { languages } = useCandidateLanguages();
  const { internships } = useCandidateInternships();
  const { projects } = useCandidateProjects();
  const { employment } = useCandidateEmployment();
  const { accomplishments } = useCandidateAccomplishments();
  const { exams } = useCandidateExams();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState("preferences");

  useEffect(() => {
    if (!isLoading && (!profile || !profile.onboarding_completed)) {
      navigate("/onboarding/candidate");
    }
  }, [isLoading, profile, navigate]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      !!profile.full_name,
      !!profile.mobile_number,
      !!profile.location,
      profile.skills && profile.skills.length > 0,
      !!profile.profile_summary,
      !!profile.resume_url,
      !!profile.profile_photo_url,
      education.length > 0,
      languages.length > 0,
      profile.preferred_job_type && profile.preferred_job_type.length > 0,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const sectionStatus = {
    preferences: { filled: !!(profile?.preferred_job_type?.length || profile?.preferred_locations?.length) },
    education: { filled: education.length > 0, count: education.length },
    skills: { filled: !!(profile?.skills && profile.skills.length > 0), count: profile?.skills?.length },
    languages: { filled: languages.length > 0, count: languages.length },
    internships: { filled: internships.length > 0, count: internships.length },
    projects: { filled: projects.length > 0, count: projects.length },
    summary: { filled: !!profile?.profile_summary },
    accomplishments: { filled: accomplishments.length > 0, count: accomplishments.length },
    exams: { filled: exams.length > 0, count: exams.length },
    employment: { filled: employment.length > 0, count: employment.length },
    achievements: { filled: false },
  };

  if (isLoading || !profile?.onboarding_completed) {
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
      <div className="space-y-6">
        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border p-1 h-auto flex-wrap">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Briefcase className="w-4 h-4" />
              {t("candidate.dashboard.dashboard", "Dashboard")}
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Search className="w-4 h-4" />
              {t("candidate.dashboard.findJobs")}
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-4 h-4" />
              {t("candidate.dashboard.applications")}
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bookmark className="w-4 h-4" />
              {t("candidate.dashboard.savedJobs")}
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="w-4 h-4" />
              {t("candidate.dashboard.profile")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats */}
            <DashboardStats />

            {/* Profile Completion Card */}
            <ProfileCompletionCard onEditProfile={() => setActiveTab("profile")} />

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recommended Jobs */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{t("candidate.dashboard.recommendedForYou")}</CardTitle>
                  </div>
                  <CardDescription>{t("candidate.dashboard.jobsMatchingProfile")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecommendedJobsList 
                    limit={3} 
                    showViewAll 
                    onViewAll={() => setActiveTab("jobs")} 
                  />
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">{t("candidate.dashboard.recentApplications")}</CardTitle>
                  </div>
                  <CardDescription>{t("candidate.dashboard.trackApplicationStatus")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <MyApplicationsList 
                    limit={3} 
                    showViewAll 
                    onViewAll={() => setActiveTab("applications")} 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Find Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    {t("candidate.dashboard.browseAllJobs")}
                  </CardTitle>
                  <CardDescription>
                    {t("candidate.dashboard.exploreOpportunities")}
                  </CardDescription>
                </div>
                <Button variant="hero" onClick={() => navigate("/jobs")} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {t("candidate.dashboard.browseJobs")}
                </Button>
              </CardHeader>
              <CardContent>
                <AllJobsList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t("candidate.dashboard.myApplications")}
                </CardTitle>
                <CardDescription>
                  {t("candidate.dashboard.trackAndManage")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MyApplicationsList showViewAll={false} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  {t("candidate.dashboard.savedJobsTitle")}
                </CardTitle>
                <CardDescription>
                  {t("candidate.dashboard.savedForLater")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SavedJobsList showViewAll={false} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            {/* Profile Header */}
            <ProfileHeader
              profile={profile}
              completionPercentage={calculateCompletion()}
              onEditBasicInfo={() => scrollToSection("preferences")}
              onAddMissingDetails={() => scrollToSection("summary")}
            />

            {/* Profile Subtabs */}
            <Tabs defaultValue="edit" className="w-full mt-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="edit">{t("candidate.dashboard.viewAndEdit")}</TabsTrigger>
                <TabsTrigger value="activity">{t("candidate.dashboard.activityInsights")}</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-6">
                <div className="flex gap-6">
                  {/* Sidebar */}
                  <div className="hidden lg:block w-64 flex-shrink-0">
                    <ProfileSidebar
                      activeSection={activeSection}
                      onSectionClick={scrollToSection}
                      sectionStatus={sectionStatus}
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-6 min-w-0">
                    <ResumeSection />
                    <PreferencesSection profile={profile} />
                    <EducationSection />
                    <SkillsSection />
                    <LanguagesSection />
                    {profile.work_status === "experienced" && <EmploymentSection />}
                    <InternshipsSection />
                    <ProjectsSection />
                    <SummarySection />
                    <AccomplishmentsSection />
                    <ExamsSection />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <p className="text-muted-foreground">{t("candidate.dashboard.activityComingSoon")}</p>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
