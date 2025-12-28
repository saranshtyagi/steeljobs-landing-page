import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileCompletionCardProps {
  onEditProfile: () => void;
}

const ProfileCompletionCard = ({ onEditProfile }: ProfileCompletionCardProps) => {
  const { t } = useTranslation();
  const { profile, calculateCompletion } = useCandidateProfile();
  
  const completion = calculateCompletion(profile);

  const completionItems = [
    { label: t("candidate.profileCompletion.uploadResume", "Upload Resume"), done: !!profile?.resume_url },
    { label: t("candidate.profileCompletion.addSkills", "Add Skills"), done: profile?.skills && profile.skills.length > 0 },
    { label: t("candidate.profileCompletion.addExperience", "Add Experience"), done: profile?.experience_years !== null },
    { label: t("candidate.profileCompletion.addEducation", "Add Education"), done: !!profile?.education_level },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t("candidate.profileCompletion.title", "Complete Your Profile")}</h2>
        <span className="text-sm text-primary font-medium">{completion}% {t("candidate.profileCompletion.complete", "Complete")}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <div 
          className="gradient-bg h-2 rounded-full transition-all duration-500" 
          style={{ width: `${completion}%` }} 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {completionItems.map((item, index) => (
          <button
            key={index}
            onClick={onEditProfile}
            className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
              item.done 
                ? "bg-green-100 text-green-700" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${item.done ? "" : "opacity-30"}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
