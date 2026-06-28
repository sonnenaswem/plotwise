import { createClient } from "@/lib/supabase/client";

export async function getOpportunityData(
  projectType: string
) {
  const supabase = createClient();

  const { data } =
    await supabase
      .from("planning_applications")
      .select("*")
      .eq(
        "project_type",
        projectType
      );

  const boroughMap:
    Record<string, any> = {};

  data?.forEach(
    (application) => {
      const borough =
        application.borough;

      if (!boroughMap[borough]) {
        boroughMap[borough] = {
          borough,
          approved: 0,
          refused: 0,
        };
      }

      if (
        application.decision ===
        "Approved"
      ) {
        boroughMap[
          borough
        ].approved++;
      }

      if (
        application.decision ===
        "Refused"
      ) {
        boroughMap[
          borough
        ].refused++;
      }
    }
  );

  const results =
    Object.values(
      boroughMap
    ).map((item: any) => {
      const total =
        item.approved +
        item.refused;

      return {
        ...item,
        approvalRate:
          total > 0
            ? Math.round(
                (item.approved /
                  total) *
                  100
              )
            : 0,
      };
    });

  results.sort(
    (a: any, b: any) =>
      b.approvalRate -
      a.approvalRate
  );

  return results;
}