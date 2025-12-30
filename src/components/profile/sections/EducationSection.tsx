import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateEducation, CandidateEducation } from "@/hooks/useCandidateData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Plus, GraduationCap, Trash2, MapPin, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { INDIAN_STATES, INDIAN_CITIES } from "@/data/indianLocations";

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
    institution_state: "",
    institution_city: "",
    institution_pincode: "",
  });
  
  // Location state
  const [stateInput, setStateInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Filter states based on input
  const filteredStates = useMemo(() => {
    if (!stateInput) return INDIAN_STATES;
    return INDIAN_STATES.filter(state => 
      state.toLowerCase().includes(stateInput.toLowerCase())
    );
  }, [stateInput]);

  // Filter cities based on selected state and input
  const filteredCities = useMemo(() => {
    const stateCities = formData.institution_state ? INDIAN_CITIES[formData.institution_state] || [] : [];
    if (!cityInput) return stateCities;
    return stateCities.filter(city => 
      city.toLowerCase().includes(cityInput.toLowerCase())
    );
  }, [formData.institution_state, cityInput]);

  // Fetch pincode data
  const fetchPincodeData = async (pincode: string) => {
    if (pincode.length !== 6) return;
    
    setPincodeLoading(true);
    setPincodeError("");
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const fetchedState = postOffice.State;
        const fetchedCity = postOffice.District;
        
        setFormData(prev => ({
          ...prev,
          institution_state: fetchedState,
          institution_city: fetchedCity,
        }));
        setStateInput(fetchedState);
        setCityInput(fetchedCity);
      } else {
        setPincodeError("Invalid pincode");
      }
    } catch (error) {
      setPincodeError("Failed to fetch pincode data");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, institution_pincode: sanitized }));
    setPincodeError("");
    
    if (sanitized.length === 6) {
      fetchPincodeData(sanitized);
    }
  };

  const selectState = (state: string) => {
    setFormData(prev => ({ ...prev, institution_state: state, institution_city: "" }));
    setStateInput(state);
    setCityInput("");
    setShowStateSuggestions(false);
  };

  const clearState = () => {
    setFormData(prev => ({ ...prev, institution_state: "", institution_city: "" }));
    setStateInput("");
    setCityInput("");
  };

  const selectCity = (city: string) => {
    setFormData(prev => ({ ...prev, institution_city: city }));
    setCityInput(city);
    setShowCitySuggestions(false);
  };

  const clearCity = () => {
    setFormData(prev => ({ ...prev, institution_city: "" }));
    setCityInput("");
  };

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
      institution_state: "",
      institution_city: "",
      institution_pincode: "",
    });
    setStateInput("");
    setCityInput("");
    setPincodeError("");
    setIsEditing(true);
  };

  const openEditDialog = (item: CandidateEducation) => {
    setEditingItem(item);
    const state = (item as any).institution_state || "";
    const city = (item as any).institution_city || "";
    const pincode = (item as any).institution_pincode || "";
    
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
      institution_state: state,
      institution_city: city,
      institution_pincode: pincode,
    });
    setStateInput(state);
    setCityInput(city);
    setPincodeError("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.degree_level) {
      toast.error("Please select a degree level");
      return;
    }

    setIsSaving(true);
    
    try {
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
        institution_state: formData.institution_state || null,
        institution_city: formData.institution_city || null,
        institution_pincode: formData.institution_pincode || null,
      };

      if (editingItem) {
        await updateEducation.mutateAsync({ id: editingItem.id, ...data });
      } else {
        await addEducation.mutateAsync(data as any);
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving education:", error);
      toast.error(error?.message || "Failed to save education");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("common.confirm"))) {
      try {
        await deleteEducation.mutateAsync(id);
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete education");
      }
    }
  };

  return (
    <div id="education" className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          {t("candidate.profile.sections.education.title")}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(edu.id)}
                >
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
                      {edu.course ||
                        DEGREE_OPTIONS.find((d) => d.value === edu.degree_level)?.label ||
                        edu.degree_level}
                    </h3>
                    {edu.is_highest && (
                      <Badge variant="secondary" className="text-xs">
                        {t("candidate.profile.sections.education.isHighest")}
                      </Badge>
                    )}
                  </div>
                  {edu.specialization && <p className="text-sm text-muted-foreground">{edu.specialization}</p>}
                  {edu.university && <p className="text-sm text-muted-foreground">{edu.university}</p>}
                  {((edu as any).institution_city || (edu as any).institution_state) && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {[(edu as any).institution_city, (edu as any).institution_state].filter(Boolean).join(", ")}
                      {(edu as any).institution_pincode && ` - ${(edu as any).institution_pincode}`}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {edu.passing_year && (
                      <span>
                        {t("candidate.profile.sections.education.passingYear")}: {edu.passing_year}
                      </span>
                    )}
                    {edu.course_type && <span>{edu.course_type}</span>}
                    {edu.grade_value && <span>{edu.grade_value}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t("candidate.profile.sections.education.noEducation")}</p>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? t("candidate.profile.sections.education.editEducation")
                : t("candidate.profile.sections.education.addEducation")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.education.degreeLevel")}*</Label>
              <Select
                value={formData.degree_level}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, degree_level: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("candidate.profile.sections.education.degreeLevel")} />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.education.course")}</Label>
              <Input
                placeholder={t("candidate.profile.sections.education.course")}
                value={formData.course}
                onChange={(e) => setFormData((prev) => ({ ...prev, course: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.education.specialization")}</Label>
              <Input
                placeholder={t("candidate.profile.sections.education.specialization")}
                value={formData.specialization}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.education.university")}</Label>
              <Input
                placeholder={t("candidate.profile.sections.education.university")}
                value={formData.university}
                onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
              />
            </div>

            {/* Location Fields */}
            <div className="space-y-2">
              <Label>Pincode</Label>
              <div className="relative">
                <Input
                  placeholder="Enter 6-digit pincode"
                  value={formData.institution_pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  maxLength={6}
                />
                {pincodeLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {pincodeError && <p className="text-xs text-destructive">{pincodeError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <div className="relative">
                  {formData.institution_state ? (
                    <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-muted/50">
                      <span className="flex-1 text-sm">{formData.institution_state}</span>
                      <button type="button" onClick={clearState} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder="Search state..."
                        value={stateInput}
                        onChange={(e) => setStateInput(e.target.value)}
                        onFocus={() => setShowStateSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
                      />
                      {showStateSuggestions && filteredStates.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredStates.slice(0, 10).map((state) => (
                            <button
                              key={state}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                              onMouseDown={() => selectState(state)}
                            >
                              {state}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <div className="relative">
                  {formData.institution_city ? (
                    <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-muted/50">
                      <span className="flex-1 text-sm">{formData.institution_city}</span>
                      <button type="button" onClick={clearCity} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder={formData.institution_state ? "Search city..." : "Select state first"}
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onFocus={() => setShowCitySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                        disabled={!formData.institution_state}
                      />
                      {showCitySuggestions && filteredCities.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredCities.slice(0, 10).map((city) => (
                            <button
                              key={city}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                              onMouseDown={() => selectCity(city)}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.sections.education.startingYear")}</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={formData.starting_year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, starting_year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("candidate.profile.sections.education.passingYear")}</Label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={formData.passing_year}
                  onChange={(e) => setFormData((prev) => ({ ...prev, passing_year: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("candidate.profile.sections.education.courseType")}</Label>
              <Select
                value={formData.course_type}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, course_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("candidate.profile.sections.education.courseType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">{t("candidate.profile.sections.education.fullTime")}</SelectItem>
                  <SelectItem value="Part Time">{t("candidate.profile.sections.education.partTime")}</SelectItem>
                  <SelectItem value="Distance Learning">
                    {t("candidate.profile.sections.education.distance")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("candidate.profile.sections.education.gradingSystem")}</Label>
                <Select
                  value={formData.grading_system}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, grading_system: v }))}
                >
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
                <Label>{t("candidate.profile.sections.education.gradeValue")}</Label>
                <Input
                  placeholder="e.g., 8.5"
                  value={formData.grade_value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, grade_value: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.degree_level}
            >
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EducationSection;