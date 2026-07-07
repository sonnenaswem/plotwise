import { createClient } from "@/lib/supabase/client";

export type ReportProject = {
  id: string;
  address: string;
  borough: string | null;
  project_type: string;
  organization_id: string | null;
};

export type SimilarApplication = {
  id: string;
  address: string;
  borough: string | null;
  project_type: string;
  decision: string | null;
  [key: string]: unknown;
};

export type PlanningConstraint = {
  id: string;
  borough: string | null;
  constraint_type: string;
  risk_penalty: number | null;
  [key: string]: unknown;
};

export type AssessmentReport = {
  id: string;
  project_id: string;
  score: number;
  approval_probability: number;
  approval_likelihood: string;
  summary: string | null;
  score_breakdown: unknown[] | null;
  created_at: string | null;
  projects: ReportProject | null;
  similarApplications: SimilarApplication[];
  constraints: PlanningConstraint[];
  approvedCount: number;
  refusedCount: number;
  approvalRate: number | null;
  confidence: "Low" | "Medium" | "High";
  executiveSummary: string;
};

type RawAssessmentReport = {
  id: string;
  project_id: string;
  score: number | null;
  approval_probability: number | null;
  approval_likelihood: string | null;
  summary: string | null;
  score_breakdown: unknown[] | null;
  created_at: string | null;
  projects: ReportProject | ReportProject[] | null;
};

function normalizeProject(
  project: ReportProject | ReportProject[] | null
): ReportProject | null {
  if (Array.isArray(project)) {
    return project[0] ?? null;
  }

  return project;
}

export async function getLatestAssessmentReport(): Promise<{
  data: AssessmentReport | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select("id")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!data) {
    return {
      data: null,
      error: null,
    };
  }

  return getAssessmentById(data.id);
}

export async function getAssessmentById(
  assessmentId: string
): Promise<{
  data: AssessmentReport | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const normalizedAssessmentId = assessmentId.trim();

  if (!normalizedAssessmentId) {
    return {
      data: null,
      error: new Error("Assessment ID is required."),
    };
  }

  /*
   * Assessment RLS protects this query. A user cannot retrieve an
   * assessment unless they can access its linked personal or
   * organization project.
   */
  const { data, error } = await supabase
    .from("assessments")
    .select(
      `
        id,
        project_id,
        score,
        approval_probability,
        approval_likelihood,
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
    .eq("id", normalizedAssessmentId)
    .maybeSingle();

  if (error) {
    console.error("REPORT ASSESSMENT FETCH FAILED", {
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

  if (!data) {
    return {
      data: null,
      error: new Error(
        "The report was not found or you do not have access to it."
      ),
    };
  }

  const rawReport = data as RawAssessmentReport;
  const project = normalizeProject(rawReport.projects);

  if (!project) {
    return {
      data: null,
      error: new Error(
        "The project linked to this report could not be loaded."
      ),
    };
  }

  const [
    similarApplicationsResult,
    constraintsResult,
  ] = await Promise.all([
    project.borough
      ? supabase
          .from("planning_applications")
          .select("*")
          .eq("borough", project.borough)
          .eq("project_type", project.project_type)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    project.borough
      ? supabase
          .from("planning_constraints")
          .select("*")
          .eq("borough", project.borough)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  if (similarApplicationsResult.error) {
    return {
      data: null,
      error: new Error(
        `Similar applications could not be loaded: ${similarApplicationsResult.error.message}`
      ),
    };
  }

  if (constraintsResult.error) {
    return {
      data: null,
      error: new Error(
        `Planning constraints could not be loaded: ${constraintsResult.error.message}`
      ),
    };
  }

  const similarApplications =
    (similarApplicationsResult.data ??
      []) as SimilarApplication[];

  const constraints =
    (constraintsResult.data ??
      []) as PlanningConstraint[];

  const approvedCount = similarApplications.filter(
    (application) =>
      application.decision?.trim().toLowerCase() ===
      "approved"
  ).length;

  const refusedCount = similarApplications.filter(
    (application) =>
      application.decision?.trim().toLowerCase() ===
      "refused"
  ).length;

  const totalApplications =
    approvedCount + refusedCount;

  const approvalRate =
    totalApplications > 0
      ? Number(
          (
            (approvedCount / totalApplications) *
            100
          ).toFixed(1)
        )
      : null;

  let confidence: "Low" | "Medium" | "High" =
    "Low";

  if (
    totalApplications >= 3 &&
    constraints.length > 0
  ) {
    confidence = "Medium";
  }

  if (
    totalApplications >= 5 &&
    constraints.length > 1
  ) {
    confidence = "High";
  }

  const constraintNames = Array.from(
    new Map(
      constraints
        .map((constraint) => {
          const name =
            constraint.constraint_type?.trim();

          return name
            ? [
                name.toLowerCase(),
                name,
              ]
            : null;
        })
        .filter(
          (
            entry
          ): entry is [string, string] =>
            entry !== null
        )
    ).values()
  );

  const projectTypeText =
    project.project_type?.trim() ||
    "development";

  const boroughText =
    project.borough?.trim() ||
    "the selected area";

  const score = Number(rawReport.score ?? 0);

  let executiveSummary =
    `The proposed ${projectTypeText.toLowerCase()} in ${boroughText} has an assessment score of ${score}.`;

  if (constraintNames.length > 0) {
    executiveSummary +=
      ` Key planning constraints include ${constraintNames.join(", ")}.`;
  }

  if (approvalRate !== null) {
    executiveSummary +=
      ` Comparable applications indicate an approval rate of ${approvalRate}%.`;
  }

  executiveSummary +=
    ` Confidence in this assessment is ${confidence.toLowerCase()}.`;

  return {
    data: {
      id: rawReport.id,
      project_id: rawReport.project_id,
      score,
      approval_probability: Number(
        rawReport.approval_probability ?? 0
      ),
      approval_likelihood:
        rawReport.approval_likelihood ??
        "Unknown",
      summary: rawReport.summary,
      score_breakdown:
        rawReport.score_breakdown,
      created_at: rawReport.created_at,
      projects: project,
      similarApplications,
      constraints,
      approvedCount,
      refusedCount,
      approvalRate,
      confidence,
      executiveSummary,
    },
    error: null,
  };
}