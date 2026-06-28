export interface Project {
  id: string;
  organization_id: string;

  address: string;
  borough: string | null;
  latitude: number | null;
  longitude: number | null;

  project_type: string;

  created_by: string | null;
  created_at: string;
}

export interface Assessment {
  id: string;
  project_id: string;

  score: number;

  approval_likelihood: string;

  summary: string;

  created_at: string;
}