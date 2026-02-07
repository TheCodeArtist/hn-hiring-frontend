export interface Job {
  id: string;
  username: string;
  timestamp: string;
  company_name: string | null;
  company_website?: string | null;  // Optional: for better logo resolution
  job_titles: string[];
  locations: string[];
  remote_policy: string | null;
  job_type: string;
  compensation: string | null;
  tech_stack: string[];
  experience_level: string[];
  visa_sponsorship: boolean | string;
  contact_email: string | null;
  apply_links: string[];
  summary: string;
}
