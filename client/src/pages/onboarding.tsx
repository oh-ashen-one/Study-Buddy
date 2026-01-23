import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ArrowRight, ArrowLeft, Sparkles, Building2, BookOpen, Calendar } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ACADEMIC_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const POPULAR_MAJORS = [
  "Computer Science",
  "Business Administration",
  "Biology",
  "Psychology",
  "Engineering",
  "Pre-Med",
  "Pre-Law",
  "Economics",
  "Mathematics",
  "Chemistry",
  "Physics",
  "English",
  "Political Science",
  "Communications",
  "Nursing",
  "Other"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/profile", {
        university,
        major,
        year,
        onboardingComplete: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step === 1 && !university.trim()) {
      toast({
        title: "University Required",
        description: "Please enter your university name to continue.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !major) {
      toast({
        title: "Major Required",
        description: "Please select your major to continue.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && !year) {
      toast({
        title: "Year Required",
        description: "Please select your academic year to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding.mutate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold">Study Buddy</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-8 bg-primary" : s < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What university are you attending?</h2>
                <p className="text-muted-foreground">This helps us personalize your study recommendations</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="university">University Name</Label>
                <Input
                  id="university"
                  placeholder="e.g., Stanford University…"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  autoComplete="organization"
                  data-testid="input-university"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What's your major?</h2>
                <p className="text-muted-foreground">We'll recommend resources specific to your field</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="major">Select Major</Label>
                <Select value={major} onValueChange={setMajor}>
                  <SelectTrigger id="major" data-testid="select-major">
                    <SelectValue placeholder="Choose your major" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_MAJORS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What year are you?</h2>
                <p className="text-muted-foreground">This helps us tailor advice to your experience level</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year" data-testid="select-year">
                    <SelectValue placeholder="Choose your year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={completeOnboarding.isPending}
              className="gap-2"
              data-testid="button-next"
            >
              {step === 3 ? (
                <>
                  {completeOnboarding.isPending ? "Saving…" : "Get Started"}
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip option */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          You can update this information later in settings
        </p>
      </div>
    </div>
  );
}
