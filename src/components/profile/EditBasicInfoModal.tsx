import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditBasicInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBasicInfoModal = ({ open, onOpenChange }: EditBasicInfoModalProps) => {
  const { t } = useTranslation();
  const { profile: authProfile } = useAuth();
  const { profile, updateProfile } = useCandidateProfile();

  const [formData, setFormData] = useState({
    location: "",
    mobile_number: "",
    gender: "",
    date_of_birth: "",
    profile_summary: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (open && profile) {
      setFormData({
        location: profile.location || "",
        mobile_number: profile.mobile_number || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        profile_summary: profile.profile_summary || "",
      });
      setErrors({});
    }
  }, [open, profile]);

  // Validate mobile number format: +91 followed by exactly 10 digits
  const isValidMobile = (mobile: string): boolean => {
    const mobileRegex = /^\+91[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  // Handle mobile number input with +91 prefix
  const handleMobileChange = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    
    if (!cleaned.startsWith("+91")) {
      if (cleaned.startsWith("91") && cleaned.length > 2) {
        cleaned = "+" + cleaned;
      } else if (cleaned.startsWith("+")) {
        cleaned = "+91" + cleaned.slice(1).replace(/^\d{0,2}/, "");
      } else if (cleaned.length > 0 && !cleaned.startsWith("+")) {
        cleaned = "+91" + cleaned.replace(/^91/, "");
      }
    }
    
    if (cleaned.length > 13) {
      cleaned = cleaned.slice(0, 13);
    }
    
    setFormData(prev => ({ ...prev, mobile_number: cleaned }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.location.trim()) {
      newErrors.location = "City/Location is required";
    }
    
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
    } else if (!isValidMobile(formData.mobile_number)) {
      newErrors.mobile_number = "Enter a valid 10-digit mobile number starting with +91";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      await updateProfile.mutateAsync({
        location: formData.location.trim(),
        mobile_number: formData.mobile_number,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        profile_summary: formData.profile_summary.trim() || null,
      });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date_of_birth: format(date, "yyyy-MM-dd") }));
    }
    setDatePickerOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Basic Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email Address</Label>
            <Input
              value={authProfile?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="mobile"
                value={formData.mobile_number}
                onChange={(e) => handleMobileChange(e.target.value)}
                onFocus={() => {
                  if (!formData.mobile_number) {
                    setFormData(prev => ({ ...prev, mobile_number: "+91" }));
                  }
                }}
                className={cn("pr-10", errors.mobile_number && "border-destructive")}
                placeholder="+91 9876543210"
                maxLength={13}
              />
              {isValidMobile(formData.mobile_number) && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.mobile_number && (
              <p className="text-sm text-destructive">{errors.mobile_number}</p>
            )}
          </div>

          {/* Location/City */}
          <div className="space-y-2">
            <Label htmlFor="location">City/Location <span className="text-destructive">*</span></Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className={errors.location ? "border-destructive" : ""}
              placeholder="e.g., Mumbai, Maharashtra"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_of_birth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_of_birth
                    ? format(new Date(formData.date_of_birth), "dd MMM yyyy")
                    : "Select your birthday"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1950}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Profile Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Profile Summary</Label>
            <Textarea
              id="summary"
              value={formData.profile_summary}
              onChange={(e) => setFormData(prev => ({ ...prev, profile_summary: e.target.value }))}
              placeholder="Write a brief summary about yourself, your experience, and career goals..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.profile_summary.length} characters
              {formData.profile_summary.length < 50 && formData.profile_summary.length > 0 && 
                " (minimum 50 recommended)"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBasicInfoModal;
