import { useState } from "react";
import { OnboardingData } from "@/pages/onboarding/CandidateOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, X, Briefcase, GraduationCap, Loader2 } from "lucide-react";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onContinue: () => void;
  isSaving: boolean;
  userName: string;
}

const CITY_SUGGESTIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Noida", "Gurgaon",
  "Jaipur", "Lucknow", "Chandigarh", "Indore", "Bhopal"
];

const OnboardingBasicDetails = ({ data, updateData, onContinue, isSaving, userName }: Props) => {
  const [cityInput, setCityInput] = useState(data.currentCity);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCities = CITY_SUGGESTIONS.filter(city =>
    city.toLowerCase().includes(cityInput.toLowerCase()) && city !== data.currentCity
  );

  const selectCity = (city: string) => {
    updateData({ currentCity: city });
    setCityInput(city);
    setShowCitySuggestions(false);
  };

  const clearCity = () => {
    updateData({ currentCity: "" });
    setCityInput("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!data.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[+]?[\d\s-]{10,}$/.test(data.mobileNumber)) {
      newErrors.mobileNumber = "Enter a valid mobile number";
    }
    if (!data.workStatus) {
      newErrors.workStatus = "Please select your work status";
    }
    if (!data.currentCity.trim()) {
      newErrors.currentCity = "Current city is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue();
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {userName?.split(" ")[0] || "there"}!
        </h1>
        <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-400">
            Your account is created successfully. Let's get started!
          </span>
        </div>
        <p className="text-muted-foreground mt-3">
          Search & apply to jobs from India's No.1 Job Site
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground">
            Full name<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className={`pr-10 ${errors.fullName ? "border-destructive" : ""}`}
              placeholder="Enter your full name"
            />
            {data.fullName && !errors.fullName && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobileNumber" className="text-foreground">
            Mobile number<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="mobileNumber"
              value={data.mobileNumber}
              onChange={(e) => updateData({ mobileNumber: e.target.value })}
              className={`pr-10 ${errors.mobileNumber ? "border-destructive" : ""}`}
              placeholder="+91 9999999999"
            />
            {data.mobileNumber && !errors.mobileNumber && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recruiters will contact you on this number
          </p>
          {errors.mobileNumber && (
            <p className="text-sm text-destructive">{errors.mobileNumber}</p>
          )}
        </div>

        {/* Work Status */}
        <div className="space-y-3">
          <Label className="text-foreground">
            Work status<span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateData({ workStatus: "experienced" })}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                data.workStatus === "experienced"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">I'm experienced</p>
                <p className="text-xs text-muted-foreground">
                  I have work experience (excluding internships)
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateData({ workStatus: "fresher" })}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                data.workStatus === "fresher"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">I'm a fresher</p>
                <p className="text-xs text-muted-foreground">
                  I am a student / Haven't worked after graduation
                </p>
              </div>
            </button>
          </div>
          {errors.workStatus && (
            <p className="text-sm text-destructive">{errors.workStatus}</p>
          )}
        </div>

        {/* Current City */}
        <div className="space-y-2">
          <Label htmlFor="currentCity" className="text-foreground">
            Current city<span className="text-destructive">*</span>
          </Label>
          
          {data.currentCity ? (
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className="px-3 py-2 text-sm bg-foreground text-background"
              >
                {data.currentCity}
                <button onClick={clearCity} className="ml-2 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          ) : (
            <div className="relative">
              <Input
                id="currentCity"
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                className={errors.currentCity ? "border-destructive" : ""}
                placeholder="Type to search city"
              />
              
              {showCitySuggestions && filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCities.slice(0, 6).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => selectCity(city)}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            This helps recruiters know your location preferences
          </p>
          {errors.currentCity && (
            <p className="text-sm text-destructive">{errors.currentCity}</p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground">
          By clicking Register, you agree to the{" "}
          <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
          {" & "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          {" "}of SteelJobs.com
        </p>

        {/* Submit Button */}
        <Button 
          onClick={handleContinue} 
          className="w-full sm:w-auto px-8"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save and continue"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingBasicDetails;
