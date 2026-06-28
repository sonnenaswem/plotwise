import { createClient } from "@/lib/supabase/client";

export async function getDashboardStats() {
  const supabase = createClient();

  const [
    projectsResult,
    assessmentsResult,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id"),

    supabase
      .from("assessments")
      .select(`
        id,
        score,
        approval_probability,
        approval_likelihood,
        created_at,
        projects (
          address
        )
      `)
      .order("created_at", {
        ascending: false,
      })
  ]);

  const projects =
    projectsResult.data ?? [];

  const assessments =
    assessmentsResult.data ?? [];

  const totalProjects =
    projects.length;

  const totalAssessments =
    assessments.length;

  const averageScore =
    assessments.length > 0
      ? Math.round(
          assessments.reduce(
            (sum, item) =>
              sum + item.score,
            0
          ) /
            assessments.length
        )
      : 0;

  const averageProbability =
    assessments.length > 0
      ? Math.round(
          assessments.reduce(
            (sum, item) =>
              sum +
              (item.approval_probability ??
                0),
            0
          ) /
            assessments.length
        )
      : 0;

  const highRisk =
    assessments.filter(
      (a) => a.score < 40
    ).length;

  const mediumRisk =
    assessments.filter(
      (a) =>
        a.score >= 40 &&
        a.score < 80
    ).length;

  const lowRisk =
    assessments.filter(
      (a) => a.score >= 80
    ).length;
  
  const recentAssessments =
    assessments.slice(0, 5);  

  return {
    totalProjects,
    totalAssessments,
    averageScore,
    averageProbability,
    highRisk,
    mediumRisk,
    lowRisk,
    recentAssessments,
  };
}