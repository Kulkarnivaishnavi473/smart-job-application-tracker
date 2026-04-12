import { useParams } from "react-router-dom";
import { JobForm } from '@/components/JobForm';

export default function AddJob({isEdit = false}: {isEdit?: boolean}) {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? "Edit Job Application" : "Add Job Application"}
        </h1>
        <p className="text-muted-foreground">
          {id 
            ? "Update your job application details" 
            : "Track a new job application to stay organized"}
        </p>
      </div>

      <JobForm // ✅ backend-driven edit/add
      />
    </div>
  );
}