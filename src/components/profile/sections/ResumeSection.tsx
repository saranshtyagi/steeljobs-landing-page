import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { Button } from "@/components/ui/button";
import { Upload, FileText, RefreshCw, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ParsedResumeData {
  name?: string;
  headline?: string;
  location?: string;
  skills?: string[];
  experience_years?: number;
  education_level?: string;
  about?: string;
  profile_summary?: string;
  work_history?: Array<{
    company: string;
    role: string;
    duration?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    is_current?: boolean;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year?: string;
    specialization?: string;
    grade?: string;
  }>;
  internships?: Array<{
    company: string;
    role: string;
    duration?: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    description?: string;
    skills_used?: string[];
  }>;
  languages?: Array<{
    language: string;
    proficiency?: string;
  }>;
  certifications?: string[];
  accomplishments?: Array<{
    title: string;
    description?: string;
    issuing_org?: string;
  }>;
}

const ResumeSection = () => {
  const { t } = useTranslation();
  const { profile, updateProfile, refetch } = useCandidateProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = () => {
    if (profile?.resume_url) {
      updateFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }
      
      console.log("Extracted PDF text length:", fullText.length);
      console.log("Extracted PDF text preview:", fullText.substring(0, 500));
      
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      return extractTextFromPDF(file);
    }
    
    // For Word documents, read as text (basic support)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${profile?.id || 'temp'}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const saveEducation = async (candidateId: string, education: ParsedResumeData['education']) => {
    if (!education || education.length === 0) return;

    for (const edu of education) {
      const degreeLevel = mapDegreeToLevel(edu.degree);
      
      await supabase.from('candidate_education').insert({
        candidate_id: candidateId,
        degree_level: degreeLevel,
        course: edu.degree,
        university: edu.institution,
        specialization: edu.specialization || null,
        passing_year: edu.year ? parseInt(edu.year) : null,
        grade_value: edu.grade || null,
        is_highest: false,
      });
    }
  };

  const saveEmployment = async (candidateId: string, workHistory: ParsedResumeData['work_history']) => {
    if (!workHistory || workHistory.length === 0) return;

    for (const work of workHistory) {
      await supabase.from('candidate_employment').insert({
        candidate_id: candidateId,
        company_name: work.company,
        designation: work.role,
        description: work.description || null,
        is_current: work.is_current || false,
        start_date: work.start_date || null,
        end_date: work.end_date || null,
      });
    }
  };

  const saveInternships = async (candidateId: string, internships: ParsedResumeData['internships']) => {
    if (!internships || internships.length === 0) return;

    for (const intern of internships) {
      await supabase.from('candidate_internships').insert({
        candidate_id: candidateId,
        company_name: intern.company,
        role: intern.role,
        description: intern.description || null,
      });
    }
  };

  const saveProjects = async (candidateId: string, projects: ParsedResumeData['projects']) => {
    if (!projects || projects.length === 0) return;

    for (const project of projects) {
      await supabase.from('candidate_projects').insert({
        candidate_id: candidateId,
        title: project.title,
        description: project.description || null,
        skills_used: project.skills_used || [],
      });
    }
  };

  const saveLanguages = async (candidateId: string, languages: ParsedResumeData['languages']) => {
    if (!languages || languages.length === 0) return;

    for (const lang of languages) {
      await supabase.from('candidate_languages').insert({
        candidate_id: candidateId,
        language: lang.language,
        proficiency: lang.proficiency || 'intermediate',
        can_read: true,
        can_write: true,
        can_speak: true,
      });
    }
  };

  const saveAccomplishments = async (candidateId: string, accomplishments: ParsedResumeData['accomplishments'], certifications?: string[]) => {
    if (accomplishments && accomplishments.length > 0) {
      for (const acc of accomplishments) {
        await supabase.from('candidate_accomplishments').insert({
          candidate_id: candidateId,
          type: 'accomplishment',
          title: acc.title,
          description: acc.description || null,
          issuing_org: acc.issuing_org || null,
        });
      }
    }

    if (certifications && certifications.length > 0) {
      for (const cert of certifications) {
        await supabase.from('candidate_accomplishments').insert({
          candidate_id: candidateId,
          type: 'certification',
          title: cert,
        });
      }
    }
  };

  const mapDegreeToLevel = (degree: string): string => {
    const lowerDegree = degree.toLowerCase();
    if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) return 'doctorate';
    if (lowerDegree.includes('master') || lowerDegree.includes('mba') || lowerDegree.includes('m.tech') || lowerDegree.includes('m.sc')) return 'master';
    if (lowerDegree.includes('bachelor') || lowerDegree.includes('b.tech') || lowerDegree.includes('b.sc') || lowerDegree.includes('b.e') || lowerDegree.includes('bca') || lowerDegree.includes('bba')) return 'bachelor';
    if (lowerDegree.includes('associate') || lowerDegree.includes('diploma')) return 'associate';
    if (lowerDegree.includes('high school') || lowerDegree.includes('12th') || lowerDegree.includes('hsc') || lowerDegree.includes('10th') || lowerDegree.includes('ssc')) return 'high_school';
    return 'other';
  };

  const parseAndSaveResume = async (fileContent: string, resumeUrl: string) => {
    if (!profile?.id) {
      toast.error("Profile not found");
      return;
    }

    setIsParsing(true);
    try {
      const response = await supabase.functions.invoke('parse-resume', {
        body: { resumeText: fileContent },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const parsedData: ParsedResumeData = response.data?.data;
      
      if (!parsedData) {
        toast.error("Failed to parse resume data");
        return;
      }

      // Update the main profile with parsed data
      const profileUpdate: Record<string, unknown> = {
        resume_url: resumeUrl,
      };

      if (parsedData.name) profileUpdate.full_name = parsedData.name;
      if (parsedData.headline) profileUpdate.headline = parsedData.headline;
      if (parsedData.location) profileUpdate.location = parsedData.location;
      if (parsedData.skills && parsedData.skills.length > 0) profileUpdate.skills = parsedData.skills;
      if (parsedData.experience_years) profileUpdate.experience_years = parsedData.experience_years;
      if (parsedData.education_level) profileUpdate.education_level = parsedData.education_level;
      if (parsedData.about || parsedData.profile_summary) {
        profileUpdate.profile_summary = parsedData.profile_summary || parsedData.about;
        profileUpdate.about = parsedData.about || parsedData.profile_summary;
      }

      await updateProfile.mutateAsync(profileUpdate);

      // Save related data to respective tables
      await Promise.all([
        saveEducation(profile.id, parsedData.education),
        saveEmployment(profile.id, parsedData.work_history),
        saveInternships(profile.id, parsedData.internships),
        saveProjects(profile.id, parsedData.projects),
        saveLanguages(profile.id, parsedData.languages),
        saveAccomplishments(profile.id, parsedData.accomplishments, parsedData.certifications),
      ]);

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['candidateEducation'] });
      queryClient.invalidateQueries({ queryKey: ['candidateEmployment'] });
      queryClient.invalidateQueries({ queryKey: ['candidateInternships'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['candidateLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['candidateAccomplishments'] });
      await refetch();

      toast.success("Resume parsed and profile updated successfully!");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse resume. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const resumeUrl = await uploadToStorage(file);
      
      // Extract text and parse
      const fileContent = await extractTextFromFile(file);
      
      // Update profile with resume URL first
      await updateProfile.mutateAsync({ resume_url: resumeUrl });
      
      toast.success("Resume uploaded successfully!");
      
      // Then parse and fill profile
      await parseAndSaveResume(fileContent, resumeUrl);
      
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (e.target) e.target.value = '';
    }
  };

  const handleReParse = async () => {
    if (!profile?.resume_url || !profile?.id) {
      toast.error("No resume found to parse");
      return;
    }

    setIsParsing(true);
    try {
      // Download the resume from storage and extract text
      let resumeContent = "";
      
      if (profile.resume_url.includes('supabase')) {
        try {
          // Fetch the PDF from storage
          const response = await fetch(profile.resume_url);
          if (!response.ok) {
            throw new Error("Failed to fetch resume");
          }
          
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          
          // Extract text from PDF
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            resumeContent += pageText + "\n\n";
          }
          
          console.log("Re-parsed resume text length:", resumeContent.length);
          console.log("Re-parsed resume text preview:", resumeContent.substring(0, 500));
        } catch (fetchError) {
          console.error("Error fetching resume from storage:", fetchError);
          toast.error("Could not fetch resume from storage. Please upload again.");
          setIsParsing(false);
          return;
        }
      }

      if (!resumeContent || resumeContent.trim().length < 50) {
        toast.error("Could not extract text from resume. Please upload a new resume.");
        setIsParsing(false);
        return;
      }

      const response = await supabase.functions.invoke('parse-resume', {
        body: { 
          resumeText: resumeContent,
          resumeUrl: profile.resume_url,
          candidateId: profile.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const parsedData: ParsedResumeData = response.data?.data;
      
      if (!parsedData) {
        toast.error("Could not extract data from resume");
        return;
      }

      // Update profile
      const profileUpdate: Record<string, unknown> = {};

      if (parsedData.name) profileUpdate.full_name = parsedData.name;
      if (parsedData.headline) profileUpdate.headline = parsedData.headline;
      if (parsedData.location) profileUpdate.location = parsedData.location;
      if (parsedData.skills && parsedData.skills.length > 0) profileUpdate.skills = parsedData.skills;
      if (parsedData.experience_years) profileUpdate.experience_years = parsedData.experience_years;
      if (parsedData.education_level) profileUpdate.education_level = parsedData.education_level;
      if (parsedData.about || parsedData.profile_summary) {
        profileUpdate.profile_summary = parsedData.profile_summary || parsedData.about;
        profileUpdate.about = parsedData.about || parsedData.profile_summary;
      }

      if (Object.keys(profileUpdate).length > 0) {
        await updateProfile.mutateAsync(profileUpdate);
      }

      // Save related data
      await Promise.all([
        saveEducation(profile.id, parsedData.education),
        saveEmployment(profile.id, parsedData.work_history),
        saveInternships(profile.id, parsedData.internships),
        saveProjects(profile.id, parsedData.projects),
        saveLanguages(profile.id, parsedData.languages),
        saveAccomplishments(profile.id, parsedData.accomplishments, parsedData.certifications),
      ]);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['candidateEducation'] });
      queryClient.invalidateQueries({ queryKey: ['candidateEmployment'] });
      queryClient.invalidateQueries({ queryKey: ['candidateInternships'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProjects'] });
      queryClient.invalidateQueries({ queryKey: ['candidateLanguages'] });
      queryClient.invalidateQueries({ queryKey: ['candidateAccomplishments'] });
      await refetch();

      toast.success("Profile updated from resume!");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to re-parse resume");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t("candidate.profile.sections.resume.title", "Resume")}
        </h2>
      </div>

      {profile?.resume_url ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground flex items-center gap-2">
                {t("candidate.profile.resumeUploaded", "Resume uploaded")}
                <CheckCircle className="w-4 h-4 text-green-500" />
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("candidate.profile.sections.resume.lastUpdated", "Last Updated")}: {profile.updated_at ? format(new Date(profile.updated_at), "dd MMM yyyy") : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              disabled={isUploading}
              onClick={() => updateFileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading
                ? t("candidate.profile.uploading", "Uploading...")
                : t("candidate.profile.sections.resume.updateResume", "Update Resume")}
            </Button>
            <input
              ref={updateFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={isUploading}
            />
            <Button variant="outline" onClick={handleReParse} disabled={isParsing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isParsing ? "animate-spin" : ""}`} />
              {isParsing
                ? t("candidate.profile.parsing", "Parsing...")
                : t("candidate.profile.reParse", "Re-parse")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Re-parse will extract information from your resume and auto-fill your profile sections.
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            {t("candidate.profile.uploadResumePrompt", "Upload your resume to complete your profile")}
          </p>
          <Button 
            disabled={isUploading || isParsing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading
              ? t("candidate.profile.uploading", "Uploading...")
              : isParsing 
              ? t("candidate.profile.parsing", "Parsing...")
              : t("candidate.profile.sections.resume.uploadResume", "Upload Resume")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-3">
            {t("candidate.profile.sections.resume.supportedFormats", "Supported formats: PDF, DOC, DOCX (Max 5MB)")}
          </p>
          <p className="text-xs text-primary mt-2">
            Your resume will be automatically parsed to fill your profile!
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
