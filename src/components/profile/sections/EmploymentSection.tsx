import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateEmployment, CandidateEmployment } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, Briefcase, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const EmploymentSection = () => {
  const { t } = useTranslation();
  const { employment, isLoading, addEmployment, updateEmployment, deleteEmployment } = useCandidateEmployment();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<CandidateEmployment | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    designation: "",
    department: "",
    description: "",
    achievements: "",
    start_date: "",
    end_date: "",
    is_current: false,
    current_salary: "",
    notice_period: "",
  });

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      company_name: "", designation: "", department: "", description: "",
      achievements: "", start_date: "", end_date: "", is_current: false,
      current_salary: "", notice_period: "",
    });
    setIsEditing(true);
  };

  const openEditDialog = (item: CandidateEmployment) => {
    setEditingItem(item);
    setFormData({
      company_name: item.company_name,
      designation: item.designation,
      department: item.department || "",
      description: item.description || "",
      achievements: item.achievements || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      is_current: item.is_current || false,
      current_salary: item.current_salary?.toString() || "",
      notice_period: item.notice_period || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const data = {
      company_name: formData.company_name,
      designation: formData.designation,
      department: formData.department || null,
      description: formData.description || null,
      achievements: formData.achievements || null,
      start_date: formData.start_date || null,
      end_date: formData.is_current ? null : (formData.end_date || null),
      is_current: formData.is_current,
      current_salary: formData.current_salary ? parseInt(formData.current_salary) : null,
      notice_period: formData.notice_period || null,
    };

    if (editingItem) {
      await updateEmployment.mutateAsync({ id: editingItem.id, ...data });
    } else {
      await addEmployment.mutateAsync(data);
    }
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("candidate.profile.deleteEmployment"))) {
      await deleteEmployment.mutateAsync(id);
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
    <div id="employment" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          {t("candidate.profile.employment")}
        </h2>
        <Button variant="ghost" size="sm" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-20 bg-muted rounded-lg" />
      ) : employment.length > 0 ? (
        <div className="space-y-4">
          {employment.map((emp) => (
            <div key={emp.id} className="border border-border rounded-lg p-4 relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(emp)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(emp.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{emp.designation}</h3>
                    {emp.is_current && <Badge variant="secondary" className="text-xs">{t("candidate.profile.current")}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{emp.company_name}</p>
                  {emp.department && (
                    <p className="text-xs text-muted-foreground">{emp.department}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(emp.start_date)} - {emp.is_current ? t("candidate.profile.present") : formatDate(emp.end_date)}
                  </div>
                  {emp.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{emp.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t("candidate.profile.addWorkExperience")}</p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? t("candidate.profile.editEmployment") : t("candidate.profile.addEmployment")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("candidate.profile.companyName")}*</Label>
              <Input
                placeholder={t("candidate.profile.companyNamePlaceholder")}
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.designation")}*</Label>
              <Input
                placeholder={t("candidate.profile.designationPlaceholder")}
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.department")}</Label>
              <Input
                placeholder={t("candidate.profile.departmentPlaceholder")}
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.startDate")}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("candidate.profile.endDate")}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  disabled={formData.is_current}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.is_current}
                onCheckedChange={(c) => setFormData(prev => ({ ...prev, is_current: !!c }))}
              />
              <span className="text-sm">{t("candidate.profile.currentlyWorkingHere")}</span>
            </label>
            <div className="space-y-2">
              <Label>{t("candidate.profile.rolesResponsibilities")}</Label>
              <Textarea
                placeholder={t("candidate.profile.describeRole")}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.keyAchievements")}</Label>
              <Textarea
                placeholder={t("candidate.profile.achievementsPlaceholder")}
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                rows={2}
              />
            </div>
            {formData.is_current && (
              <>
                <div className="space-y-2">
                  <Label>{t("candidate.profile.currentSalary")}</Label>
                  <Input
                    type="number"
                    placeholder={t("candidate.profile.currentSalaryPlaceholder")}
                    value={formData.current_salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_salary: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("candidate.profile.noticePeriod")}</Label>
                  <Input
                    placeholder={t("candidate.profile.noticePeriodPlaceholder")}
                    value={formData.notice_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, notice_period: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>{t("common.cancel")}</Button>
            <Button 
              onClick={handleSave} 
              disabled={addEmployment.isPending || updateEmployment.isPending || !formData.company_name || !formData.designation}
            >
              {(addEmployment.isPending || updateEmployment.isPending) ? t("candidate.profile.saving") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmploymentSection;