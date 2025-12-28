import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateInternships, CandidateInternship } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, Building2, Trash2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const InternshipsSection = () => {
  const { t } = useTranslation();
  const { internships, isLoading, addInternship, updateInternship, deleteInternship } = useCandidateInternships();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<CandidateInternship | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    role: "",
    description: "",
    skills_learned: [] as string[],
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const [skillInput, setSkillInput] = useState("");

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      company_name: "",
      role: "",
      description: "",
      skills_learned: [],
      start_date: "",
      end_date: "",
      is_current: false,
    });
    setIsEditing(true);
  };

  const openEditDialog = (item: CandidateInternship) => {
    setEditingItem(item);
    setFormData({
      company_name: item.company_name,
      role: item.role,
      description: item.description || "",
      skills_learned: item.skills_learned || [],
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      is_current: item.is_current || false,
    });
    setIsEditing(true);
  };

  const addSkillLearned = (skill: string) => {
    if (skill.trim() && !formData.skills_learned.includes(skill.trim())) {
      setFormData((prev) => ({ ...prev, skills_learned: [...prev.skills_learned, skill.trim()] }));
    }
    setSkillInput("");
  };

  const removeSkillLearned = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills_learned: prev.skills_learned.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    const data = {
      company_name: formData.company_name,
      role: formData.role,
      description: formData.description || null,
      skills_learned: formData.skills_learned.length > 0 ? formData.skills_learned : null,
      start_date: formData.start_date || null,
      end_date: formData.is_current ? null : formData.end_date || null,
      is_current: formData.is_current,
    };

    if (editingItem) {
      await updateInternship.mutateAsync({ id: editingItem.id, ...data });
    } else {
      await addInternship.mutateAsync(data);
    }
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("candidate.profile.sections.internships.deleteConfirm"))) {
      await deleteInternship.mutateAsync(id);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";
    try {
      return format(new Date(date), "MMM yyyy");
    } catch {
      return date;
    }
  };

  return (
    <div id="internships" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          {t("candidate.profile.sections.internships.title")}
        </h2>
        <Button variant="ghost" size="sm" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-20 bg-muted rounded-lg" />
      ) : internships.length > 0 ? (
        <div className="space-y-4">
          {internships.map((intern) => (
            <div key={intern.id} className="border border-border rounded-lg p-4 relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(intern)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(intern.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{intern.role}</h3>
                  <p className="text-sm text-muted-foreground">{intern.company_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(intern.start_date)} -{" "}
                    {intern.is_current
                      ? t("candidate.profile.sections.internships.present")
                      : formatDate(intern.end_date)}
                  </div>
                  {intern.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{intern.description}</p>
                  )}
                  {intern.skills_learned && intern.skills_learned.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {intern.skills_learned.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t("candidate.profile.sections.internships.noInternships")}</p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? t("candidate.profile.sections.internships.editInternship")
                : t("candidate.profile.sections.internships.addInternship")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.internships.companyName")}*</Label>
              <Input
                placeholder={t("candidate.profile.sections.internships.companyName")}
                value={formData.company_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.internships.role")}*</Label>
              <Input
                placeholder={t("candidate.profile.sections.internships.role")}
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.sections.internships.startDate")}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("candidate.profile.sections.internships.endDate")}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  disabled={formData.is_current}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.is_current}
                onCheckedChange={(c) => setFormData((prev) => ({ ...prev, is_current: !!c }))}
              />
              <span className="text-sm">{t("candidate.profile.sections.internships.current")}</span>
            </label>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.internships.description")}</Label>
              <Textarea
                placeholder={t("candidate.profile.sections.internships.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.internships.skillsLearned")}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t("candidate.profile.sections.internships.addSkill")}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkillLearned(skillInput))}
                />
                <Button type="button" onClick={() => addSkillLearned(skillInput)}>
                  {t("common.add")}
                </Button>
              </div>
              {formData.skills_learned.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_learned.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSkillLearned(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                addInternship.isPending || updateInternship.isPending || !formData.company_name || !formData.role
              }
            >
              {addInternship.isPending || updateInternship.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipsSection;
