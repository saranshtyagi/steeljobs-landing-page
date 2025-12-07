import { useState } from "react";
import { useCandidateProjects, CandidateProject } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, FolderGit2, Trash2, ExternalLink, Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ProjectsSection = () => {
  const { projects, isLoading, addProject, updateProject, deleteProject } = useCandidateProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<CandidateProject | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills_used: [] as string[],
    github_url: "",
    live_url: "",
    start_date: "",
    end_date: "",
  });
  const [skillInput, setSkillInput] = useState("");

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", skills_used: [], github_url: "", live_url: "", start_date: "", end_date: "" });
    setIsEditing(true);
  };

  const openEditDialog = (item: CandidateProject) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      skills_used: item.skills_used || [],
      github_url: item.github_url || "",
      live_url: item.live_url || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
    });
    setIsEditing(true);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills_used.includes(skill.trim())) {
      setFormData(prev => ({ ...prev, skills_used: [...prev.skills_used, skill.trim()] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills_used: prev.skills_used.filter(s => s !== skill) }));
  };

  const handleSave = async () => {
    const data = {
      title: formData.title,
      description: formData.description || null,
      skills_used: formData.skills_used.length > 0 ? formData.skills_used : null,
      github_url: formData.github_url || null,
      live_url: formData.live_url || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingItem) {
      await updateProject.mutateAsync({ id: editingItem.id, ...data });
    } else {
      await addProject.mutateAsync(data);
    }
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this project?")) {
      await deleteProject.mutateAsync(id);
    }
  };

  return (
    <div id="projects" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-primary" />
          Projects
        </h2>
        <Button variant="ghost" size="sm" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-20 bg-muted rounded-lg" />
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="border border-border rounded-lg p-4 relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(proj)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(proj.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FolderGit2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{proj.title}</h3>
                  {proj.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Github className="w-3 h-3" />
                        GitHub
                      </a>
                    )}
                    {proj.live_url && (
                      <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Live Demo
                      </a>
                    )}
                  </div>
                  {proj.skills_used && proj.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.skills_used.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Add your projects to showcase your work</p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Title*</Label>
              <Input
                placeholder="Project name"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your project"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Technologies/Skills Used</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
                />
                <Button type="button" onClick={() => addSkill(skillInput)}>Add</Button>
              </div>
              {formData.skills_used.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_used.map((skill) => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input
                placeholder="https://github.com/..."
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Live Demo URL</Label>
              <Input
                placeholder="https://..."
                value={formData.live_url}
                onChange={(e) => setFormData(prev => ({ ...prev, live_url: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={addProject.isPending || updateProject.isPending || !formData.title}
            >
              {(addProject.isPending || updateProject.isPending) ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsSection;
