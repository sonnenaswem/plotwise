import { createClient } from "@/lib/supabase/client";

export async function getPortfolioInsights() {
  const supabase = createClient();

  const { data: projects } =
    await supabase
      .from("projects")
      .select("*");

  const { data: assessments } =
    await supabase
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
      });

  const latestAssessments =
    new Map<string, any>();

  assessments?.forEach((assessment) => {
    if (
      !latestAssessments.has(
        assessment.project_id
      )
    ) {
      latestAssessments.set(
        assessment.project_id,
        assessment
      );
    }
  });

  const latest =
    Array.from(
      latestAssessments.values()
    );

  const averageScore =
    latest.length > 0
      ? Math.round(
          latest.reduce(
            (sum, item) =>
              sum + item.score,
            0
          ) / latest.length
        )
      : 0;

  const averageProbability =
    latest.length > 0
      ? Math.round(
          latest.reduce(
            (sum, item) =>
              sum +
              (item.approval_probability ??
                0),
            0
          ) / latest.length
        )
      : 0;

  const highestRisk =
    latest.length > 0
      ? [...latest].sort(
          (a, b) =>
            a.score - b.score
        )[0]
      : null;

  const bestOpportunity =
    latest.length > 0
      ? [...latest].sort(
          (a, b) =>
            b.score - a.score
        )[0]
      : null;

  const boroughDistribution:
    Record<string, number> = {};

  const typeDistribution:
    Record<string, number> = {};

  projects?.forEach((project) => {
    boroughDistribution[
      project.borough
    ] =
      (boroughDistribution[
        project.borough
      ] ?? 0) + 1;

    typeDistribution[
      project.project_type
    ] =
      (typeDistribution[
        project.project_type
      ] ?? 0) + 1;
  });

  return {
    totalProjects:
      projects?.length ?? 0,

    totalAssessments:
      latest.length,

    averageScore,

    averageProbability,

    highestRisk,

    bestOpportunity,

    boroughDistribution,

    typeDistribution,

    latestAssessments: latest,
  };
}