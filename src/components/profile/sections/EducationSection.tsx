import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateEducation, CandidateEducation } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, GraduationCap, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEGREE_OPTIONS = [
  { value: "doctorate", label: "Doctorate/PhD" },
  { value: "masters", label: "Masters/Post-Graduation" },
  { value: "graduation", label: "Graduation/Diploma" },
  { value: "12th", label: "12th" },
  { value: "10th", label: "10th" },
];

const EducationSection = () => {
  const { t } = useTranslation();
  const { education, isLoading, addEducation, updateEducation, deleteEducation } = useCandidateEducation();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<CandidateEducation | null>(null);
  const [formData, setFormData] = useState({
    degree_level: "",
    course: "",
    course_type: "",
    specialization: "",
    university: "",
    starting_year: "",
    passing_year: "",
    grading_system: "",
    grade_value: "",
    is_highest: false,
  });

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      degree_level: "",
      course: "",
      course_type: "",
      specialization: "",
      university: "",
      starting_year: "",
      passing_year: "",
      grading_system: "",
      grade_value: "",
      is_highest: education.length === 0,
    });
    setIsEditing(true);
  };

  const openEditDialog = (item: CandidateEducation) => {
    setEditingItem(item);
    setFormData({
      degree_level: item.degree_level || "",
      course: item.course || "",
      course_type: item.course_type || "",
      specialization: item.specialization || "",
      university: item.university || "",
      starting_year: item.starting_year?.toString() || "",
      passing_year: item.passing_year?.toString() || "",
      grading_system: item.grading_system || "",
      grade_value: item.grade_value || "",
      is_highest: item.is_highest || false,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const data = {
      degree_level: formData.degree_level,
      course: formData.course || null,
      course_type: formData.course_type || null,
      specialization: formData.specialization || null,
      university: formData.university || null,
      starting_year: formData.starting_year ? parseInt(formData.starting_year) : null,
      passing_year: formData.passing_year ? parseInt(formData.passing_year) : null,
      grading_system: formData.grading_system || null,
      grade_value: formData.grade_value || null,
      is_highest: formData.is_highest,
    };

    if (editingItem) {
      await updateEducation.mutateAsync({ id: editingItem.id, ...data });
    } else {
      await addEducation.mutateAsync(data);
    }
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("common.confirm"))) {
      await deleteEducation.mutateAsync(id);
    }
  };

  return (
    <div id="education" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          {t("candidate.profile.education")}
        </h2>
        <Button variant="ghost" size="sm" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded-lg" />
        </div>
      ) : education.length > 0 ? (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="border border-border rounded-lg p-4 relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(edu)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(edu.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground">
                      {edu.course || DEGREE_OPTIONS.find(d => d.value === edu.degree_level)?.label || edu.degree_level}
                    </h3>
                    {edu.is_highest && <Badge variant="secondary" className="text-xs">{t("candidate.profile.highest")}</Badge>}
                  </div>
                  {edu.specialization && (
                    <p className="text-sm text-muted-foreground">{edu.specialization}</p>
                  )}
                  {edu.university && (
                    <p className="text-sm text-muted-foreground">{edu.university}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {edu.passing_year && <span>{t("candidate.profile.passed")}: {edu.passing_year}</span>}
                    {edu.course_type && <span>{edu.course_type}</span>}
                    {edu.grade_value && <span>{edu.grade_value}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t("candidate.profile.addEducationDetails")}</p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? t("candidate.profile.editEducation") : t("candidate.profile.addEducation")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("candidate.profile.degreeLevel")}*</Label>
              <Select value={formData.degree_level} onValueChange={(v) => setFormData(prev => ({ ...prev, degree_level: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("candidate.profile.selectDegree")} />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.course")}</Label>
              <Input
                placeholder={t("candidate.profile.coursePlaceholder")}
                value={formData.course}
                onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.specialization")}</Label>
              <Input
                placeholder={t("candidate.profile.specializationPlaceholder")}
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.universityInstitute")}</Label>
              <Input
                placeholder={t("candidate.profile.universityPlaceholder")}
                value={formData.university}
                onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.startingYear")}</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={formData.starting_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, starting_year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("candidate.profile.passingYear")}</Label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={formData.passing_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, passing_year: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.courseType")}</Label>
              <Select value={formData.course_type} onValueChange={(v) => setFormData(prev => ({ ...prev, course_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("candidate.profile.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">{t("candidate.profile.fullTime")}</SelectItem>
                  <SelectItem value="Part Time">{t("candidate.profile.partTime")}</SelectItem>
                  <SelectItem value="Distance Learning">{t("candidate.profile.distanceLearning")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.gradingSystem")}</Label>
                <Select value={formData.grading_system} onValueChange={(v) => setFormData(prev => ({ ...prev, grading_system: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cgpa_10">CGPA (Scale 10)</SelectItem>
                    <SelectItem value="cgpa_4">GPA (Scale 4)</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("candidate.profile.gradeMarks")}</Label>
                <Input
                  placeholder="e.g., 8.5"
                  value={formData.grade_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade_value: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={addEducation.isPending || updateEducation.isPending || !formData.degree_level}>
              {(addEducation.isPending || updateEducation.isPending) ? t("candidate.profile.saving") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducationSection;