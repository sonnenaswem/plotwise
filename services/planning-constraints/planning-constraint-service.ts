import { createClient } from "@/lib/supabase/client";

export async function getPlanningConstraints(
  borough?: string
) {
  const supabase = createClient();

  let query = supabase
    .from("planning_constraints")
    .select("*");

  if (borough) {
    query = query.eq(
      "borough",
      borough
    );
  }

  const { data, error } =
    await query.order(
      "risk_penalty",
      {
        ascending: false,
      }
    );

  return {
    data: data ?? [],
    error,
  };
}