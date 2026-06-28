import { createClient } from "@/lib/supabase/client";

export async function createAssessment(
  projectId: string,
  score: number,
  approvalLikelihood: string,
  approvalProbability: number,
  summary: string,
  scoreBreakdown: any[]
) {
  const supabase = createClient();

  const { data, error } =
    await supabase
      .from("assessments")
      .insert({
        project_id: projectId,
        score,
        approval_likelihood:
          approvalLikelihood,
        approval_probability:
          approvalProbability,
        summary,
        score_breakdown:
          scoreBreakdown,
      })
      .select()
      .single();

  return {
    data,
    error,
  };
}

export async function getAssessments() {
  const supabase = createClient();

  const { data, error } =
    await supabase
      .from("assessments")
      .select(`
        *,
        projects (
          address,
          project_type
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  return {
    data: data ?? [],
    error,
  };
}