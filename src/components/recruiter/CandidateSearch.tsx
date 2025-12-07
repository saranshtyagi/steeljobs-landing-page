import { useState } from "react";
import { useSearchCandidates, CandidateSearchFilters, CandidateResult, EducationLevel, WorkPreference } from "@/hooks/useSearchCandidates";
import CandidateCard from "./CandidateCard";
import CandidateProfileDrawer from "./CandidateProfileDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Clock,
  X,
  Loader2,
  Users,
  SlidersHorizontal,
} from "lucide-react";

const CandidateSearch = () => {
  const [filters, setFilters] = useState<CandidateSearchFilters>({
    page: 1,
    pageSize: 10,
    sortBy: "relevance",
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useSearchCandidates(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      keywords: keywordInput || undefined,
      location: locationInput || undefined,
      page: 1,
    }));
  };

  const handleFilterChange = (newFilters: Partial<CandidateSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: 10, sortBy: "relevance" });
    setKeywordInput("");
    setLocationInput("");
    setSkillInput("");
  };

  const addSkill = (skill: string) => {
    if (skill && !filters.skills?.includes(skill)) {
      handleFilterChange({ skills: [...(filters.skills || []), skill] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    handleFilterChange({
      skills: filters.skills?.filter((s) => s !== skill),
    });
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (data?.candidates) {
      setSelectedCandidates(new Set(data.candidates.map((c) => c.id)));
    }
  };

  const clearSelection = () => {
    setSelectedCandidates(new Set());
  };

  const educationLevels: { value: EducationLevel; label: string }[] = [
    { value: "high_school", label: "High School" },
    { value: "associate", label: "Associate" },
    { value: "bachelor", label: "Bachelor's" },
    { value: "master", label: "Master's" },
    { value: "doctorate", label: "Doctorate" },
  ];

  const workPreferences: { value: WorkPreference; label: string }[] = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "internship", label: "Internship" },
    { value: "remote", label: "Remote" },
    { value: "contract", label: "Contract" },
  ];

  const freshnessOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  const hasActiveFilters =
    filters.keywords ||
    filters.location ||
    filters.experienceMin !== undefined ||
    filters.experienceMax !== undefined ||
    filters.salaryMin !== undefined ||
    filters.salaryMax !== undefined ||
    (filters.educationLevels && filters.educationLevels.length > 0) ||
    (filters.skills && filters.skills.length > 0) ||
    (filters.workPreferences && filters.workPreferences.length > 0) ||
    filters.profileFreshness;

  // Filter Pills Component
  const FilterPills = () => (
    <div className="flex flex-wrap gap-2">
      {/* Experience Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            Experience
            {(filters.experienceMin !== undefined || filters.experienceMax !== undefined) && (
              <Badge variant="secondary" className="ml-1.5 h-5">
                {filters.experienceMin ?? 0}-{filters.experienceMax ?? 15}yrs
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Experience: {filters.experienceMin ?? 0} - {filters.experienceMax ?? 15}+ years
            </Label>
            <Slider
              value={[filters.experienceMin ?? 0, filters.experienceMax ?? 15]}
              min={0}
              max={15}
              step={1}
              onValueChange={([min, max]) => {
                handleFilterChange({
                  experienceMin: min === 0 ? undefined : min,
                  experienceMax: max === 15 ? undefined : max,
                });
              }}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Salary Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Salary
            {(filters.salaryMin !== undefined || filters.salaryMax !== undefined) && (
              <Badge variant="secondary" className="ml-1.5 h-5">
                ₹{((filters.salaryMin ?? 0) / 100000).toFixed(0)}L-{((filters.salaryMax ?? 5000000) / 100000).toFixed(0)}L
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Expected Salary: ₹{((filters.salaryMin ?? 0) / 100000).toFixed(0)}L - ₹
              {((filters.salaryMax ?? 5000000) / 100000).toFixed(0)}L+
            </Label>
            <Slider
              value={[filters.salaryMin ?? 0, filters.salaryMax ?? 5000000]}
              min={0}
              max={5000000}
              step={100000}
              onValueChange={([min, max]) => {
                handleFilterChange({
                  salaryMin: min === 0 ? undefined : min,
                  salaryMax: max === 5000000 ? undefined : max,
                });
              }}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Education Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Education
            {filters.educationLevels && filters.educationLevels.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5">
                {filters.educationLevels.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-2">
            {educationLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`edu-${level.value}`}
                  checked={filters.educationLevels?.includes(level.value)}
                  onCheckedChange={(checked) => {
                    const current = filters.educationLevels || [];
                    const updated = checked
                      ? [...current, level.value]
                      : current.filter((l) => l !== level.value);
                    handleFilterChange({ educationLevels: updated.length ? updated : undefined });
                  }}
                />
                <Label htmlFor={`edu-${level.value}`} className="text-sm cursor-pointer">
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Work Preference Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Work Type
            {filters.workPreferences && filters.workPreferences.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5">
                {filters.workPreferences.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-2">
            {workPreferences.map((pref) => (
              <div key={pref.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`work-${pref.value}`}
                  checked={filters.workPreferences?.includes(pref.value)}
                  onCheckedChange={(checked) => {
                    const current = filters.workPreferences || [];
                    const updated = checked
                      ? [...current, pref.value]
                      : current.filter((w) => w !== pref.value);
                    handleFilterChange({ workPreferences: updated.length ? updated : undefined });
                  }}
                />
                <Label htmlFor={`work-${pref.value}`} className="text-sm cursor-pointer">
                  {pref.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Profile Freshness Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Freshness
            {filters.profileFreshness && (
              <Badge variant="secondary" className="ml-1.5 h-5">
                {freshnessOptions.find((f) => f.value === filters.profileFreshness)?.label}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            {freshnessOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`fresh-${option.value}`}
                  checked={filters.profileFreshness === option.value}
                  onCheckedChange={(checked) => {
                    handleFilterChange({
                      profileFreshness: checked ? (option.value as "7d" | "30d" | "90d") : undefined,
                    });
                  }}
                />
                <Label htmlFor={`fresh-${option.value}`} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Skills Input */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Skills
            {filters.skills && filters.skills.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5">
                {filters.skills.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                className="h-8"
              />
              <Button size="sm" onClick={() => addSkill(skillInput)} className="h-8">
                Add
              </Button>
            </div>
            {filters.skills && filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {filters.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-muted-foreground">
          <X className="w-3.5 h-3.5 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by skills, headline, job title..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="hero">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>

        {/* Filter Pills */}
        <FilterPills />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {data ? (
              <>
                Found <span className="font-medium text-foreground">{data.totalCount}</span> candidates
              </>
            ) : (
              "Searching..."
            )}
          </p>
          {selectedCandidates.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedCandidates.size} selected</Badge>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {data && data.candidates.length > 0 && (
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          )}
          <Select
            value={filters.sortBy || "relevance"}
            onValueChange={(value) =>
              handleFilterChange({ sortBy: value as CandidateSearchFilters["sortBy"] })
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="salary_high">Salary: High to Low</SelectItem>
              <SelectItem value="salary_low">Salary: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-destructive/10 rounded-xl">
          <p className="text-destructive mb-2">Failed to search candidates</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      )}

      {/* Results */}
      {data && data.candidates.length > 0 && (
        <div className="space-y-4">
          {data.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidates.has(candidate.id)}
              onSelect={() => toggleCandidateSelection(candidate.id)}
              onViewProfile={() => setSelectedCandidateId(candidate.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {data && data.candidates.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">No candidates found</p>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                className={filters.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setFilters((prev) => ({ ...prev, page }))}
                    isActive={filters.page === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.min(data.totalPages, (prev.page || 1) + 1),
                  }))
                }
                className={filters.page === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Candidate Profile Drawer */}
      <CandidateProfileDrawer
        candidateId={selectedCandidateId}
        isOpen={!!selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
      />
    </div>
  );
};

export default CandidateSearch;