// API Service Placeholder
// This file is prepared for future Django REST API integration

import { JobApplication, Resume, DashboardStats, MonthlyApplicationData, StatusDistribution } from '@/types';
import { 
  mockJobApplications, 
  mockResumes, 
  mockDashboardStats, 
  mockMonthlyData, 
  mockStatusDistribution 
} from '@/data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Job Applications
export const jobApplicationsApi = {
  getAll: async (): Promise<JobApplication[]> => {
    await delay(300);
    return mockJobApplications;
  },

  getById: async (id: string): Promise<JobApplication | undefined> => {
    await delay(200);
    return mockJobApplications.find(job => job.id === id);
  },

  create: async (data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobApplication> => {
    await delay(300);
    const newJob: JobApplication = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // In real implementation, this would be saved to backend
    return newJob;
  },

  update: async (id: string, data: Partial<JobApplication>): Promise<JobApplication> => {
    await delay(300);
    const job = mockJobApplications.find(j => j.id === id);
    if (!job) throw new Error('Job not found');
    return { ...job, ...data, updatedAt: new Date().toISOString() };
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    // In real implementation, this would delete from backend
    console.log(`Deleted job ${id}`);
  },
};

// Resumes
export const resumesApi = {
  getAll: async (): Promise<Resume[]> => {
    await delay(300);
    return mockResumes;
  },

  upload: async (file: File): Promise<Resume> => {
    await delay(500);
    const newResume: Resume = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: file.size,
    };
    return newResume;
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    console.log(`Deleted resume ${id}`);
  },
};

// Dashboard
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(300);
    return mockDashboardStats;
  },

  getMonthlyData: async (): Promise<MonthlyApplicationData[]> => {
    await delay(300);
    return mockMonthlyData;
  },

  getStatusDistribution: async (): Promise<StatusDistribution[]> => {
    await delay(300);
    return mockStatusDistribution;
  },
};

// Auth (placeholder for future implementation)
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: { name: string; email: string } }> => {
    await delay(500);
    // Simulate login
    return {
      token: 'mock-jwt-token',
      user: { name: 'John Doe', email },
    };
  },

  signup: async (name: string, email: string, password: string): Promise<{ token: string; user: { name: string; email: string } }> => {
    await delay(500);
    return {
      token: 'mock-jwt-token',
      user: { name, email },
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
  },
};
