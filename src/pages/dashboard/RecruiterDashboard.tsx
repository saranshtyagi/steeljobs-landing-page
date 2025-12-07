import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruiterProfile } from "@/hooks/useRecruiterProfile";
import { useRecruiterJobs, Job } from "@/hooks/useRecruiterJobs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  Plus,
  Building2,
  LayoutDashboard,
  Loader2,
  Search,
  Mail,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RecruiterStats from "@/components/recruiter/RecruiterStats";
import JobsList from "@/components/recruiter/JobsList";
import JobDetailView from "@/components/recruiter/JobDetailView";
import JobPostingModal from "@/components/recruiter/JobPostingModal";
import CandidateSearch from "@/components/recruiter/CandidateSearch";
import EmailHistoryTab from "@/components/recruiter/EmailHistoryTab";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { profile: authProfile } = useAuth();
  const { profile: recruiterProfile, isLoading: profileLoading } = useRecruiterProfile();
  const { jobs, isLoading: jobsLoading } = useRecruiterJobs();

  const [activeTab, setActiveTab] = useState("overview");
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  // Redirect to onboarding if profile doesn't exist or is not completed
  useEffect(() => {
    if (!profileLoading && (!recruiterProfile || !recruiterProfile.onboarding_completed)) {
      navigate("/onboarding/recruiter");
    }
  }, [profileLoading, recruiterProfile, navigate]);

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsPostingModalOpen(true);
  };

  const handleViewJob = (job: Job) => {
    setViewingJob(job);
    setActiveTab("job-detail");
  };

  const handleCloseJobModal = () => {
    setIsPostingModalOpen(false);
    setEditingJob(null);
  };

  const handleBackFromDetail = () => {
    setViewingJob(null);
    setActiveTab("jobs");
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Show job detail view if viewing a specific job
  if (viewingJob && activeTab === "job-detail") {
    return (
      <DashboardLayout>
        <JobDetailView
          job={viewingJob}
          onBack={handleBackFromDetail}
          onEdit={() => handleEditJob(viewingJob)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {authProfile?.name?.split(" ")[0] || recruiterProfile?.contact_name || "Recruiter"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {recruiterProfile?.company_name} • Manage your job postings and candidates
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setIsPostingModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:flex gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 hidden sm:block" />
              Jobs ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              <Search className="w-4 h-4 hidden sm:block" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 hidden sm:block" />
              Company
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4 hidden sm:block" />
              Emails
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <RecruiterStats jobs={jobs} />

            {/* Recent Jobs Preview */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Jobs</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("jobs")}>
                  View all
                </Button>
              </div>

              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                  <Button variant="hero" onClick={() => setIsPostingModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => handleViewJob(job)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{job.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.location} • {job.applications_count || 0} applicants
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.is_active ? "Active" : "Closed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-6">
            <JobsList
              jobs={jobs}
              isLoading={jobsLoading}
              onView={handleViewJob}
              onEdit={handleEditJob}
              onPostNew={() => setIsPostingModalOpen(true)}
            />
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="mt-6">
            <CandidateSearch />
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="mt-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-6">
                {recruiterProfile?.company_logo_url ? (
                  <img
                    src={recruiterProfile.company_logo_url}
                    alt={recruiterProfile.company_name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {recruiterProfile?.company_name}
                  </h2>
                  {recruiterProfile?.industry && (
                    <p className="text-muted-foreground mt-1">{recruiterProfile.industry}</p>
                  )}
                  {recruiterProfile?.company_location && (
                    <p className="text-sm text-muted-foreground">
                      {recruiterProfile.company_location}
                    </p>
                  )}

                  <div className="flex gap-4 mt-4">
                    {recruiterProfile?.company_website && (
                      <a
                        href={recruiterProfile.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/onboarding/recruiter")}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>

              {recruiterProfile?.about && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {recruiterProfile.about}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recruiterProfile?.company_size && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company Size</p>
                    <p className="font-medium text-foreground">{recruiterProfile.company_size}</p>
                  </div>
                )}
                {recruiterProfile?.contact_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Person</p>
                    <p className="font-medium text-foreground">{recruiterProfile.contact_name}</p>
                  </div>
                )}
                {recruiterProfile?.contact_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Email</p>
                    <p className="font-medium text-foreground">{recruiterProfile.contact_email}</p>
                  </div>
                )}
                {recruiterProfile?.contact_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Phone</p>
                    <p className="font-medium text-foreground">{recruiterProfile.contact_phone}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="mt-6">
            <EmailHistoryTab />
          </TabsContent>
        </Tabs>

        {/* Job Posting Modal */}
        <JobPostingModal
          isOpen={isPostingModalOpen}
          onClose={handleCloseJobModal}
          editJob={editingJob}
        />
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
