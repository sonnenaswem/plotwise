import { createClient } from "@/lib/supabase/client";

export type OpportunityDataQuality =
  | "demonstration"
  | "provisional"
  | "verified";

type OpportunityStatisticRow = {
  borough: string;
  project_type: string;
  approved: number;
  refused: number;
  data_quality: OpportunityDataQuality;
  source_name: string;
  source_period_start: string | null;
  source_period_end: string | null;
};

export type OpportunityResult = {
  borough: string;
  approved: number;
  refused: number;
  total: number;
  approvalRate: number;
  dataQuality: OpportunityDataQuality;
  sourceName: string;
  sourcePeriodStart: string | null;
  sourcePeriodEnd: string | null;
};

export async function getOpportunityData(
  projectType: string
): Promise<{
  data: OpportunityResult[];
  error: Error | null;
}> {
  const normalizedProjectType =
    projectType.trim();

  if (!normalizedProjectType) {
    return {
      data: [],
      error: new Error(
        "Please select a project type."
      ),
    };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from(
      "opportunity_borough_statistics"
    )
    .select(
      `
        borough,
        project_type,
        approved,
        refused,
        data_quality,
        source_name,
        source_period_start,
        source_period_end
      `
    )
    .eq(
      "project_type",
      normalizedProjectType
    );

  if (error) {
    return {
      data: [],
      error: new Error(error.message),
    };
  }

  const rows =
    (data ?? []) as OpportunityStatisticRow[];

  const results = rows
    .map((row) => {
      const approved =
        Number(row.approved) || 0;

      const refused =
        Number(row.refused) || 0;

      const total =
        approved + refused;

      return {
        borough: row.borough,
        approved,
        refused,
        total,

        approvalRate:
          total > 0
            ? Math.round(
                (approved / total) * 100
              )
            : 0,

        dataQuality: row.data_quality,
        sourceName: row.source_name,

        sourcePeriodStart:
          row.source_period_start,

        sourcePeriodEnd:
          row.source_period_end,
      };
    })
    .sort((first, second) => {
      if (
        second.approvalRate !==
        first.approvalRate
      ) {
        return (
          second.approvalRate -
          first.approvalRate
        );
      }

      if (second.total !== first.total) {
        return second.total - first.total;
      }

      return first.borough.localeCompare(
        second.borough
      );
    });

  return {
    data: results,
    error: null,
  };
}