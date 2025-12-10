import { CandidateResult } from "@/hooks/useSearchCandidates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ShortlistPopover from "./ShortlistPopover";
import {
  MapPin,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Clock,
  FileText,
  Eye,
  Star,
  Mail,
} from "lucide-react";

interface CandidateCardProps {
  candidate: CandidateResult;
  isSelected: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
  onEmail?: () => void;
}

const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return "Not specified";
  
  const formatAmount = (amount: number): string => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };
  
  if (min && max) return `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  if (min) return `From ₹${formatAmount(min)}`;
  if (max) return `Up to ₹${formatAmount(max)}`;
  return "Not specified";
};

const formatEducation = (level: string | null): string => {
  if (!level) return "";
  const levels: Record<string, string> = {
    high_school: "High School",
    associate: "Associate",
    bachelor: "Bachelor's",
    master: "Master's",
    doctorate: "Doctorate",
    other: "Other",
  };
  return levels[level] || level;
};

const getTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) return "Updated today";
  if (diffDays === 1) return "Updated 1 day ago";
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
  return `Updated ${Math.floor(diffDays / 30)} months ago`;
};

const CandidateCard = ({ candidate, isSelected, onSelect, onViewProfile, onEmail }: CandidateCardProps) => {
  const latestEducation = candidate.education?.find((e) => e.is_highest) || candidate.education?.[0];
  const currentJob = candidate.employment?.find((e) => e.is_current);

  return (
    <div
      className={`p-5 rounded-xl bg-card border transition-all ${
        isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>

        {/* Avatar */}
        <Avatar className="w-14 h-14 flex-shrink-0">
          <AvatarImage src={candidate.profile_photo_url || undefined} alt={candidate.full_name || "Candidate"} />
          <AvatarFallback className="gradient-bg text-primary-foreground font-semibold">
            {candidate.full_name?.substring(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground">{candidate.full_name || "Anonymous"}</h3>
                {candidate.matchScore && candidate.matchScore > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {candidate.matchScore}% match
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{candidate.headline || "Job Seeker"}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShortlistPopover candidateId={candidate.id} />
              {onEmail && (
                <Button variant="outline" size="sm" onClick={onEmail}>
                  <Mail className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onViewProfile}>
                <Eye className="w-4 h-4 mr-1" />
                View Profile
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {candidate.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {candidate.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {candidate.experience_years || 0} years exp
            </span>
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              {formatSalary(candidate.expected_salary_min, candidate.expected_salary_max)}
            </span>
            {candidate.education_level && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {formatEducation(candidate.education_level)}
              </span>
            )}
            {candidate.resume_url && (
              <Badge variant="outline" className="text-xs gap-1">
                <FileText className="w-3 h-3" />
                Resume
              </Badge>
            )}
          </div>

          {/* Education & Current Role */}
          <div className="flex flex-wrap gap-4 text-sm">
            {latestEducation && (
              <span className="text-muted-foreground">
                {latestEducation.course || latestEducation.degree_level}
                {latestEducation.university && ` • ${latestEducation.university}`}
              </span>
            )}
            {currentJob && (
              <span className="text-muted-foreground">
                {currentJob.designation} at {currentJob.company_name}
              </span>
            )}
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 6} more
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeAgo(candidate.updated_at)}
            </span>
            {candidate.availability && (
              <Badge variant="outline" className="text-xs">
                {candidate.availability}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;