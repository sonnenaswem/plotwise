"use client";

import {
  type ReactNode,
  use,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

import jsPDF from "jspdf";

import {
  getAssessmentById,
  type AssessmentReport,
} from "@/services/reports/report-service";

import { recordReportDownload } from "@/services/billing/billing-service";

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

const TEAL = "#0E7490";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ScoreBreakdownRecord = {
  label?: string;
  name?: string;
  reason?: string;
  value?: number;
  impact?: number;
  penalty?: number;
};

function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section
      data-pdf-section="true"
      style={{
        overflow: "hidden",
        marginBottom: 16,
        border: "1px solid #E8EDF2",
        borderRadius: 14,
        background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "15px 24px",
          borderBottom: "1px solid #F1F5F9",
          background: "#FAFBFC",
        }}
      >
        {icon ? <span>{icon}</span> : null}

        <h2
          style={{
            margin: 0,
            color: "#0D2137",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          {title}
        </h2>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="report-info-row"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        padding: "9px 0",
        borderBottom: "1px solid #F8FAFC",
      }}
    >
      <span
        style={{
          color: "#64748B",
          fontSize: 13,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#0D2137",
          fontSize: 13,
          fontWeight: 600,
          textAlign: "right",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ScoreGauge({
  score,
}: {
  score: number;
}) {
  const color =
    score >= 80
      ? "#A3E635"
      : score >= 60
        ? "#F59E0B"
        : "#EF4444";

  const label =
    score >= 80
      ? "High Likelihood of Approval"
      : score >= 60
        ? "Moderate Likelihood of Approval"
        : "Higher Planning Risk";

  const radius = 54;
  const circumference =
    2 * Math.PI * radius;

  const dash =
    (Math.max(0, Math.min(score, 100)) /
      100) *
    circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <svg
        width="136"
        height="136"
        viewBox="0 0 136 136"
        aria-label={`Assessment score ${score} out of 100`}
      >
        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="9"
        />

        <circle
          cx="68"
          cy="68"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
        />

        <text
          x="68"
          y="62"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="34"
          fontWeight="700"
          fontFamily="'Fraunces', Georgia, serif"
        >
          {score}
        </text>

        <text
          x="68"
          y="80"
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="12"
          fontFamily="'Inter', system-ui, sans-serif"
        >
          / 100
        </text>
      </svg>

      <span
        style={{
          maxWidth: 180,
          color,
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.4,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function normalizeBreakdownItem(
  item: unknown
): ScoreBreakdownRecord {
  if (
    typeof item === "object" &&
    item !== null
  ) {
    return item as ScoreBreakdownRecord;
  }

  return {};
}

function getBreakdownLabel(
  item: ScoreBreakdownRecord,
  index: number
) {
  return (
    item.reason?.trim() ||
    item.label?.trim() ||
    item.name?.trim() ||
    `Score factor ${index + 1}`
  );
}

function getBreakdownImpact(
  item: ScoreBreakdownRecord
) {
  if (
    typeof item.impact === "number"
  ) {
    return item.impact;
  }

  if (
    typeof item.value === "number"
  ) {
    return item.value;
  }

  if (
    typeof item.penalty === "number"
  ) {
    return -Math.abs(item.penalty);
  }

  return 0;
}

function createSafeFilename(
  address: string | undefined
) {
  const normalized =
    address
      ?.trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) ||
    "Planning-Assessment";

  return `PlotWize-${normalized}-Report.pdf`;
}

export default function ReportDetailPage({
  params,
}: ReportPageProps) {
  const { id } = use(params);

  const [report, setReport] =
    useState<AssessmentReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isExporting, setIsExporting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    exportErrorMessage,
    setExportErrorMessage,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReport() {
      setLoading(true);
      setErrorMessage("");

      try {
        const result =
          await getAssessmentById(id);

        if (!active) {
          return;
        }

        if (result.error) {
          throw result.error;
        }

        if (!result.data) {
          throw new Error(
            "The report could not be found."
          );
        }

        setReport(result.data);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Report loading failed:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The report could not be loaded."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [id]);

  async function exportPdf() {
    if (!report) {
      return;
    }

    setIsExporting(true);
    setExportErrorMessage("");

    try {
      /*
      * Access control and quota enforcement happen before
      * any PDF file is generated.
      */
      const quotaResult =
        await recordReportDownload(report.id);

      if (quotaResult.error) {
        throw quotaResult.error;
      }

      if (!quotaResult.data?.allowed) {
        throw new Error(
          "This report download is not allowed by your current plan."
        );
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const marginLeft = 16;
      const marginRight = 16;
      const marginTop = 18;
      const marginBottom = 18;

      const contentWidth =
        pageWidth -
        marginLeft -
        marginRight;

      const pageBottom =
        pageHeight - marginBottom;

      const navy: [number, number, number] = [
        13, 33, 55,
      ];

      const teal: [number, number, number] = [
        14, 116, 144,
      ];

      const lime: [number, number, number] = [
        163, 230, 53,
      ];

      const slate: [number, number, number] = [
        71, 85, 105,
      ];

      const lightSlate: [
        number,
        number,
        number,
      ] = [148, 163, 184];

      const paleBackground: [
        number,
        number,
        number,
      ] = [248, 250, 252];

      const border: [number, number, number] = [
        226, 232, 240,
      ];

      let currentY = marginTop;

      function addRunningHeader() {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...navy);

        pdf.text(
          "PlotWize",
          marginLeft,
          10
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...lightSlate);

        pdf.text(
          "Planning Risk Assessment",
          pageWidth - marginRight,
          10,
          {
            align: "right",
          }
        );

        pdf.setDrawColor(...border);
        pdf.line(
          marginLeft,
          13,
          pageWidth - marginRight,
          13
        );
      }

      function addPage() {
        pdf.addPage();
        addRunningHeader();
        currentY = marginTop;
      }

      function ensureSpace(
        requiredHeight: number
      ) {
        if (
          currentY + requiredHeight >
          pageBottom
        ) {
          addPage();
        }
      }

      function addSectionTitle(
        title: string
      ) {
        ensureSpace(13);

        pdf.setFillColor(
          ...paleBackground
        );

        pdf.roundedRect(
          marginLeft,
          currentY,
          contentWidth,
          9,
          2,
          2,
          "F"
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...navy);

        pdf.text(
          title.toUpperCase(),
          marginLeft + 4,
          currentY + 5.8
        );

        currentY += 13;
      }

      function addWrappedParagraph(
        text: string,
        options?: {
          fontSize?: number;
          lineHeight?: number;
          color?: [
            number,
            number,
            number,
          ];
          fontStyle?:
            | "normal"
            | "bold"
            | "italic"
            | "bolditalic";
          indent?: number;
          spacingAfter?: number;
        }
      ) {
        const fontSize =
          options?.fontSize ?? 10;

        const lineHeight =
          options?.lineHeight ?? 5;

        const textColor =
          options?.color ?? slate;

        const fontStyle =
          options?.fontStyle ?? "normal";

        const indent =
          options?.indent ?? 0;

        const spacingAfter =
          options?.spacingAfter ?? 4;

        pdf.setFont(
          "helvetica",
          fontStyle
        );

        pdf.setFontSize(fontSize);
        pdf.setTextColor(...textColor);

        const lines = pdf.splitTextToSize(
          text || "Not available.",
          contentWidth - indent
        ) as string[];

        for (const line of lines) {
          ensureSpace(lineHeight);

          pdf.text(
            line,
            marginLeft + indent,
            currentY
          );

          currentY += lineHeight;
        }

        currentY += spacingAfter;
      }

      function addKeyValueRow(
        label: string,
        value: string
      ) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        const labelWidth = 46;

        const valueLines =
          pdf.splitTextToSize(
            value,
            contentWidth -
              labelWidth -
              8
          ) as string[];

        const rowHeight = Math.max(
          9,
          valueLines.length * 4.6 + 4
        );

        ensureSpace(rowHeight);

        pdf.setDrawColor(...border);
        pdf.line(
          marginLeft,
          currentY + rowHeight,
          pageWidth - marginRight,
          currentY + rowHeight
        );

        pdf.setTextColor(...lightSlate);
        pdf.text(
          label,
          marginLeft,
          currentY + 5
        );

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...navy);

        pdf.text(
          valueLines,
          marginLeft + labelWidth,
          currentY + 5
        );

        currentY += rowHeight;
      }

      function addScoreDriver(
        label: string,
        impact: number
      ) {
        const impactText =
          impact > 0
            ? `+${impact}`
            : `${impact}`;

        const labelLines =
          pdf.splitTextToSize(
            label,
            contentWidth - 35
          ) as string[];

        const rowHeight = Math.max(
          9,
          labelLines.length * 4.6 + 4
        );

        ensureSpace(rowHeight);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...slate);

        pdf.text(
          labelLines,
          marginLeft,
          currentY + 5
        );

        pdf.setFont("helvetica", "bold");

        if (impact > 0) {
          pdf.setTextColor(22, 163, 74);
        } else if (impact < 0) {
          pdf.setTextColor(220, 38, 38);
        } else {
          pdf.setTextColor(...lightSlate);
        }

        pdf.text(
          impactText,
          pageWidth - marginRight,
          currentY + 5,
          {
            align: "right",
          }
        );

        pdf.setDrawColor(...border);
        pdf.line(
          marginLeft,
          currentY + rowHeight,
          pageWidth - marginRight,
          currentY + rowHeight
        );

        currentY += rowHeight;
      }

      function addConstraint(
        name: string,
        penalty: number
      ) {
        const explanation =
          penalty > 0
            ? `Recorded planning risk impact: -${Math.abs(
                penalty
              )} points.`
            : "This constraint was identified but currently has no recorded score penalty.";

        const nameLines =
          pdf.splitTextToSize(
            name,
            contentWidth - 12
          ) as string[];

        const explanationLines =
          pdf.splitTextToSize(
            explanation,
            contentWidth - 12
          ) as string[];

        const cardHeight =
          8 +
          nameLines.length * 4.8 +
          explanationLines.length * 4.3 +
          5;

        ensureSpace(cardHeight + 4);

        pdf.setFillColor(254, 242, 242);
        pdf.setDrawColor(254, 202, 202);

        pdf.roundedRect(
          marginLeft,
          currentY,
          contentWidth,
          cardHeight,
          2,
          2,
          "FD"
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(...navy);

        pdf.text(
          nameLines,
          marginLeft + 5,
          currentY + 6
        );

        const explanationY =
          currentY +
          6 +
          nameLines.length * 4.8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(...slate);

        pdf.text(
          explanationLines,
          marginLeft + 5,
          explanationY
        );

        currentY += cardHeight + 4;
      }

      function addComparableRow(
        address: string,
        decision: string,
        borough: string | null
      ) {
        const decisionWidth = 28;

        const addressLines =
          pdf.splitTextToSize(
            address,
            contentWidth -
              decisionWidth -
              10
          ) as string[];

        const boroughLines = borough
          ? (pdf.splitTextToSize(
              borough,
              contentWidth -
                decisionWidth -
                10
            ) as string[])
          : [];

        const rowHeight =
          6 +
          addressLines.length * 4.4 +
          boroughLines.length * 4 +
          3;

        ensureSpace(rowHeight);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(...navy);

        pdf.text(
          addressLines,
          marginLeft,
          currentY + 5
        );

        if (boroughLines.length > 0) {
          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(8);
          pdf.setTextColor(...lightSlate);

          pdf.text(
            boroughLines,
            marginLeft,
            currentY +
              5 +
              addressLines.length *
                4.4
          );
        }

        const normalizedDecision =
          decision.trim().toLowerCase();

        if (
          normalizedDecision ===
          "approved"
        ) {
          pdf.setTextColor(5, 150, 105);
        } else if (
          normalizedDecision ===
          "refused"
        ) {
          pdf.setTextColor(220, 38, 38);
        } else {
          pdf.setTextColor(...slate);
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);

        pdf.text(
          decision || "Unknown",
          pageWidth - marginRight,
          currentY + 5,
          {
            align: "right",
          }
        );

        pdf.setDrawColor(...border);
        pdf.line(
          marginLeft,
          currentY + rowHeight,
          pageWidth - marginRight,
          currentY + rowHeight
        );

        currentY += rowHeight;
      }

      addRunningHeader();

      /*
      * PAGE 1: REPORT TITLE AND DECISION SUMMARY
      */
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...teal);

      pdf.text(
        "PLANNING RISK REPORT",
        marginLeft,
        currentY
      );

      currentY += 9;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(21);
      pdf.setTextColor(...navy);

      const addressLines =
        pdf.splitTextToSize(
          report.projects?.address ??
            "Planning Assessment",
          contentWidth
        ) as string[];

      pdf.text(
        addressLines,
        marginLeft,
        currentY
      );

      currentY +=
        addressLines.length * 8 + 3;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...lightSlate);

      pdf.text(
        [
          report.projects?.borough,
          report.projects?.project_type,
        ]
          .filter(Boolean)
          .join(" | ") ||
          "Project details unavailable",
        marginLeft,
        currentY
      );

      currentY += 10;

      const scoreBand =
        report.score >= 80
          ? "High likelihood"
          : report.score >= 60
            ? "Moderate likelihood"
            : "Higher planning risk";

      ensureSpace(43);

      pdf.setFillColor(...navy);

      pdf.roundedRect(
        marginLeft,
        currentY,
        contentWidth,
        38,
        3,
        3,
        "F"
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      pdf.setTextColor(...lime);

      pdf.text(
        `${report.score}`,
        marginLeft + 8,
        currentY + 17
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(203, 213, 225);

      pdf.text(
        "PLANNING RISK SCORE",
        marginLeft + 8,
        currentY + 25
      );

      const summaryX =
        marginLeft + 48;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(255, 255, 255);

      pdf.text(
        scoreBand,
        summaryX,
        currentY + 10
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(226, 232, 240);

      pdf.text(
        `Approval probability: ${report.approval_probability}%`,
        summaryX,
        currentY + 18
      );

      pdf.text(
        `Confidence: ${report.confidence}`,
        summaryX,
        currentY + 25
      );

      pdf.text(
        `Comparable approval rate: ${
          report.approvalRate !== null
            ? `${report.approvalRate}%`
            : "Not available"
        }`,
        summaryX,
        currentY + 32
      );

      currentY += 46;

      addSectionTitle(
        "Executive Summary"
      );

      addWrappedParagraph(
        report.executiveSummary,
        {
          fontSize: 10,
          lineHeight: 5.2,
          spacingAfter: 7,
        }
      );

      addSectionTitle(
        "Property Information"
      );

      addKeyValueRow(
        "Address",
        report.projects?.address ?? "—"
      );

      addKeyValueRow(
        "Borough",
        report.projects?.borough ?? "—"
      );

      addKeyValueRow(
        "Project type",
        report.projects
          ?.project_type ?? "—"
      );

      currentY += 7;

      /*
      * KEY SCORE DRIVERS
      */
      addSectionTitle(
        "Key Score Drivers"
      );

      const uniqueScoreDrivers = Array.from(
        (report.score_breakdown ?? [])
          .map(normalizeBreakdownItem)
          .map((item, index) => ({
            label: getBreakdownLabel(
              item,
              index
            ),
            impact: getBreakdownImpact(item),
          }))
          .reduce(
            (driverMap, driver) => {
              const normalizedLabel =
                driver.label
                  .trim()
                  .toLowerCase();

              if (!normalizedLabel) {
                return driverMap;
              }

              const existing =
                driverMap.get(
                  normalizedLabel
                );

              if (
                !existing ||
                Math.abs(driver.impact) >
                  Math.abs(existing.impact)
              ) {
                driverMap.set(
                  normalizedLabel,
                  driver
                );
              }

              return driverMap;
            },
            new Map<
              string,
              {
                label: string;
                impact: number;
              }
            >()
          )
          .values()
      );

      const scoreDrivers =
        uniqueScoreDrivers
          .sort(
            (first, second) =>
              Math.abs(second.impact) -
              Math.abs(first.impact)
          )
          .slice(0, 6);

      if (scoreDrivers.length === 0) {
        addWrappedParagraph(
          "No detailed score drivers are available for this assessment."
        );
      } else {
        for (const driver of scoreDrivers) {
          addScoreDriver(
            driver.label,
            driver.impact
          );
        }

        currentY += 5;
      }

      /*
      * PLANNING CONSTRAINTS
      */
      addSectionTitle(
        "Key Planning Constraints"
      );

      const uniqueConstraints = Array.from(
        report.constraints.reduce(
          (constraintMap, constraint) => {
            const normalizedName =
              constraint.constraint_type
                ?.trim()
                .toLowerCase();

            if (!normalizedName) {
              return constraintMap;
            }

            const existing =
              constraintMap.get(
                normalizedName
              );

            const currentPenalty =
              Math.abs(
                constraint.risk_penalty ?? 0
              );

            const existingPenalty =
              Math.abs(
                existing?.risk_penalty ?? 0
              );

            if (
              !existing ||
              currentPenalty >
                existingPenalty
            ) {
              constraintMap.set(
                normalizedName,
                constraint
              );
            }

            return constraintMap;
          },
          new Map<
            string,
            (typeof report.constraints)[number]
          >()
        ).values()
      );

      const constraints =
        uniqueConstraints
          .sort(
            (first, second) =>
              Math.abs(
                second.risk_penalty ?? 0
              ) -
              Math.abs(
                first.risk_penalty ?? 0
              )
          )
          .slice(0, 6);

      if (constraints.length === 0) {
        addWrappedParagraph(
          "No recorded planning constraints were identified for this assessment.",
          {
            color: [5, 150, 105],
          }
        );
      } else {
        for (const constraint of constraints) {
          addConstraint(
            constraint.constraint_type,
            Math.abs(
              constraint.risk_penalty ?? 0
            )
          );
        }
      }

      /*
      * COMPARABLE EVIDENCE
      */
      addSectionTitle(
        "Comparable Planning Evidence"
      );

      addWrappedParagraph(
        `${
          report.approvedCount
        } comparable applications were approved and ${
          report.refusedCount
        } were refused.${
          report.approvalRate !== null
            ? ` The recorded comparable approval rate is ${report.approvalRate}%.`
            : ""
        }`,
        {
          spacingAfter: 6,
        }
      );

      const applications =
        report.similarApplications.slice(
          0,
          8
        );

      if (applications.length === 0) {
        addWrappedParagraph(
          "No comparable nearby applications were found."
        );
      } else {
        for (const application of applications) {
          addComparableRow(
            application.address,
            application.decision ??
              "Unknown",
            application.borough
          );
        }

        if (
          report.similarApplications
            .length >
          applications.length
        ) {
          currentY += 4;

          addWrappedParagraph(
            `Showing ${applications.length} of ${report.similarApplications.length} comparable applications. Additional evidence is available in the PlotWize workspace.`,
            {
              fontSize: 8.5,
              color: lightSlate,
            }
          );
        }
      }

      /*
      * RECOMMENDATION
      */
      addSectionTitle(
        "Recommendation"
      );

      const recommendation =
        report.score >= 80
          ? "The proposal has a strong likelihood of approval. Proceed while maintaining full compliance with local planning policy and preserving design quality."
          : report.score >= 60
            ? "The proposal has reasonable planning prospects. Review the design carefully and consider pre-application advice before submission."
            : report.score >= 40
              ? "Material planning risks have been identified. Consider design revisions and pre-application engagement with the local authority."
              : "Significant planning risks have been identified. Obtain professional planning advice before committing further resources.";

      addWrappedParagraph(
        recommendation,
        {
          fontSize: 10,
          lineHeight: 5.2,
          fontStyle: "bold",
          color: navy,
          spacingAfter: 7,
        }
      );

      addSectionTitle(
        "Suggested Next Steps"
      );

      const nextSteps =
        report.score >= 80
          ? [
              "Confirm compliance with borough-specific planning policies.",
              "Prepare a complete design and access statement.",
              "Validate all site constraints before formal submission.",
            ]
          : report.score >= 60
            ? [
                "Request pre-application planning advice.",
                "Review the strongest negative score drivers.",
                "Prepare supporting design, heritage, flood or transport evidence where applicable.",
              ]
            : [
                "Engage a qualified planning consultant.",
                "Resolve the highest-impact constraints before submission.",
                "Consider revising the project scope or design.",
              ];

      nextSteps.forEach(
        (step, index) => {
          addWrappedParagraph(
            `${index + 1}. ${step}`,
            {
              indent: 2,
              spacingAfter: 2,
            }
          );
        }
      );

      currentY += 5;

      addSectionTitle(
        "Legal Disclaimer"
      );

      addWrappedParagraph(
        "This report is generated by PlotWize using publicly available planning data and a rule-based risk scoring model. It is provided for informational purposes only and does not constitute professional planning, investment or legal advice. Always consult an appropriately qualified planning professional before making development or investment decisions. PlotWize accepts no liability for decisions made in reliance on this report.",
        {
          fontSize: 8,
          lineHeight: 4.2,
          color: lightSlate,
        }
      );

      /*
      * PAGE NUMBERS AND FOOTERS
      */
      const totalPages =
        pdf.getNumberOfPages();

      for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber += 1
      ) {
        pdf.setPage(pageNumber);

        pdf.setDrawColor(...border);
        pdf.line(
          marginLeft,
          pageHeight - 11,
          pageWidth - marginRight,
          pageHeight - 11
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(7.5);
        pdf.setTextColor(...lightSlate);

        pdf.text(
          "PlotWize planning intelligence",
          marginLeft,
          pageHeight - 6
        );

        pdf.text(
          `Page ${pageNumber} of ${totalPages}`,
          pageWidth - marginRight,
          pageHeight - 6,
          {
            align: "right",
          }
        );
      }

      pdf.save(
        createSafeFilename(
          report.projects?.address
        )
      );
    } catch (error) {
      console.error(
        "Report PDF export failed:",
        error
      );

      setExportErrorMessage(
        error instanceof Error
          ? error.message
          : "The PDF could not be generated."
      );
    } finally {
      setIsExporting(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          ...sans,
          display: "flex",
          minHeight: "60vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div className="report-spinner" />

        <p
          style={{
            margin: 0,
            color: "#94A3B8",
            fontSize: 14,
          }}
        >
          Loading report...
        </p>

        <style>{`
          .report-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #EAF3DE;
            border-top-color: #A3E635;
            border-radius: 999px;
            animation: report-spin 0.8s linear infinite;
          }

          @keyframes report-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div
        style={{
          ...sans,
          maxWidth: 720,
          margin: "0 auto",
          padding: "40px 0",
        }}
      >
        <div
          style={{
            padding: 20,
            border: "1px solid #FECACA",
            borderRadius: 12,
            background: "#FEF2F2",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px",
              color: "#991B1B",
              fontSize: 17,
            }}
          >
            Report unavailable
          </h1>

          <p
            style={{
              margin: "0 0 16px",
              color: "#B91C1C",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {errorMessage ||
              "The report could not be found."}
          </p>

          <Link
            href="/reports"
            style={{
              color: "#991B1B",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← Return to reports
          </Link>
        </div>
      </div>
    );
  }

  const project = report.projects;

  const recommendation =
    report.score >= 80
      ? "Strong likelihood of approval. Proceed with confidence while maintaining full compliance with local planning policy. Ensure design quality is maintained throughout."
      : report.score >= 60
        ? "Reasonable planning prospects. Review design details carefully before submission and consider pre-application advice to strengthen your case."
        : report.score >= 40
          ? "Planning risks have been identified. Consider design revisions and pre-application engagement with the local authority before proceeding to formal submission."
          : "Significant planning risks have been detected. Professional planning advice is strongly recommended before committing further resources to this site.";

  const scoreColor =
    report.score >= 80
      ? "#A3E635"
      : report.score >= 60
        ? "#F59E0B"
        : "#EF4444";

  const breakdown =
    (report.score_breakdown ?? []).map(
      normalizeBreakdownItem
    );

  const keyBreakdown = [...breakdown]
    .sort(
      (first, second) =>
        Math.abs(
          getBreakdownImpact(second)
        ) -
        Math.abs(
          getBreakdownImpact(first)
        )
    )
    .slice(0, 6);

  const keyConstraints = [
    ...report.constraints,
  ]
    .sort(
      (first, second) =>
        Math.abs(
          second.risk_penalty ?? 0
        ) -
        Math.abs(
          first.risk_penalty ?? 0
        )
    )
    .slice(0, 6);

  const topSimilarApplications =
    report.similarApplications.slice(
      0,
      8
    );

  return (
    <>
      <style>{`
        .report-detail-page {
          width: 100%;
          max-width: 920px;
        }

        .report-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .report-export-button {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          background: #A3E635;
          color: #0B1628;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .report-export-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .report-document {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
          border-radius: 16px;
          background: #F8FAFC;
        }
        .report-document
          [data-pdf-section="true"] {
          margin-bottom: 0 !important;
        }
        .report-document-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .report-hero {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 40px;
          align-items: center;
        }

        .report-history-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .report-history-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .report-similar-summary {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .report-similar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 760px) {
          .report-page-header {
            flex-direction: column;
          }

          .report-export-button {
            width: 100%;
          }

          .report-document {
            padding: 16px;
          }

          .report-document-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .report-hero {
            grid-template-columns: minmax(0, 1fr);
            gap: 24px;
            padding: 26px 22px !important;
          }

          .report-history-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 560px) {
          .report-page-title {
            font-size: 27px !important;
          }

          .report-history-stats {
            grid-template-columns: minmax(0, 1fr);
          }

          .report-similar-summary {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
          }

          .report-similar-row,
          .report-info-row {
            align-items: flex-start !important;
            flex-direction: column;
            gap: 5px !important;
          }

          .report-similar-row span,
          .report-info-row span {
            text-align: left !important;
          }
        }

        @media print {
          .report-page-actions {
            display: none !important;
          }
        }
      `}</style>

      <main
        className="report-detail-page"
        style={sans}
      >
        <div className="report-page-actions">
          <Link
            href="/reports"
            style={{
              display: "inline-flex",
              marginBottom: 18,
              color: "#64748B",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Back to reports
          </Link>

          <div className="report-page-header">
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: TEAL,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                }}
              >
                Planning Assessment Report
              </p>

              <h1
                className="report-page-title"
                style={{
                  ...serif,
                  margin: "0 0 4px",
                  color: "#0D2137",
                  fontSize: 30,
                  fontWeight: 300,
                  letterSpacing: "-0.5px",
                  overflowWrap: "anywhere",
                }}
              >
                {project?.address ??
                  "Assessment Report"}
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#94A3B8",
                  fontSize: 13,
                }}
              >
                {project?.borough ??
                  "Borough unavailable"}{" "}
                ·{" "}
                {project?.project_type ??
                  "Project type unavailable"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void exportPdf();
              }}
              disabled={isExporting}
              className="report-export-button"
            >
              {isExporting ? (
                <>
                  <span className="report-button-spinner" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line
                      x1="12"
                      y1="15"
                      x2="12"
                      y2="3"
                    />
                  </svg>

                  Export PDF
                </>
              )}
            </button>
          </div>

          {exportErrorMessage ? (
            <div
              role="alert"
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                border: "1px solid #FECACA",
                borderRadius: 8,
                background: "#FEF2F2",
                color: "#B91C1C",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {exportErrorMessage}
            </div>
          ) : null}
        </div>

        <div
          className="report-document"
        >
          <div
            data-pdf-section="true"
            className="report-document-header"
            style={{
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "2px solid #E8EDF2",
            }}
          >
            <div>
              <p
                style={{
                  ...serif,
                  margin: "0 0 2px",
                  color: "#0D2137",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                Plot
                <span style={{ color: TEAL }}>
                  Wise
                </span>
              </p>

              <p
                style={{
                  margin: 0,
                  color: "#94A3B8",
                  fontSize: 11,
                  letterSpacing: "0.5px",
                }}
              >
                PLANNING INTELLIGENCE FOR BETTER
                DECISIONS
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: "0 0 2px",
                  color: "#94A3B8",
                  fontSize: 11,
                }}
              >
                Report generated
              </p>

              <p
                style={{
                  margin: 0,
                  color: "#0D2137",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {new Date().toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          <section
            data-pdf-section="true"
            className="report-hero"
            style={{
              position: "relative",
              overflow: "hidden",
              marginBottom: 16,
              padding: "32px 36px",
              borderRadius: 16,
              background: `linear-gradient(135deg, #0D2137 0%, ${TEAL} 100%)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 280,
                height: 280,
                border:
                  "1px solid rgba(255,255,255,0.07)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                right: 20,
                bottom: -40,
                width: 160,
                height: 160,
                border:
                  "1px solid rgba(255,255,255,0.05)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            <ScoreGauge
              score={report.score}
            />

            <div
              style={{
                position: "relative",
                minWidth: 0,
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  color:
                    "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.4px",
                }}
              >
                Assessment Summary
              </p>

              <p
                style={{
                  maxWidth: 460,
                  margin: "0 0 24px",
                  color:
                    "rgba(255,255,255,0.85)",
                  fontSize: 15,
                  lineHeight: 1.65,
                }}
              >
                {report.summary ||
                  report.executiveSummary}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 28,
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    label:
                      "Approval Probability",
                    value: `${report.approval_probability}%`,
                    color: scoreColor,
                  },
                  {
                    label: "Likelihood",
                    value:
                      report.approval_likelihood,
                    color: "#FFFFFF",
                  },
                  {
                    label: "Confidence",
                    value: report.confidence,
                    color: "#FFFFFF",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        color:
                          "rgba(255,255,255,0.35)",
                        fontSize: 10,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.6px",
                      }}
                    >
                      {item.label}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: item.color,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Section
            title="Property Information"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={TEAL}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle
                  cx="12"
                  cy="9"
                  r="2.5"
                />
              </svg>
            }
          >
            <InfoRow
              label="Property Address"
              value={
                project?.address ?? "—"
              }
            />

            <InfoRow
              label="Borough"
              value={
                project?.borough ?? "—"
              }
            />

            <InfoRow
              label="Project Type"
              value={
                project?.project_type ?? "—"
              }
            />
          </Section>

          <Section
            title="Key Score Drivers"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={TEAL}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line
                  x1="18"
                  y1="20"
                  x2="18"
                  y2="10"
                />
                <line
                  x1="12"
                  y1="20"
                  x2="12"
                  y2="4"
                />
                <line
                  x1="6"
                  y1="20"
                  x2="6"
                  y2="14"
                />
              </svg>
            }
          >
            {keyBreakdown.length > 0 ? (
              <div style={{ marginBottom: 12 }}>
                {keyBreakdown.map(
                  (item, index) => {
                    const impact =
                      getBreakdownImpact(
                        item
                      );

                    const positive =
                      impact > 0;

                    const neutral =
                      impact === 0;

                    return (
                      <div
                        key={`${getBreakdownLabel(
                          item,
                          index
                        )}-${index}`}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: 16,
                          padding: "11px 0",
                          borderBottom:
                            "1px solid #F8FAFC",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 10,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              flexShrink: 0,
                              borderRadius:
                                "50%",
                              background:
                                positive
                                  ? "#A3E635"
                                  : neutral
                                    ? "#94A3B8"
                                    : "#EF4444",
                            }}
                          />

                          <span
                            style={{
                              color:
                                "#475569",
                              fontSize: 13,
                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {getBreakdownLabel(
                              item,
                              index
                            )}
                          </span>
                        </div>

                        <span
                          style={{
                            minWidth: 48,
                            color: positive
                              ? "#16A34A"
                              : neutral
                                ? "#64748B"
                                : "#DC2626",
                            fontSize: 13,
                            fontWeight: 700,
                            textAlign:
                              "right",
                          }}
                        >
                          {impact > 0
                            ? `+${impact}`
                            : impact}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p
                style={{
                  margin: "0 0 14px",
                  color: "#94A3B8",
                  fontSize: 13,
                }}
              >
                No significant score drivers are
                available for this assessment.
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 16,
                marginTop: 4,
                padding: "14px 16px",
                borderRadius: 10,
                background: "#0D2137",
              }}
            >
              <span
                style={{
                  color:
                    "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Final Planning Risk Score
              </span>

              <span
                style={{
                  ...serif,
                  color: scoreColor,
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {report.score}
              </span>
            </div>
          </Section>

          <Section
            title="Planning Constraints"
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={TEAL}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            }
          >
            {keyConstraints.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {keyConstraints.map(
                  (constraint) => (
                    <div
                      key={constraint.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: 16,
                        padding: "12px 16px",
                        border:
                          "1px solid #FECACA",
                        borderLeft:
                          "3px solid #EF4444",
                        borderRadius: 10,
                        background: "#FEF2F2",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin:
                              "0 0 2px",
                            color:
                              "#0D2137",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {
                            constraint.constraint_type
                          }
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color:
                              "#94A3B8",
                            fontSize: 11,
                          }}
                        >
                          Planning constraint
                        </p>
                      </div>

                      <span
                        style={{
                          flexShrink: 0,
                          color: "#DC2626",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        −
                        {Math.abs(
                          constraint.risk_penalty ??
                            0
                        )}{" "}
                        pts
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  border:
                    "1px solid #A7F3D0",
                  borderLeft:
                    "3px solid #10B981",
                  borderRadius: 10,
                  background: "#ECFDF5",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>

                <p
                  style={{
                    margin: 0,
                    color: "#059669",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  No planning constraints were
                  identified for this site.
                </p>
              </div>
            )}
          </Section>

          <div
            data-pdf-section="true"
            className="report-history-grid"
          >
            <section
              style={{
                overflow: "hidden",
                border:
                  "1px solid #E8EDF2",
                borderRadius: 14,
                background: "#FFFFFF",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "15px 24px",
                  borderBottom:
                    "1px solid #F1F5F9",
                  background: "#FAFBFC",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0D2137",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.8px",
                  }}
                >
                  Historical Approval Rate
                </h2>
              </div>

              <div
                style={{
                  padding: "20px 24px",
                }}
              >
                {report.approvalRate !==
                null ? (
                  <div className="report-history-stats">
                    {[
                      {
                        label:
                          "Approval rate",
                        value: `${report.approvalRate}%`,
                        color:
                          "#059669",
                        background:
                          "#ECFDF5",
                      },
                      {
                        label: "Approved",
                        value:
                          report.approvedCount,
                        color:
                          "#059669",
                        background:
                          "#F0FDF4",
                      },
                      {
                        label: "Refused",
                        value:
                          report.refusedCount,
                        color:
                          "#DC2626",
                        background:
                          "#FEF2F2",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background:
                            item.background,
                          textAlign:
                            "center",
                        }}
                      >
                        <p
                          style={{
                            ...serif,
                            margin:
                              "0 0 3px",
                            color:
                              item.color,
                            fontSize: 24,
                            fontWeight: 600,
                          }}
                        >
                          {item.value}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color:
                              "#64748B",
                            fontSize: 11,
                          }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      color:
                        "#94A3B8",
                      fontSize: 13,
                    }}
                  >
                    No comparable application
                    history is available.
                  </p>
                )}
              </div>
            </section>

            <section
              style={{
                overflow: "hidden",
                border:
                  "1px solid #E8EDF2",
                borderRadius: 14,
                background: "#FFFFFF",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  padding: "15px 24px",
                  borderBottom:
                    "1px solid #F1F5F9",
                  background: "#FAFBFC",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0D2137",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.8px",
                  }}
                >
                  Assessment Confidence
                </h2>
              </div>

              <div
                style={{
                  padding: "20px 24px",
                }}
              >
                <p
                  style={{
                    ...serif,
                    margin: "0 0 6px",
                    color: "#0D2137",
                    fontSize: 32,
                    fontWeight: 600,
                  }}
                >
                  {report.confidence}
                </p>

                <p
                  style={{
                    margin: 0,
                    color: "#64748B",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  Based on available planning
                  constraints and comparable
                  application history.
                </p>
              </div>
            </section>
          </div>

          <Section title="Similar Nearby Applications">
            {topSimilarApplications.length >
            0 ? (
              <div>
                <div className="report-similar-summary">
                  {[
                    {
                      label: "Approved",
                      value:
                        report.approvedCount,
                      color: "#059669",
                      background:
                        "#ECFDF5",
                    },
                    {
                      label: "Refused",
                      value:
                        report.refusedCount,
                      color: "#DC2626",
                      background:
                        "#FEF2F2",
                    },
                    {
                      label: "Local rate",
                      value:
                        report.approvalRate !==
                        null
                          ? `${report.approvalRate}%`
                          : "N/A",
                      color: TEAL,
                      background:
                        "#F0F9FF",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        padding:
                          "10px 14px",
                        borderRadius: 8,
                        background:
                          item.background,
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin:
                            "0 0 2px",
                          color: item.color,
                          fontSize: 18,
                          fontWeight: 700,
                        }}
                      >
                        {item.value}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748B",
                          fontSize: 11,
                        }}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {topSimilarApplications.map(
                  (
                    application,
                    index
                  ) => {
                    const approved =
                      application.decision
                        ?.trim()
                        .toLowerCase() ===
                      "approved";

                    return (
                      <div
                        key={
                          application.id
                        }
                        className="report-similar-row"
                        style={{
                          padding:
                            "10px 0",
                          borderBottom:
                            index <
                            report
                              .similarApplications
                              .length -
                              1
                              ? "1px solid #F8FAFC"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            minWidth: 0,
                            color:
                              "#475569",
                            fontSize: 13,
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {
                            application.address
                          }
                        </span>

                        <span
                          style={{
                            flexShrink: 0,
                            padding:
                              "3px 10px",
                            borderRadius:
                              99,
                            background:
                              approved
                                ? "#ECFDF5"
                                : "#FEF2F2",
                            color: approved
                              ? "#059669"
                              : "#DC2626",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {application.decision ??
                            "Unknown"}
                        </span>
                      </div>
                    );
                  }
                )}
                {report.similarApplications.length >
                topSimilarApplications.length ? (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "#94A3B8",
                      fontSize: 11,
                      lineHeight: 1.5,
                    }}
                  >
                    Showing the first{" "}
                    {topSimilarApplications.length} of{" "}
                    {
                      report.similarApplications
                        .length
                    } comparable applications.
                    Additional evidence remains
                    available in the PlotWize web
                    workspace.
                  </p>
                ) : null}
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: "#94A3B8",
                  fontSize: 13,
                }}
              >
                No similar applications were
                found for this area and project
                type.
              </p>
            )}
          </Section>

          <section
            data-pdf-section="true"
            style={{
              marginBottom: 16,
              padding: "24px 28px",
              borderRadius: 14,
              background: `linear-gradient(135deg, #0D2137 0%, ${TEAL} 100%)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                  border:
                    "1px solid rgba(163,230,53,0.3)",
                  borderRadius: 99,
                  background:
                    "rgba(163,230,53,0.15)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A3E635"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                  />
                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                  />
                </svg>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#A3E635",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "1.2px",
                  }}
                >
                  Recommendation
                </p>

                <p
                  style={{
                    margin: 0,
                    color:
                      "rgba(255,255,255,0.9)",
                    fontSize: 15,
                    lineHeight: 1.65,
                  }}
                >
                  {recommendation}
                </p>
              </div>
            </div>
          </section>

          <div
            data-pdf-section="true"
            style={{
              padding: "16px 20px",
              border:
                "1px solid #E2E8F0",
              borderRadius: 10,
              background: "#F1F5F9",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#94A3B8",
                fontSize: 11,
                lineHeight: 1.65,
                textAlign: "center",
              }}
            >
              <strong
                style={{
                  color: "#64748B",
                }}
              >
                Legal Disclaimer:
              </strong>{" "}
              This report is generated by
              PlotWize using publicly available
              planning data and a rule-based risk
              scoring model. It is for
              informational purposes only and
              does not constitute professional
              planning or legal advice. Always
              consult a qualified planning
              consultant before making
              investment or development
              decisions. PlotWize accepts no
              liability for decisions made
              based on this report.
            </p>
          </div>
        </div>

        <style>{`
          .report-button-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(11, 22, 40, 0.25);
            border-top-color: #0B1628;
            border-radius: 999px;
            animation: report-button-spin 0.7s linear infinite;
          }

          @keyframes report-button-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    </>
  );
}