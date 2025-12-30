import { useState } from "react";
import { CandidateProfile, useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useCandidateEducation } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CheckCircle, Edit2, MapPin, Phone, Mail, Plus, User, Cake } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import EditBasicInfoModal from "./EditBasicInfoModal";

interface Props {
  profile: CandidateProfile;
  completionPercentage: number;
  onEditBasicInfo: () => void;
  onAddMissingDetails: () => void;
}

const ProfileHeader = ({ profile, completionPercentage, onEditBasicInfo, onAddMissingDetails }: Props) => {
  const { t } = useTranslation();
  const { profile: authProfile } = useAuth();
  const { education } = useCandidateEducation();
  const { updateProfile } = useCandidateProfile();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const highestEducation = education.find(e => e.is_highest) || education[0];
  
  const missingDetails = [];
  if (!profile.gender) missingDetails.push(t("candidate.profile.gender", "Gender"));
  if (!profile.date_of_birth) missingDetails.push(t("candidate.profile.birthday", "Birthday"));
  if (!profile.profile_summary) missingDetails.push(t("candidate.profile.summary"));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const photoUrl = event.target?.result as string;
        await updateProfile.mutateAsync({ profile_photo_url: photoUrl });
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Photo upload error:", error);
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
      
      <div className="px-6 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 -mt-12">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
              <AvatarImage src={profile.profile_photo_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {(profile.full_name || authProfile?.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label 
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
              />
            </label>
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.full_name || authProfile?.name || t("candidate.profile.yourName", "Your Name")}
                </h1>
                {profile.headline && (
                  <p className="text-muted-foreground">{profile.headline}</p>
                )}
                {highestEducation && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {highestEducation.course || highestEducation.degree_level}
                    {highestEducation.university && ` • ${highestEducation.university}`}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="w-4 h-4 mr-1" />
                {t("common.edit")}
              </Button>
            </div>

            {/* Details Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {profile.location && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.mobile_number && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {profile.mobile_number}
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </span>
              )}
              {authProfile?.email && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {authProfile.email}
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </span>
              )}
              {profile.gender && profile.gender !== "prefer_not_to_say" && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <User className="w-4 h-4" />
                  {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </span>
              )}
              {profile.date_of_birth && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Cake className="w-4 h-4" />
                  {format(new Date(profile.date_of_birth), "dd MMM yyyy")}
                </span>
              )}
            </div>

            {/* Missing Details */}
            {missingDetails.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">{t("common.add", "Add")}:</span>
                {missingDetails.map((detail) => (
                  <Badge 
                    key={detail} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {detail}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Completion Meter */}
          <div className="flex-shrink-0 flex flex-col items-center lg:items-end gap-2">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - completionPercentage / 100)}`}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">{completionPercentage}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">{t("candidate.profile.completion")}</p>
            {completionPercentage < 100 && (
              <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={onAddMissingDetails}>
                {t("candidate.profile.addMissingDetails")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Basic Info Modal */}
      <EditBasicInfoModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
    </div>
  );
};

export default ProfileHeader;
