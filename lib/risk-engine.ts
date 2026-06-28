export function generateAssessment(
  projectType: string,
  penalties: number[],
  constraintNames: string[],
  approvedCount: number,
  refusedCount: number,
) {
  let score = 70;

  const breakdown: any[] = [
    {
      reason:
        "Base Planning Score",
      impact: 70,
    },
  ];

  const messages: string[] = [];

  const scoreBreakdown = [
    {
      reason: "Base Planning Score",
      impact: 70,
    },
  ];

  switch (projectType) {
    case "Rear Extension":
      score += 5;

      breakdown.push({
        reason:
          "Rear Extension Bonus",
        impact: 5,
      });

      messages.push(
        "Rear extensions are commonly approved."
      );
      break;

    case "Loft Conversion":
      score += 10;

      breakdown.push({
        reason:
            "Loft Conversion Bonus",
        impact: 10,
      });

      messages.push(
        "Loft conversions generally perform well."
      );
      break;

    case "New Build":
      score -= 15;

      breakdown.push({
        reason:
          "New Build Risk",
        impact: -15,
      });

      messages.push(
        "New build developments face greater scrutiny."
      );
      break;
  }

  penalties.forEach(
    (
      penalty,
      index
    ) => {
      score -= penalty;

      breakdown.push({
        reason:
          constraintNames[
            index
          ],
        impact: -penalty,
      });
    }
  );

  if (constraintNames.length > 0) {
    messages.push(
      `Constraints found: ${constraintNames.join(", ")}`
    );
  }

  const totalApplications =
    approvedCount + refusedCount;

  if (totalApplications > 0) {
    const historicalApprovalRate =
      Math.round(
        (approvedCount /
          totalApplications) *
          100
      );

    messages.push(
      `${approvedCount} approved and ${refusedCount} refused similar applications found.`
    );

    let adjustment = 0;

    if (
      historicalApprovalRate >= 80
    ) {
      adjustment = 15;
    } else if (
      historicalApprovalRate >= 60
    ) {
      adjustment = 7;
    } else if (
      historicalApprovalRate <= 20
    ) {
      adjustment = -15;
    }

    score += adjustment;

    breakdown.push({
      reason:
        "Historical Approval Performance",
      impact:
        adjustment,
    });
  }

  if (score < 0) {
    score = 0;
  }

  if (score > 100) {
    score = 100;
  }

  let approvalLikelihood =
    "Moderate";

  if (score >= 80) {
    approvalLikelihood = "High";
  }

  if (score < 60) {
    approvalLikelihood = "Low";
  }

  const approvalProbability =
    Math.max(
      5,
      Math.min(score, 95)
    );

  return {
    score,
    approvalLikelihood,
    approvalProbability,
    summary: messages.join(" "),
    scoreBreakdown:
      breakdown,
  };
}