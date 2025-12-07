import { useState } from "react";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Edit2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SummarySection = () => {
  const { profile, updateProfile } = useCandidateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(profile?.profile_summary || "");

  const handleOpenEdit = () => {
    setSummary(profile?.profile_summary || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ profile_summary: summary });
    setIsEditing(false);
  };

  return (
    <div id="summary" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Profile Summary
        </h2>
        <Button variant="ghost" size="sm" onClick={handleOpenEdit}>
          <Edit2 className="w-4 h-4 mr-1" />
          {profile?.profile_summary ? "Edit" : "Add"}
        </Button>
      </div>

      {profile?.profile_summary ? (
        <p className="text-muted-foreground whitespace-pre-wrap">{profile.profile_summary}</p>
      ) : (
        <p className="text-muted-foreground text-sm">
          Write a brief summary about yourself, your experience, and career goals
        </p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                placeholder="Write about yourself, your skills, experience, and what you're looking for..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {summary.length} characters {summary.length < 50 && "(minimum 50 recommended)"}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SummarySection;
