import { createClient } from "@/lib/supabase/client";

export type DashboardProject = {
  address: string;
  borough: string | null;
  project_type: string;
};

export type DashboardAssessment = {
  id: string;
  score: number;
  approval_probability: number | null;
  approval_likelihood: string | null;
  created_at: string | null;
  projects: DashboardProject | null;
};

export type DashboardStats = {
  totalProjects: number;
  totalAssessments: number;
  averageScore: number;
  averageProbability: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  recentAssessments: DashboardAssessment[];
};

type SupabaseDashboardAssessment = {
  id: string;
  score: number | null;
  approval_probability: number | null;
  approval_likelihood: string | null;
  created_at: string | null;
  projects:
    | DashboardProject
    | DashboardProject[]
    | null;
};

function normalizeRelatedProject(
  relatedProject:
    | DashboardProject
    | DashboardProject[]
    | null
): DashboardProject | null {
  if (Array.isArray(relatedProject)) {
    return relatedProject[0] ?? null;
  }

  return relatedProject;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  const [projectsResult, assessmentsResult] =
    await Promise.all([
      supabase.from("projects").select("id"),

      supabase
        .from("assessments")
        .select(
          `
            id,
            score,
            approval_probability,
            approval_likelihood,
            created_at,
            projects (
              address,
              borough,
              project_type
            )
          `
        )
        .order("created_at", {
          ascending: false,
        }),
    ]);

  if (projectsResult.error) {
    console.error("DASHBOARD PROJECT FETCH FAILED", {
      message: projectsResult.error.message,
      code: projectsResult.error.code,
      details: projectsResult.error.details,
      hint: projectsResult.error.hint,
    });

    throw new Error(
      `Projects could not be loaded: ${projectsResult.error.message}`
    );
  }

  if (assessmentsResult.error) {
    console.error(
      "DASHBOARD ASSESSMENT FETCH FAILED",
      {
        message: assessmentsResult.error.message,
        code: assessmentsResult.error.code,
        details: assessmentsResult.error.details,
        hint: assessmentsResult.error.hint,
      }
    );

    throw new Error(
      `Assessments could not be loaded: ${assessmentsResult.error.message}`
    );
  }

  const projects = projectsResult.data ?? [];

  const rawAssessments =
    (assessmentsResult.data ??
      []) as SupabaseDashboardAssessment[];

  const assessments: DashboardAssessment[] =
    rawAssessments.map((assessment) => ({
      id: assessment.id,
      score: Number(assessment.score ?? 0),
      approval_probability:
        assessment.approval_probability,
      approval_likelihood:
        assessment.approval_likelihood,
      created_at: assessment.created_at,
      projects: normalizeRelatedProject(
        assessment.projects
      ),
    }));

  const totalProjects = projects.length;
  const totalAssessments = assessments.length;

  const averageScore =
    totalAssessments > 0
      ? Math.round(
          assessments.reduce(
            (sum, assessment) =>
              sum + assessment.score,
            0
          ) / totalAssessments
        )
      : 0;

  const averageProbability =
    totalAssessments > 0
      ? Math.round(
          assessments.reduce(
            (sum, assessment) =>
              sum +
              Number(
                assessment.approval_probability ?? 0
              ),
            0
          ) / totalAssessments
        )
      : 0;

  const highRisk = assessments.filter(
    (assessment) => assessment.score < 60
  ).length;

  const mediumRisk = assessments.filter(
    (assessment) =>
      assessment.score >= 60 &&
      assessment.score < 80
  ).length;

  const lowRisk = assessments.filter(
    (assessment) => assessment.score >= 80
  ).length;

  return {
    totalProjects,
    totalAssessments,
    averageScore,
    averageProbability,
    highRisk,
    mediumRisk,
    lowRisk,
    recentAssessments: assessments.slice(0, 5),
  };
}