// Job Application Types
export type JobStatus = 'applied' | 'oa' | 'interview' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jobLink: string;
  dateApplied: Date;
  resume?: {
    id: number;
    file: string;
    file_name?: string;
  };
  status: JobStatus;
  notes: string;
  interviewNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  fileUrl: string;
  id: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  size: number;
}

export interface DashboardStats {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

export interface MonthlyApplicationData {
  month: string;
  applications: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}
