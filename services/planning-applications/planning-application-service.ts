import { createClient } from "@/lib/supabase/client";

export async function getSimilarApplications(
  borough: string,
  projectType: string
) {
  const supabase = createClient();

  const { data, error } =
    await supabase
      .from("planning_applications")
      .select("*")
      .eq("borough", borough)
      .eq("project_type", projectType);

  return {
    data: data ?? [],
    error,
  };
}