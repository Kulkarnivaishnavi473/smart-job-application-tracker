import { useEffect, useState } from 'react';
import { ResumeUpload } from '@/components/ResumeUpload';
import { Resume } from '@/types';
import { toast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/utils/api';
type ResumeApiItem = {
  id: number;
  file: string;
  uploaded_at: string;
  file_size?: number; // ✅ include file size if available
};

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Map backend → frontend format
  const mapResumeFromApi = (item: ResumeApiItem): Resume => {
    const fileName = item.file.split('/').pop() || 'resume.pdf';

    return {
      id: String(item.id),
      name: fileName.replace(/\.[^/.]+$/, ''),
      fileName,
      uploadedAt: new Date(item.uploaded_at).toISOString().split('T')[0],
      size: item.file_size || 0, // ✅ include file size if available
      fileUrl: item.file,
    };
  };

  // 🔹 Fetch resumes
  const fetchResumes = async () => {
    try {
      setLoading(true);


      const response = await fetchWithAuth('/resumes/');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to fetch resumes');
      }

      const formattedResumes = Array.isArray(data)
        ? data.map(mapResumeFromApi)
        : data.results?.map(mapResumeFromApi) || [];

      setResumes(formattedResumes);

    } catch (error) {
      console.error('Fetch resumes error:', error);
      toast({
        title: 'Failed to load resumes',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // 🔹 Delete resume
  const handleDelete = async (id: string) => {
    try {

      const response = await fetchWithAuth(
        `/resumes/${id}/`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to delete resume';

        try {
          const data = await response.json();
          errorMessage = data?.detail || errorMessage;
        } catch {}

        throw new Error(errorMessage);
      }

      setResumes((prev) => prev.filter((r) => r.id !== id));

      toast({
        title: 'Resume deleted',
        description: 'The resume has been removed successfully.',
      });

    } catch (error) {
      console.error('Delete resume error:', error);
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume Manager</h1>
        <p className="text-muted-foreground">
          Upload and manage your resumes for different applications
        </p>
      </div>

      {!loading && (
        <ResumeUpload
          resumes={resumes}
          onUpload={fetchResumes}   // ✅ FIXED (refresh after upload)
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}