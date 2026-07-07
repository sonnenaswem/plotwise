import { createClient } from "@/lib/supabase/client";

export type ScoreBreakdownItem = {
  label?: string;
  name?: string;
  value?: number;
  penalty?: number;
  [key: string]: unknown;
};

export type AssessmentProject = {
  id?: string;
  address: string;
  borough: string | null;
  project_type: string;
  organization_id?: string | null;
};

export type Assessment = {
  id: string;
  project_id: string;
  score: number;
  approval_likelihood: string;
  approval_probability: number;
  summary: string | null;
  score_breakdown: ScoreBreakdownItem[] | null;
  created_at: string | null;
  projects: AssessmentProject | null;
};

export type CreateAssessmentInput = {
  projectId: string;
  score: number;
  approvalLikelihood: string;
  approvalProbability: number;
  summary: string;
  scoreBreakdown: ScoreBreakdownItem[];
};

type SupabaseAssessmentRow = {
  id: string;
  project_id: string;
  score: number | null;
  approval_likelihood: string | null;
  approval_probability: number | null;
  summary: string | null;
  score_breakdown: ScoreBreakdownItem[] | null;
  created_at: string | null;
  projects:
    | AssessmentProject
    | AssessmentProject[]
    | null;
};

function normalizeRelatedProject(
  project:
    | AssessmentProject
    | AssessmentProject[]
    | null
): AssessmentProject | null {
  if (Array.isArray(project)) {
    return project[0] ?? null;
  }

  return project;
}

function normalizeAssessment(
  assessment: SupabaseAssessmentRow
): Assessment {
  return {
    id: assessment.id,
    project_id: assessment.project_id,
    score: Number(assessment.score ?? 0),
    approval_likelihood:
      assessment.approval_likelihood ?? "Unknown",
    approval_probability: Number(
      assessment.approval_probability ?? 0
    ),
    summary: assessment.summary,
    score_breakdown: assessment.score_breakdown,
    created_at: assessment.created_at,
    projects: normalizeRelatedProject(
      assessment.projects
    ),
  };
}

export async function createAssessment(
  input: CreateAssessmentInput
): Promise<{
  data: Assessment | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const projectId = input.projectId.trim();

  if (!projectId) {
    return {
      data: null,
      error: new Error("Project ID is required."),
    };
  }

  if (
    !Number.isFinite(input.score) ||
    input.score < 0 ||
    input.score > 100
  ) {
    return {
      data: null,
      error: new Error(
        "Assessment score must be between 0 and 100."
      ),
    };
  }

  if (
    !Number.isFinite(input.approvalProbability) ||
    input.approvalProbability < 0 ||
    input.approvalProbability > 100
  ) {
    return {
      data: null,
      error: new Error(
        "Approval probability must be between 0 and 100."
      ),
    };
  }

  /*
   * This query confirms that the authenticated user can access the
   * selected project. Project RLS remains the source of truth.
   */
  const {
    data: accessibleProject,
    error: projectLookupError,
  } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectLookupError) {
    return {
      data: null,
      error: new Error(projectLookupError.message),
    };
  }

  if (!accessibleProject) {
    return {
      data: null,
      error: new Error(
        "The selected project was not found or you do not have access to it."
      ),
    };
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      project_id: projectId,
      score: Math.round(input.score),
      approval_likelihood:
        input.approvalLikelihood.trim(),
      approval_probability: Math.round(
        input.approvalProbability
      ),
      summary: input.summary.trim(),
      score_breakdown: input.scoreBreakdown,
    })
    .select(
      `
        id,
        project_id,
        score,
        approval_likelihood,
        approval_probability,
        summary,
        score_breakdown,
        created_at,
        projects (
          id,
          address,
          borough,
          project_type,
          organization_id
        )
      `
    )
    .single();

  if (error) {
    console.error("ASSESSMENT INSERT FAILED", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return {
      data: null,
      error: new Error(error.message),
    };
  }

  return {
    data: normalizeAssessment(
      data as SupabaseAssessmentRow
    ),
    error: null,
  };
}

export async function getAssessments(): Promise<{
  data: Assessment[];
  error: Error | null;
}> {
  const supabase = createClient();

  /*
   * Do not filter by user ID here.
   *
   * Assessment RLS should grant access through the linked project,
   * allowing:
   * - individual owners to see assessments for personal projects;
   * - organization members to see assessments for organization projects.
   */
  const { data, error } = await supabase
    .from("assessments")
    .select(
      `
        id,
        project_id,
        score,
        approval_likelihood,
        approval_probability,
        summary,
        score_breakdown,
        created_at,
        projects (
          id,
          address,
          borough,
          project_type,
          organization_id
        )
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("ASSESSMENT FETCH FAILED", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return {
      data: [],
      error: new Error(error.message),
    };
  }

  const assessments = (
    (data ?? []) as SupabaseAssessmentRow[]
  ).map(normalizeAssessment);

  return {
    data: assessments,
    error: null,
  };
}