import { 
  Briefcase, GraduationCap, Wrench, Languages, Building2, 
  FolderGit2, FileText, Award, BookOpen, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SidebarItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "preferences", labelKey: "candidate.profile.preferences", icon: Briefcase },
  { id: "education", labelKey: "candidate.profile.education", icon: GraduationCap },
  { id: "skills", labelKey: "candidate.profile.skills", icon: Wrench },
  { id: "languages", labelKey: "candidate.profile.languages", icon: Languages },
  { id: "internships", labelKey: "candidate.profile.internships", icon: Building2 },
  { id: "projects", labelKey: "candidate.profile.projects", icon: FolderGit2 },
  { id: "summary", labelKey: "candidate.profile.summary", icon: FileText },
  { id: "accomplishments", labelKey: "candidate.profile.accomplishments", icon: Award },
  { id: "exams", labelKey: "candidate.profile.exams", icon: BookOpen },
  { id: "employment", labelKey: "candidate.profile.employment", icon: Briefcase },
  { id: "achievements", labelKey: "candidate.profile.achievements", icon: Trophy },
];

interface Props {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  sectionStatus: Record<string, { filled: boolean; count?: number }>;
}

const ProfileSidebar = ({ activeSection, onSectionClick, sectionStatus }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
        {t("common.quickLinks", "Quick Links")}
      </h3>
      <nav className="space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const status = sectionStatus[item.id];
          const isFilled = status?.filled;
          const count = status?.count;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionClick(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                activeSection === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {isFilled ? (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              )}
              {count !== undefined && count > 0 && (
                <span className="text-xs text-muted-foreground">({count})</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
