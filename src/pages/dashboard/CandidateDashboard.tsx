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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CandidateDashboard = () => {
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
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          completionPercentage={calculateCompletion()}
          onEditBasicInfo={() => scrollToSection("preferences")}
          onAddMissingDetails={() => scrollToSection("summary")}
        />

        {/* Tabs */}
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="edit">View & Edit</TabsTrigger>
            <TabsTrigger value="activity">Activity Insights</TabsTrigger>
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
              <p className="text-muted-foreground">Activity insights coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;
