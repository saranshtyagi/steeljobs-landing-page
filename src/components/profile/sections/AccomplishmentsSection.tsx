import { useState } from "react";
import { useCandidateAccomplishments, CandidateAccomplishment } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, Award, Trash2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const ACCOMPLISHMENT_TYPES = [
  { value: "certification", label: "Certification" },
  { value: "award", label: "Award" },
  { value: "leadership", label: "Clubs & Leadership" },
];

const AccomplishmentsSection = () => {
  const { accomplishments, isLoading, addAccomplishment, deleteAccomplishment } = useCandidateAccomplishments();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: "certification",
    title: "",
    description: "",
    issuing_org: "",
    issue_date: "",
    expiry_date: "",
    credential_url: "",
  });

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    await addAccomplishment.mutateAsync({
      type: formData.type,
      title: formData.title,
      description: formData.description || null,
      issuing_org: formData.issuing_org || null,
      issue_date: formData.issue_date || null,
      expiry_date: formData.expiry_date || null,
      credential_url: formData.credential_url || null,
    });
    setFormData({ type: "certification", title: "", description: "", issuing_org: "", issue_date: "", expiry_date: "", credential_url: "" });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this accomplishment?")) {
      await deleteAccomplishment.mutateAsync(id);
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

  const certifications = accomplishments.filter(a => a.type === "certification");
  const awards = accomplishments.filter(a => a.type === "award");
  const leadership = accomplishments.filter(a => a.type === "leadership");

  const renderItems = (items: CandidateAccomplishment[], typeLabel: string) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{typeLabel}</h4>
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between p-3 border border-border rounded-lg group">
          <div>
            <span className="font-medium text-foreground">{item.title}</span>
            {item.issuing_org && (
              <p className="text-sm text-muted-foreground">{item.issuing_org}</p>
            )}
            {item.issue_date && (
              <p className="text-xs text-muted-foreground mt-1">{formatDate(item.issue_date)}</p>
            )}
            {item.credential_url && (
              <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                <ExternalLink className="w-3 h-3" />
                View Credential
              </a>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div id="accomplishments" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Accomplishments
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-20 bg-muted rounded-lg" />
      ) : accomplishments.length > 0 ? (
        <div className="space-y-6">
          {certifications.length > 0 && renderItems(certifications, "Certifications")}
          {awards.length > 0 && renderItems(awards, "Awards")}
          {leadership.length > 0 && renderItems(leadership, "Clubs & Leadership")}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Add certifications, awards, and leadership roles</p>
      )}

      {/* Add Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Accomplishment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type*</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOMPLISHMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title*</Label>
              <Input
                placeholder="e.g., AWS Certified Developer"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Issuing Organization</Label>
              <Input
                placeholder="e.g., Amazon Web Services"
                value={formData.issuing_org}
                onChange={(e) => setFormData(prev => ({ ...prev, issuing_org: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              {formData.type === "certification" && (
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </div>
              )}
            </div>
            {formData.type === "certification" && (
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.credential_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, credential_url: e.target.value }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addAccomplishment.isPending || !formData.title.trim()}>
              {addAccomplishment.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccomplishmentsSection;
