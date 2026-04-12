import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, Download, File, Sparkles } from 'lucide-react';
import { Resume } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchWithAuth } from '@/utils/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  resumes: Resume[];
  onUpload?: () => void;   // ✅ changed (no file param needed)
  onDelete?: (id: string) => void;
}

export function ResumeUpload({ resumes, onUpload, onDelete }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // 🔥 UPDATED FUNCTION (MAIN FIX)
  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetchWithAuth("/resumes/", {

        method: "POST",
        body: formData, // ✅ IMPORTANT (no JSON)
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast({
        title: "Resume uploaded!",
        description: file.name,
      });

      // 🔥 REFRESH LIST AFTER UPLOAD
      if (onUpload) onUpload();

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDelete = async (id: string, name: string) => {
    try {

      await fetchWithAuth(`/resumes/${id}/`, {
        method: "DELETE",
      });

      if (onDelete) onDelete(id);

      toast({
        title: 'Resume deleted',
        description: name,
      });

      // 🔥 refresh after delete
      if (onUpload) onUpload();

    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* UI COMPLETELY UNCHANGED BELOW */}
      <Card className="shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Resume
          </CardTitle>
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
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <File className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag and drop your resume here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports PDF files up to 10MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KEEP YOUR EXISTING LIST UI EXACTLY SAME */}
      {/* Only change delete handler call */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your Resumes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">No resumes yet</h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                Upload your first resume using the upload area above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <FileText className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{resume.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{resume.fileName}</span>
                        <span>•</span>
                        <span>{formatFileSize(resume.size)}</span>
                        <span>•</span>
                        <span>Uploaded {resume.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" 
                      onClick={() => window.open(resume.fileUrl, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => navigate(`/resume-analyzer?resumeId=${resume.id}`)}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(resume.id, resume.name)} // ✅ FIXED
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}