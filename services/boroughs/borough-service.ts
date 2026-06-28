import { createClient } from "@/lib/supabase/client";

export async function getBoroughInsights() {
  const supabase = createClient();

  const { data: applications } =
    await supabase
      .from("planning_applications")
      .select("*");

  const boroughMap:
    Record<string, any> = {};

  applications?.forEach(
    (application) => {
      const borough =
        application.borough;

      if (!boroughMap[borough]) {
        boroughMap[borough] = {
          borough,
          total: 0,
          approved: 0,
          refused: 0,
        };
      }

      boroughMap[borough].total++;

      if (
        application.decision ===
        "Approved"
      ) {
        boroughMap[borough]
          .approved++;
      }

      if (
        application.decision ===
        "Refused"
      ) {
        boroughMap[borough]
          .refused++;
      }
    }
  );

  const boroughs =
    Object.values(
      boroughMap
    ).map((item: any) => ({
      ...item,
      approvalRate:
        item.total > 0
          ? Math.round(
              (item.approved /
                item.total) *
                100
            )
          : 0,
    }));

  boroughs.sort(
    (a: any, b: any) =>
      b.approvalRate -
      a.approvalRate
  );

  return boroughs;
}

export async function getBoroughProjectTypeInsights() {
  const supabase = createClient();

  const { data: applications } =
    await supabase
      .from("planning_applications")
      .select("*");

  const boroughMap:
    Record<string, any> = {};

  applications?.forEach(
    (application) => {
      const borough =
        application.borough;

      const projectType =
        application.project_type;

      if (!boroughMap[borough]) {
        boroughMap[borough] = {};
      }

      if (
        !boroughMap[borough][
          projectType
        ]
      ) {
        boroughMap[borough][
          projectType
        ] = {
          projectType,
          approved: 0,
          refused: 0,
        };
      }

      if (
        application.decision ===
        "Approved"
      ) {
        boroughMap[borough][
          projectType
        ].approved++;
      }

      if (
        application.decision ===
        "Refused"
      ) {
        boroughMap[borough][
          projectType
        ].refused++;
      }
    }
  );

  const result =
    Object.entries(
      boroughMap
    ).map(
      ([borough, types]) => ({
        borough,
        projectTypes:
          Object.values(
            types as any
          ).map(
            (item: any) => {
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
            }
          ),
      })
    );

  return result;
}