export type BillingPlanId =
  | "professional"
  | "developer"
  | "enterprise";

export type BillingPlanAudience =
  | "individual"
  | "organization";

export type BillingLimit = number | null;

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  description: string;
  audience: BillingPlanAudience;
  monthlyPrice: number;
  currency: "GBP";
  teamMemberLimit: number;
  monthlyProjectLimit: BillingLimit;
  monthlyAssessmentLimit: BillingLimit;
  monthlyDownloadLimit: BillingLimit;
  featured: boolean;
  features: string[];
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "professional",
    name: "Professional",
    description:
      "For individual property professionals assessing their own planning opportunities.",
    audience: "individual",
    monthlyPrice: 49,
    currency: "GBP",
    teamMemberLimit: 1,
    monthlyProjectLimit: 50,
    monthlyAssessmentLimit: 50,
    monthlyDownloadLimit: 50,
    featured: false,
    features: [
      "1 individual user",
      "Up to 50 projects per month",
      "Up to 50 assessments per month",
      "Up to 50 report downloads per month",
      "Planning risk reports",
      "Project and assessment history",
    ],
  },
  {
    id: "developer",
    name: "Developer",
    description:
      "For development teams that need a shared workspace and predictable monthly usage.",
    audience: "organization",
    monthlyPrice: 100,
    currency: "GBP",
    teamMemberLimit: 5,
    monthlyProjectLimit: 100,
    monthlyAssessmentLimit: 100,
    monthlyDownloadLimit: 100,
    featured: true,
    features: [
      "Up to 5 workspace users",
      "Up to 100 projects per month",
      "Up to 100 assessments per month",
      "Up to 100 report downloads per month",
      "Shared organization workspace",
      "Member and admin invitations",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "For larger property companies requiring expanded team access and unrestricted usage.",
    audience: "organization",
    monthlyPrice: 140,
    currency: "GBP",
    teamMemberLimit: 15,
    monthlyProjectLimit: null,
    monthlyAssessmentLimit: null,
    monthlyDownloadLimit: null,
    featured: false,
    features: [
      "Up to 15 workspace users",
      "Unlimited projects",
      "Unlimited assessments",
      "Unlimited report downloads",
      "Shared organization workspace",
      "Member and admin invitations",
    ],
  },
];

export function getBillingPlan(
  planId: BillingPlanId
) {
  return (
    BILLING_PLANS.find(
      (plan) => plan.id === planId
    ) ?? null
  );
}

export function formatBillingLimit(
  limit: BillingLimit
) {
  return limit === null
    ? "Unlimited"
    : limit.toLocaleString("en-GB");
}

export function formatPlanPrice(
  plan: BillingPlan
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.monthlyPrice);
}