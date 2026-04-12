import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/utils/api';

type ResumeAnalysisResult = {
  mode: string;
  analysis: {
    semantic_similarity?: number;
    keyword_match_score?: number;
    matched_keywords?: string[];
    missing_keywords?: string[];
    suggestions?: string[] | string;
    ats_score?: number;
    final_score?: number;
    section_score?: number;
    format_score?: number;
  };
};

export default function ResumeAnalyzer() {
  const [searchParams] = useSearchParams();
  const resumeId = Number(searchParams.get('resumeId'));
  const [selectedResume, setSelectedResume] = useState<any>(null);

  useEffect(() => {
    if (!resumeId) return;
    
    const fetchResume = async () => {
      try {
        const response = await fetchWithAuth(`/resumes/${resumeId}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch resume');
        }
        const data = await response.json();
        setSelectedResume(data);
      } catch (error) {
        console.error('Fetch resume error:', error);
      }
    };

    fetchResume();
  }, [resumeId]);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

const handleAnalyze = async () => {
  let resumeFile = file;

  try {
    // 🔥 Convert selected resume (URL → File)
    if (!resumeFile && selectedResume) {
      const response = await fetch(selectedResume.file);
      const blob = await response.blob();

      resumeFile = new File(
        [blob],
        selectedResume.file_name || "resume.pdf",
        { type: blob.type || "application/pdf" }
      );
    }

    // ❌ VALIDATION (FIXED)
    if (!resumeFile || !jobDescription.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please upload/select a resume and enter job description.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', resumeFile); // ✅ ONLY FILE
    formData.append('job_description', jobDescription);

    const response = await fetchWithAuth('/resume-analyzer/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || data?.detail || 'Failed to analyze resume');
    }

    setResult(data);

    toast({
      title: 'Analysis Complete',
      description: 'Your resume has been analyzed successfully.',
    });

  } catch (error) {
    console.error('Resume analysis error:', error);

    toast({
      title: 'Analysis Failed',
      description:
        error instanceof Error
          ? error.message
          : 'Something went wrong while analyzing resume.',
      variant: 'destructive',
    });

  } finally {
    setIsAnalyzing(false);
  }
};

  const displayScore =
    result?.analysis?.final_score ||
    result?.analysis?.keyword_match_score ||
    result?.analysis?.ats_score ||
    0;

  const suggestionsArray = Array.isArray(result?.analysis?.suggestions)
    ? result?.analysis?.suggestions
    : result?.analysis?.suggestions
    ? [result.analysis.suggestions]
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Analyze your resume against a job description
        </p>
      </div>

     {selectedResume && (
  <Card className="shadow-card animate-fade-in border-primary/20 bg-primary/5">
    <CardContent className="pt-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-medium">Selected Resume</p>
          <p className="text-sm text-muted-foreground">
            {selectedResume?.file_name || 'No resume selected'}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

<div className="grid gap-6 lg:grid-cols-2">
  <div className="space-y-6">
    
    {!selectedResume && (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF or DOC format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {file.type || 'Document'} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-medium text-foreground">
                    Drag and drop your resume here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Job Description
              </CardTitle>
              <CardDescription>
                Paste the job description for more accurate analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={(!file && !selectedResume) || !jobDescription.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {isAnalyzing ? (
            <>
              <Card className="shadow-card">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-20" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : result ? (
            <>
              <Card className="shadow-card animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    ATS Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className={cn('text-5xl font-bold', getScoreColor(displayScore))}>
                        {displayScore.toFixed(0)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getScoreLabel(displayScore)}
                      </p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Progress value={displayScore} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        Your resume matches {displayScore.toFixed(0)}% of the job description
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="shadow-card animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Matched Keywords
                  </CardTitle>
                  <CardDescription>
                    Keywords found in your resume that match the requirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.matched_keywords?.length ? (
                      result.analysis.matched_keywords.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-success/10 text-success hover:bg-success/20"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No matched keywords found.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className="shadow-card animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Missing Keywords
                  </CardTitle>
                  <CardDescription>
                    Important keywords missing from your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.missing_keywords?.length ? (
                      result.analysis.missing_keywords.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="border-warning/50 text-warning bg-warning/10"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No missing keywords found.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className="shadow-card animate-fade-in"
                style={{ animationDelay: '300ms' }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Improvement Suggestions
                  </CardTitle>
                  <CardDescription>
                    Recommendations to improve your resume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestionsArray.length ? (
                    <ul className="space-y-3">
                      {suggestionsArray.map((suggestion, index) => (
                        <li key={index} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No suggestions available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-card h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center py-12">
                <div className="p-4 rounded-full bg-muted/50 inline-block mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                  Upload your resume and paste a job description to analyze ATS score
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}