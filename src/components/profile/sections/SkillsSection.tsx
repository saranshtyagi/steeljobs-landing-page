import { useState } from "react";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Wrench, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SKILL_SUGGESTIONS = [
  "JavaScript", "React", "Python", "Java", "Node.js", "SQL",
  "TypeScript", "HTML/CSS", "Git", "AWS", "Docker", "MongoDB",
  "Machine Learning", "Data Analysis", "Communication", "Problem Solving",
  "Leadership", "Project Management", "Excel", "C++", "C#", ".NET"
];

const SkillsSection = () => {
  const { profile, updateProfile } = useCandidateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const handleOpenEdit = () => {
    setSkills(profile?.skills || []);
    setIsEditing(true);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills(prev => [...prev, skill.trim()]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ skills });
    setIsEditing(false);
  };

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    s => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
  ).slice(0, 6);

  return (
    <div id="skills" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Key Skills
        </h2>
        <Button variant="ghost" size="sm" onClick={handleOpenEdit}>
          <Edit2 className="w-4 h-4 mr-1" />
          {profile?.skills?.length ? "Edit" : "Add"}
        </Button>
      </div>

      {profile?.skills && profile.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-3 py-1.5">
              {skill}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Add your key skills to showcase your expertise
        </p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Key Skills</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes(",")) {
                    value.split(",").forEach(s => s.trim() && addSkill(s.trim()));
                  } else {
                    setSkillInput(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && skillInput.trim()) {
                    e.preventDefault();
                    addSkill(skillInput.trim());
                  }
                }}
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {(skillInput ? filteredSuggestions : SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8)).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm flex items-center gap-1"
                  >
                    {skill}
                    <Plus className="w-3 h-3" />
                  </button>
                ))}
              </div>
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

export default SkillsSection;
