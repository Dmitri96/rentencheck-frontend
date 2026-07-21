"use client";

import type { PensionAnalysis } from "../hooks/use-pension-analysis";

/**
 * The Bild-0 results table: one row per income source with the backend's
 * Brutto → Steuer → KV → Kaufkraft pipeline, plus the Versorgungslücke
 * footer. Pure rendering — every number comes from the analysis response.
 */
export function PensionBreakdownTable({ analysis }: { analysis: PensionAnalysis }) {
  const { rows, totals, desired_pension, gap, private_health_insurance: pkv } = analysis;
  const hasPkv = pkv.monthly_at_retirement > 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            <Th align="left">Einkommensquelle</Th>
            <Th>Brutto (zum Rentenbeginn)</Th>
            <Th>Steuer</Th>
            <Th>Kirche</Th>
            <Th>Soli</Th>
            <Th>Nach Steuer</Th>
            <Th>KV/PV</Th>
            <Th>Nach KV</Th>
            <Th>Kaufkraft (heute)</Th>
          </tr>
        </thead>
        <tbody className="[&_tr:nth-child(even)]:bg-[var(--surface-subtle)]">
          <tr className="border-b border-border-subtle">
            <Td align="left" strong>
              Ihr Rentenwunsch
            </Td>
            <Td strong>{fmt(desired_pension.at_retirement)}</Td>
            <Td tone="muted">—</Td>
            <Td tone="muted">—</Td>
            <Td tone="muted">—</Td>
            <Td tone="muted">—</Td>
            <Td tone="muted">—</Td>
            <Td tone="muted">—</Td>
            <Td strong>{fmt(desired_pension.today)}</Td>
          </tr>

          {rows.map((row) => (
            <tr key={row.key}>
              <Td align="left" strong>
                {row.label}
              </Td>
              <Td>{fmt(row.gross_at_retirement)}</Td>
              <Td tone="muted">{fmt(row.income_tax)}</Td>
              <Td tone="muted">{fmt(row.church_tax)}</Td>
              <Td tone="muted">{fmt(row.solidarity_surcharge)}</Td>
              <Td>{fmt(row.after_tax)}</Td>
              <Td tone="muted">{fmt(row.health_care_insurance)}</Td>
              <Td tone="success">{fmt(row.after_insurance)}</Td>
              <Td tone="success" strong>
                {fmt(row.purchasing_power)}
              </Td>
            </tr>
          ))}

          {hasPkv && (
            <tr>
              <Td align="left" strong>
                Private Krankenversicherung (Beitrag)
              </Td>
              <Td tone="muted">−{fmt(pkv.monthly_at_retirement)}</Td>
              <Td tone="muted">—</Td>
              <Td tone="muted">—</Td>
              <Td tone="muted">—</Td>
              <Td tone="muted">—</Td>
              <Td tone="muted">—</Td>
              <Td tone="muted">—</Td>
              <Td tone="muted">−{fmt(pkv.purchasing_power)}</Td>
            </tr>
          )}

          <tr className="border-t border-foreground/20 bg-muted">
            <Td align="left" strong>
              Gesamt
            </Td>
            <Td strong>{fmt(totals.gross_at_retirement)}</Td>
            <Td tone="muted">{fmt(totals.income_tax)}</Td>
            <Td tone="muted">{fmt(totals.church_tax)}</Td>
            <Td tone="muted">{fmt(totals.solidarity_surcharge)}</Td>
            <Td strong>{fmt(totals.after_tax)}</Td>
            <Td tone="muted">{fmt(totals.health_care_insurance)}</Td>
            <Td tone="success" strong>
              {fmt(totals.after_insurance)}
            </Td>
            <Td tone="success" strong>
              {fmt(totals.purchasing_power - pkv.purchasing_power)}
            </Td>
          </tr>
        </tbody>
      </table>

      {/* Versorgungslücke footer (Bild 0, bottom block) */}
      <div className="border-t border-foreground/20 px-3 py-4 space-y-2 text-sm">
        <FooterLine
          label="Versorgungslücke (Altersrente, heutige Kaufkraft)"
          value={fmt(gap.monthly_today)}
          tone={gap.monthly_today > 0 ? "danger" : "success"}
        />
        <FooterLine
          label={`Bei ${analysis.inflationRate.toLocaleString("de-DE")} % Inflation erhöht sich Ihre Lücke zum Rentenbeginn auf`}
          value={fmt(gap.monthly_at_retirement)}
        />
        <FooterLine
          label="Dies entspricht einem zusätzlichen Kapitalbedarf pro Jahr von"
          value={fmt(gap.annual_at_retirement)}
        />
      </div>
    </div>
  );
}

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmt(amount: number) {
  return eur.format(amount);
}

function FooterLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger" | "success";
}) {
  const valueColor =
    tone === "danger"
      ? "font-semibold text-destructive"
      : tone === "success"
        ? "font-semibold text-success"
        : "text-foreground";
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums currency ${valueColor}`}>{value}</span>
    </div>
  );
}

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th className={`label-uppercase px-3 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = "right",
  strong = false,
  tone,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  strong?: boolean;
  tone?: "muted" | "success";
}) {
  const color =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "success"
        ? "text-success"
        : "text-foreground";
  return (
    <td
      className={[
        "px-3 py-3",
        align === "right" ? "text-right" : "text-left",
        align === "right" ? "font-mono tabular-nums currency" : "",
        strong ? "font-medium" : "",
        color,
      ].join(" ")}
    >
      {children}
    </td>
  );
}
