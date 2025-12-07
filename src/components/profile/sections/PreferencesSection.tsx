import { useState } from "react";
import { CandidateProfile, useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Briefcase, MapPin, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  profile: CandidateProfile;
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const AVAILABILITY_OPTIONS = ["Immediate", "15 Days", "1 Month", "2 Months", "3 Months"];

const PreferencesSection = ({ profile }: Props) => {
  const { updateProfile } = useCandidateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    preferred_job_type: profile.preferred_job_type || [],
    preferred_locations: profile.preferred_locations || [],
    availability: profile.availability || "",
  });
  const [locationInput, setLocationInput] = useState("");

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      preferred_job_type: formData.preferred_job_type,
      preferred_locations: formData.preferred_locations,
      availability: formData.availability,
    });
    setIsEditing(false);
  };

  const toggleJobType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_job_type: prev.preferred_job_type.includes(type)
        ? prev.preferred_job_type.filter(t => t !== type)
        : [...prev.preferred_job_type, type]
    }));
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.preferred_locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, locationInput.trim()]
      }));
      setLocationInput("");
    }
  };

  const removeLocation = (loc: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter(l => l !== loc)
    }));
  };

  const hasData = profile.preferred_job_type?.length || profile.preferred_locations?.length || profile.availability;

  return (
    <div id="preferences" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          Career Preferences
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4 mr-1" />
          {hasData ? "Edit" : "Add"}
        </Button>
      </div>

      {hasData ? (
        <div className="space-y-4">
          {profile.preferred_job_type && profile.preferred_job_type.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Preferred Job Type</p>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_job_type.map((type) => (
                  <Badge key={type} variant="secondary">{type}</Badge>
                ))}
              </div>
            </div>
          )}
          {profile.preferred_locations && profile.preferred_locations.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Preferred Locations
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_locations.map((loc) => (
                  <Badge key={loc} variant="outline">{loc}</Badge>
                ))}
              </div>
            </div>
          )}
          {profile.availability && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Availability
              </p>
              <p className="text-foreground">{profile.availability}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Add your career preferences to help recruiters find you better
        </p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Career Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Job Types */}
            <div className="space-y-3">
              <Label>Preferred Job Type</Label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={formData.preferred_job_type.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleJobType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-3">
              <Label>Preferred Locations</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                />
                <Button type="button" onClick={addLocation}>Add</Button>
              </div>
              {formData.preferred_locations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_locations.map((loc) => (
                    <Badge key={loc} variant="secondary" className="cursor-pointer" onClick={() => removeLocation(loc)}>
                      {loc} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <Label>Availability to Join</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <Badge
                    key={opt}
                    variant={formData.availability === opt ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, availability: opt }))}
                  >
                    {opt}
                  </Badge>
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

export default PreferencesSection;
