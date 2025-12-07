import { useCandidateById } from "@/hooks/useSearchCandidates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ShortlistPopover from "./ShortlistPopover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Download,
  Mail,
  Building2,
  Code,
  Award,
  Languages,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface CandidateProfileDrawerProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not specified";
  if (min && max) return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
  if (max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
  return "Not specified";
};

const formatEducation = (level: string | null): string => {
  if (!level) return "";
  const levels: Record<string, string> = {
    high_school: "High School",
    associate: "Associate Degree",
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    doctorate: "Doctorate",
    other: "Other",
  };
  return levels[level] || level;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const CandidateProfileDrawer = ({ candidateId, isOpen, onClose }: CandidateProfileDrawerProps) => {
  const { data: candidate, isLoading } = useCandidateById(candidateId);

  const handleDownloadResume = async () => {
    if (!candidate?.resume_url) return;
    
    try {
      // Extract path from URL - format: .../storage/v1/object/public/resumes/user_id/filename.pdf
      const url = new URL(candidate.resume_url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/resumes\/(.+)/);
      
      if (!pathMatch) {
        toast.error("Invalid resume URL");
        return;
      }
      
      const filePath = pathMatch[1];
      
      // Create a signed URL for download
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 60); // 60 seconds expiry
      
      if (error) {
        console.error("Error creating signed URL:", error);
        toast.error("Failed to download resume");
        return;
      }
      
      // Open the signed URL in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download resume");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {candidate && (
          <div className="space-y-6">
            <SheetHeader className="pb-0">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={candidate.profile_photo_url || undefined} alt={candidate.full_name || "Candidate"} />
                  <AvatarFallback className="gradient-bg text-primary-foreground text-xl font-semibold">
                    {candidate.full_name?.substring(0, 2).toUpperCase() || "??"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <SheetTitle className="text-2xl">{candidate.full_name || "Anonymous"}</SheetTitle>
                  <p className="text-muted-foreground mt-1">{candidate.headline || "Job Seeker"}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {candidate.experience_years || 0} years exp
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <ShortlistPopover candidateId={candidate.id} />
                {candidate.resume_url && (
                  <Button variant="hero" size="sm" onClick={handleDownloadResume}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </SheetHeader>

            <Separator />

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Expected Salary</p>
                <p className="font-medium text-sm">{formatSalary(candidate.expected_salary_min, candidate.expected_salary_max)}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Availability</p>
                <p className="font-medium text-sm">{candidate.availability || "Not specified"}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Work Status</p>
                <p className="font-medium text-sm capitalize">{candidate.work_status || "Not specified"}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Education</p>
                <p className="font-medium text-sm">{formatEducation(candidate.education_level)}</p>
              </div>
            </div>

            {/* About / Summary */}
            {(candidate.profile_summary || candidate.about) && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  About
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {candidate.profile_summary || candidate.about}
                </p>
              </div>
            )}

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Education
                </h3>
                <div className="space-y-4">
                  {candidate.education.map((edu: any) => (
                    <div key={edu.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{edu.degree_level}</p>
                          {edu.course && <p className="text-sm text-muted-foreground">{edu.course}</p>}
                          {edu.university && <p className="text-sm text-muted-foreground">{edu.university}</p>}
                        </div>
                        {edu.passing_year && (
                          <span className="text-xs text-muted-foreground">{edu.passing_year}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employment */}
            {candidate.employment && candidate.employment.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Employment
                </h3>
                <div className="space-y-4">
                  {candidate.employment.map((emp: any) => (
                    <div key={emp.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{emp.designation}</p>
                          <p className="text-sm text-muted-foreground">{emp.company_name}</p>
                          {emp.description && (
                            <p className="text-sm text-muted-foreground mt-1">{emp.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {emp.is_current && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(emp.start_date)} - {emp.is_current ? "Present" : formatDate(emp.end_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internships */}
            {candidate.internships && candidate.internships.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Internships
                </h3>
                <div className="space-y-4">
                  {candidate.internships.map((intern: any) => (
                    <div key={intern.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{intern.role}</p>
                          <p className="text-sm text-muted-foreground">{intern.company_name}</p>
                          {intern.description && (
                            <p className="text-sm text-muted-foreground mt-1">{intern.description}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(intern.start_date)} - {intern.is_current ? "Present" : formatDate(intern.end_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {candidate.projects && candidate.projects.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Projects
                </h3>
                <div className="space-y-4">
                  {candidate.projects.map((project: any) => (
                    <div key={project.id} className="border-l-2 border-primary/30 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          )}
                          {project.skills_used && project.skills_used.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.skills_used.map((skill: string) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {candidate.languages && candidate.languages.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.languages.map((lang: any) => (
                    <Badge key={lang.id} variant="secondary">
                      {lang.language}
                      {lang.proficiency && ` (${lang.proficiency})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Accomplishments */}
            {candidate.accomplishments && candidate.accomplishments.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Certifications & Accomplishments
                </h3>
                <div className="space-y-3">
                  {candidate.accomplishments.map((acc: any) => (
                    <div key={acc.id} className="border-l-2 border-primary/30 pl-4">
                      <p className="font-medium text-foreground">{acc.title}</p>
                      {acc.issuing_org && (
                        <p className="text-sm text-muted-foreground">{acc.issuing_org}</p>
                      )}
                      {acc.issue_date && (
                        <p className="text-xs text-muted-foreground">{formatDate(acc.issue_date)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Locations */}
            {candidate.preferred_locations && candidate.preferred_locations.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Preferred Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.preferred_locations.map((loc: string) => (
                    <Badge key={loc} variant="outline">
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CandidateProfileDrawer;