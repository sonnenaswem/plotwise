import { createClient } from "@/lib/supabase/client";

export async function getLatestAssessmentReport() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(`
      *,
      projects (
        address,
        borough,
        project_type
      )
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .single();

  return {
    data,
    error,
  };
}

export async function getAssessmentById(
  assessmentId: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(`
      *,
      projects (
        address,
        borough,
        project_type
      )
    `)
    .eq("id", assessmentId)
    .single();

  if (!data) {
    return {
      data: null,
      error,
    };
  }

  const { data: similarApplications } =
    await supabase
      .from("planning_applications")
      .select("*")
      .eq(
        "borough",
        data.projects?.borough
      )
      .eq(
        "project_type",
        data.projects?.project_type
      );

  const { data: constraints } =
    await supabase
      .from("planning_constraints")
      .select("*")
      .eq(
        "borough",
        data.projects?.borough
      );

  const approvedCount =
    (similarApplications ?? []).filter(
      (app) =>
        app.decision === "Approved"
    ).length;

  const refusedCount =
    (similarApplications ?? []).filter(
      (app) =>
        app.decision === "Refused"
    ).length;

  const totalApplications =
    approvedCount +
    refusedCount;

  const approvalRate =
    totalApplications > 0
      ? Number(
        (
          (approvedCount /
            totalApplications) *
          100
        ).toFixed(1)
      )
    : null;
  let confidence = "Low";

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

  const constraintNames =
    (constraints ?? []).map(
      (constraint) =>
        constraint.constraint_type
    );

  let executiveSummary =
    `The proposed ${data.projects?.project_type?.toLowerCase()} in ${data.projects?.borough} has an assessment score of ${data.score}.`;

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
      ...data,
      similarApplications:
        similarApplications ?? [],
      constraints:
        constraints ?? [],
      approvedCount,
      refusedCount,
      approvalRate,
      confidence,
      executiveSummary,
    },
    error,
  };
}