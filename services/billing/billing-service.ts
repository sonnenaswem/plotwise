import { createClient } from "@/lib/supabase/client";

export type BillingResourceUsage = {
  used: number;
  limit: number | null;
  remaining: number | null;
};

export type BillingOverview = {
  subscriptionId: string;

  status:
    | "trialing"
    | "active"
    | "past_due"
    | "cancelled"
    | "expired";

  planId:
    | "professional"
    | "developer"
    | "enterprise";

  planName: string;

  audience:
    | "individual"
    | "organization";

  monthlyPricePence: number;

  periodStart: string;
  periodEnd: string;

  trialStart: string | null;
  trialEnd: string | null;
  trialDaysRemaining: number;
  isTrialing: boolean;
  canUsePlatform: boolean;

  team: BillingResourceUsage;
  projects: BillingResourceUsage;
  assessments: BillingResourceUsage;
  downloads: BillingResourceUsage;
};

type BillingOverviewRpcResponse = {
  subscription_id: string;
  status: BillingOverview["status"];
  plan_id: BillingOverview["planId"];
  plan_name: string;
  audience: BillingOverview["audience"];
  monthly_price_pence: number;

  period_start: string;
  period_end: string;

  trial_start: string | null;
  trial_end: string | null;
  trial_days_remaining: number;
  is_trialing: boolean;
  can_use_platform: boolean;

  team: BillingResourceUsage;
  projects: BillingResourceUsage;
  assessments: BillingResourceUsage;
  downloads: BillingResourceUsage;
};

type RecordDownloadRpcResponse = {
  allowed: boolean;
  plan_id: BillingOverview["planId"];
  plan_name: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  period_start: string;
  period_end: string;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

export async function getCurrentBillingOverview(): Promise<{
  data: BillingOverview | null;
  error: Error | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "get_current_billing_overview"
  );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!isRecord(data)) {
    return {
      data: null,
      error: new Error(
        "The billing overview response was invalid."
      ),
    };
  }

  const overview =
    data as BillingOverviewRpcResponse;

  return {
    data: {
      subscriptionId:
        overview.subscription_id,
      status: overview.status,
      planId: overview.plan_id,
      planName: overview.plan_name,
      audience: overview.audience,
      monthlyPricePence:
        Number(
          overview.monthly_price_pence
        ),
      periodStart: overview.period_start,
      periodEnd: overview.period_end,

      trialStart:
        overview.trial_start ?? null,

      trialEnd:
        overview.trial_end ?? null,

      trialDaysRemaining:
        Number(
          overview.trial_days_remaining ?? 0
        ),

      isTrialing:
        overview.is_trialing === true,

      canUsePlatform:
        overview.can_use_platform === true,

      team: overview.team,
      
      projects: overview.projects,
      assessments: overview.assessments,
      downloads: overview.downloads,
    },
    error: null,
  };
}

export async function recordReportDownload(
  assessmentId: string
): Promise<{
  data: RecordDownloadRpcResponse | null;
  error: Error | null;
}> {
  const normalizedAssessmentId =
    assessmentId.trim();

  if (!normalizedAssessmentId) {
    return {
      data: null,
      error: new Error(
        "Assessment ID is required."
      ),
    };
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "record_report_download",
    {
      p_assessment_id:
        normalizedAssessmentId,
    }
  );

  if (error) {
    return {
      data: null,
      error: new Error(error.message),
    };
  }

  if (!isRecord(data)) {
    return {
      data: null,
      error: new Error(
        "The report download response was invalid."
      ),
    };
  }

  return {
    data:
      data as RecordDownloadRpcResponse,
    error: null,
  };
}