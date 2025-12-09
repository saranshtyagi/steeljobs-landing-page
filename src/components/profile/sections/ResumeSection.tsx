import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Upload, FileText, RefreshCw, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ResumeSection = () => {
  const { t } = useTranslation();
  const { profile, updateProfile } = useCandidateProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // For demo, create a data URL (in production, upload to storage)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const resumeUrl = event.target?.result as string;
        await updateProfile.mutateAsync({ resume_url: resumeUrl });
        toast.success(t("common.success"));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(t("common.error"));
      setIsUploading(false);
    }
  };

  const handleReParse = async () => {
    if (!profile?.resume_url) {
      toast.error(t("common.error"));
      return;
    }

    setIsParsing(true);
    try {
      // Call the parse-resume edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ resumeText: "Re-parsing existing resume" }),
      });

      if (response.ok) {
        toast.success(t("common.success"));
      } else {
        toast.error(t("common.error"));
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast.error(t("common.error"));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t("candidate.profile.resume")}
        </h2>
      </div>

      {profile?.resume_url ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{t("candidate.profile.resumeUploaded")}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("candidate.profile.lastUpdated")}: {profile.updated_at ? format(new Date(profile.updated_at), "dd MMM yyyy") : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <label className="flex-1">
              <Button variant="outline" className="w-full" disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? t("candidate.profile.uploading") : t("candidate.profile.updateResume")}
              </Button>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                className="hidden" 
                onChange={handleResumeUpload}
                disabled={isUploading}
              />
            </label>
            <Button variant="outline" onClick={handleReParse} disabled={isParsing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isParsing ? "animate-spin" : ""}`} />
              {isParsing ? t("candidate.profile.parsing") : t("candidate.profile.reParse")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">{t("candidate.profile.uploadResumePrompt")}</p>
          <label>
            <Button disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? t("candidate.profile.uploading") : t("candidate.profile.uploadResume")}
            </Button>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx" 
              className="hidden" 
              onChange={handleResumeUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;