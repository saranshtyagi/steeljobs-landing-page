import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateLanguages, CandidateLanguage } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, Languages, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Proficient", "Expert", "Native"];

const LanguagesSection = () => {
  const { t } = useTranslation();
  const { languages, isLoading, addLanguage, deleteLanguage } = useCandidateLanguages();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    language: "",
    proficiency: "",
    can_read: true,
    can_write: true,
    can_speak: true,
  });

  const handleSave = async () => {
    if (!formData.language.trim()) return;
    await addLanguage.mutateAsync({
      language: formData.language,
      proficiency: formData.proficiency || null,
      can_read: formData.can_read,
      can_write: formData.can_write,
      can_speak: formData.can_speak,
    });
    setFormData({ language: "", proficiency: "", can_read: true, can_write: true, can_speak: true });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("common.confirm"))) {
      await deleteLanguage.mutateAsync(id);
    }
  };

  return (
    <div id="languages" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          {t("candidate.profile.languages")}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-12 bg-muted rounded-lg" />
      ) : languages.length > 0 ? (
        <div className="space-y-3">
          {languages.map((lang) => (
            <div key={lang.id} className="flex items-center justify-between p-3 border border-border rounded-lg group">
              <div>
                <span className="font-medium text-foreground">{lang.language}</span>
                {lang.proficiency && <span className="text-sm text-muted-foreground ml-2">• {lang.proficiency}</span>}
                <div className="flex gap-2 mt-1">
                  {lang.can_read && (
                    <Badge variant="outline" className="text-xs">
                      {t("candidate.profile.sections.languages.canRead")}
                    </Badge>
                  )}
                  {lang.can_write && (
                    <Badge variant="outline" className="text-xs">
                      {t("candidate.profile.sections.languages.canWrite")}
                    </Badge>
                  )}
                  {lang.can_speak && (
                    <Badge variant="outline" className="text-xs">
                      {t("candidate.profile.sections.languages.canSpeak")}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => handleDelete(lang.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t("candidate.profile.sections.languages.noLanguages")}</p>
      )}

      {/* Add Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("candidate.profile.sections.languages.addLanguage")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.languages.language")}*</Label>
              <Input
                placeholder={t("candidate.profile.sections.languages.language")}
                value={formData.language}
                onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.languages.proficiency")}</Label>
              <Select
                value={formData.proficiency}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, proficiency: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("candidate.profile.sections.languages.proficiency")} />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.can_read}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, can_read: !!c }))}
                />
                <span className="text-sm">{t("candidate.profile.sections.languages.canRead")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.can_write}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, can_write: !!c }))}
                />
                <span className="text-sm">{t("candidate.profile.sections.languages.canWrite")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.can_speak}
                  onCheckedChange={(c) => setFormData((prev) => ({ ...prev, can_speak: !!c }))}
                />
                <span className="text-sm">{t("candidate.profile.sections.languages.canSpeak")}</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={addLanguage.isPending || !formData.language.trim()}>
              {addLanguage.isPending ? t("common.loading") : t("common.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LanguagesSection;
