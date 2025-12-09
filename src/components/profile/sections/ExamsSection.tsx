import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateExams } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ExamsSection = () => {
  const { t } = useTranslation();
  const { exams, isLoading, addExam, deleteExam } = useCandidateExams();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    exam_name: "",
    score: "",
    rank: "",
    year: "",
  });

  const handleSave = async () => {
    if (!formData.exam_name.trim()) return;
    await addExam.mutateAsync({
      exam_name: formData.exam_name,
      score: formData.score || null,
      rank: formData.rank || null,
      year: formData.year ? parseInt(formData.year) : null,
    });
    setFormData({ exam_name: "", score: "", rank: "", year: "" });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("candidate.profile.deleteExam"))) {
      await deleteExam.mutateAsync(id);
    }
  };

  return (
    <div id="exams" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {t("candidate.profile.exams")}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-1" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-16 bg-muted rounded-lg" />
      ) : exams.length > 0 ? (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div key={exam.id} className="flex items-center justify-between p-3 border border-border rounded-lg group">
              <div>
                <span className="font-medium text-foreground">{exam.exam_name}</span>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  {exam.score && <span>{t("candidate.profile.score")}: {exam.score}</span>}
                  {exam.rank && <span>{t("candidate.profile.rank")}: {exam.rank}</span>}
                  {exam.year && <span>{t("candidate.profile.year")}: {exam.year}</span>}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => handleDelete(exam.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t("candidate.profile.addExamsPrompt")}</p>
      )}

      {/* Add Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("candidate.profile.addCompetitiveExam")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("candidate.profile.examName")}*</Label>
              <Input
                placeholder={t("candidate.profile.examNamePlaceholder")}
                value={formData.exam_name}
                onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.score")}</Label>
                <Input
                  placeholder={t("candidate.profile.scorePlaceholder")}
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("candidate.profile.rank")}</Label>
                <Input
                  placeholder={t("candidate.profile.rankPlaceholder")}
                  value={formData.rank}
                  onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.year")}</Label>
              <Input
                type="number"
                placeholder="2024"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAdding(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={addExam.isPending || !formData.exam_name.trim()}>
              {addExam.isPending ? t("candidate.profile.adding") : t("common.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamsSection;