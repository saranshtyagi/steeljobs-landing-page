import { useState, useMemo, useEffect, useCallback } from "react";
import { OnboardingData } from "@/pages/onboarding/CandidateOnboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, X, Briefcase, GraduationCap, Loader2, ChevronDown, MapPin } from "lucide-react";
import { INDIAN_STATES, getCitiesByState, getAllCities } from "@/data/indianLocations";

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onContinue: () => void;
  isSaving: boolean;
  userName: string;
}

interface PincodeData {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    District: string;
    State: string;
    Pincode: string;
  }> | null;
}

const OnboardingBasicDetails = ({ data, updateData, onContinue, isSaving, userName }: Props) => {
  const [stateInput, setStateInput] = useState(data.currentState);
  const [cityInput, setCityInput] = useState(data.currentCity);
  const [pincodeInput, setPincodeInput] = useState(data.pincode || "");
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  // Filter states based on input
  const filteredStates = useMemo(() => {
    if (!stateInput) return INDIAN_STATES;
    return INDIAN_STATES.filter(state =>
      state.toLowerCase().includes(stateInput.toLowerCase())
    );
  }, [stateInput]);

  // Get cities based on selected state or all cities
  const availableCities = useMemo(() => {
    if (data.currentState) {
      return getCitiesByState(data.currentState);
    }
    return getAllCities();
  }, [data.currentState]);

  // Filter cities based on input
  const filteredCities = useMemo(() => {
    if (!cityInput) return availableCities.slice(0, 20);
    return availableCities.filter(city =>
      city.toLowerCase().includes(cityInput.toLowerCase())
    ).slice(0, 20);
  }, [cityInput, availableCities]);

  // Fetch location data when pincode is 6 digits
  const fetchPincodeData = useCallback(async (pincode: string) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return;
    }

    setPincodeLoading(true);
    setPincodeError("");

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data: PincodeData[] = await response.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
        const postOffice = data[0].PostOffice[0];
        const state = postOffice.State;
        const city = postOffice.District;

        // Update state
        updateData({ 
          currentState: state, 
          currentCity: city,
          pincode: pincode 
        });
        setStateInput(state);
        setCityInput(city);
        setPincodeError("");
      } else {
        setPincodeError("Invalid pincode. Please check and try again.");
      }
    } catch (error) {
      console.error("Pincode fetch error:", error);
      setPincodeError("Unable to fetch location. Please enter manually.");
    } finally {
      setPincodeLoading(false);
    }
  }, [updateData]);

  // Handle pincode input change
  const handlePincodeChange = (value: string) => {
    // Only allow digits and max 6 characters
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setPincodeInput(sanitized);
    updateData({ pincode: sanitized });
    setPincodeError("");

    // Auto-fetch when 6 digits entered
    if (sanitized.length === 6) {
      fetchPincodeData(sanitized);
    }
  };

  // Handle mobile number input with +91 prefix
  const handleMobileChange = (value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, "");
    
    // Ensure it starts with +91
    if (!cleaned.startsWith("+91")) {
      // If user started typing digits, prepend +91
      if (cleaned.startsWith("91") && cleaned.length > 2) {
        cleaned = "+" + cleaned;
      } else if (cleaned.startsWith("+")) {
        // Keep the + but ensure 91 follows
        cleaned = "+91" + cleaned.slice(1).replace(/^\d{0,2}/, "");
      } else if (cleaned.length > 0 && !cleaned.startsWith("+")) {
        // User started with digits, prepend +91
        cleaned = "+91" + cleaned.replace(/^91/, "");
      }
    }
    
    // Limit to +91 + 10 digits = 13 characters
    if (cleaned.length > 13) {
      cleaned = cleaned.slice(0, 13);
    }
    
    updateData({ mobileNumber: cleaned });
  };

  // Validate mobile number format: +91 followed by exactly 10 digits
  const isValidMobile = (mobile: string): boolean => {
    const mobileRegex = /^\+91[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const selectState = (state: string) => {
    updateData({ currentState: state, currentCity: "" });
    setStateInput(state);
    setCityInput("");
    setShowStateSuggestions(false);
  };

  const clearState = () => {
    updateData({ currentState: "", currentCity: "" });
    setStateInput("");
    setCityInput("");
  };

  const selectCity = (city: string) => {
    updateData({ currentCity: city });
    setCityInput(city);
    setShowCitySuggestions(false);
  };

  const clearCity = () => {
    updateData({ currentCity: "" });
    setCityInput("");
  };

  const clearPincode = () => {
    updateData({ pincode: "" });
    setPincodeInput("");
    setPincodeError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!data.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!isValidMobile(data.mobileNumber)) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number starting with +91";
    }
    if (!data.workStatus) {
      newErrors.workStatus = "Please select your work status";
    }
    if (!data.currentState.trim()) {
      newErrors.currentState = "State is required";
    }
    if (!data.currentCity.trim()) {
      newErrors.currentCity = "Current city is required";
    }
    if (!data.pincode || data.pincode.length !== 6) {
      newErrors.pincode = "Valid 6-digit pincode is required";
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
              onChange={(e) => handleMobileChange(e.target.value)}
              onFocus={() => {
                // Auto-add +91 prefix when field is focused and empty
                if (!data.mobileNumber) {
                  updateData({ mobileNumber: "+91" });
                }
              }}
              className={`pr-10 ${errors.mobileNumber ? "border-destructive" : ""}`}
              placeholder="+91 9876543210"
              maxLength={13}
            />
            {isValidMobile(data.mobileNumber) && (
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

        {/* Pincode - Industry standard: Enter pincode first to auto-fill city/state */}
        <div className="space-y-2">
          <Label htmlFor="pincode" className="text-foreground">
            Pincode<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="pincode"
              value={pincodeInput}
              onChange={(e) => handlePincodeChange(e.target.value)}
              className={`pl-10 pr-10 ${errors.pincode || pincodeError ? "border-destructive" : ""}`}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              inputMode="numeric"
            />
            {pincodeLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
            {pincodeInput.length === 6 && !pincodeLoading && !pincodeError && data.currentCity && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your pincode to auto-fill city and state
          </p>
          {pincodeError && (
            <p className="text-sm text-destructive">{pincodeError}</p>
          )}
          {errors.pincode && !pincodeError && (
            <p className="text-sm text-destructive">{errors.pincode}</p>
          )}
        </div>

        {/* State Selection */}
        <div className="space-y-2">
          <Label htmlFor="currentState" className="text-foreground">
            State<span className="text-destructive">*</span>
          </Label>
          
          {data.currentState ? (
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className="px-3 py-2 text-sm bg-foreground text-background"
              >
                {data.currentState}
                <button onClick={clearState} className="ml-2 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            </div>
          ) : (
            <div className="relative">
              <Input
                id="currentState"
                value={stateInput}
                onChange={(e) => {
                  setStateInput(e.target.value);
                  setShowStateSuggestions(true);
                }}
                onFocus={() => setShowStateSuggestions(true)}
                onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
                className={`pr-10 ${errors.currentState ? "border-destructive" : ""}`}
                placeholder="Type to search state or enter pincode above"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              
              {showStateSuggestions && filteredStates.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredStates.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectState(state);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {errors.currentState && (
            <p className="text-sm text-destructive">{errors.currentState}</p>
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
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className={`pr-10 ${errors.currentCity ? "border-destructive" : ""}`}
                placeholder={data.currentState ? `Type to search city in ${data.currentState}` : "Enter pincode above or select state first"}
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              
              {showCitySuggestions && filteredCities.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCity(city);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                    >
                      {city}
                    </button>
                  ))}
                  {cityInput.trim() && !filteredCities.includes(cityInput.trim()) && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCity(cityInput.trim());
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm text-primary border-t border-border"
                    >
                      + Use "{cityInput.trim()}"
                    </button>
                  )}
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
