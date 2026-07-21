"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePensionSettings, type PensionParameters } from "../hooks/use-pension-settings";
import { get } from "@/lib/utils/object-access";

export type { SettingsPayload } from "../hooks/use-pension-settings";

/** Labeled numeric input bound to a dot-path inside the parameters form. */
function ZoneField({
  label,
  path,
  form,
  onChange,
  compact = false,
}: {
  label: string;
  path: string;
  form: PensionParameters;
  onChange: (path: string, raw: string) => void;
  compact?: boolean;
}) {
  const value = get(form, path);
  if (compact) {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}</Label>
        <Input
          type="number"
          step="0.01"
          value={value ?? ""}
          onChange={(e) => onChange(path, e.target.value)}
        />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 items-center">
      <Label>{label}</Label>
      <Input
        type="number"
        step="0.01"
        value={value ?? ""}
        onChange={(e) => onChange(path, e.target.value)}
      />
    </div>
  );
}

export function PensionSettingsPanel() {
  const { loading, saving, form, handleChange, handleSave, handleReset } = usePensionSettings();

  if (loading || !form) {
    return (
      <div className="p-8 text-center text-muted-foreground">Einstellungen werden geladen…</div>
    );
  }

  const s = form.social_insurance;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Einfache Pensionsparameter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Wirtschaftliche Annahmen</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="inflation_rate">Inflation (%)</Label>
                  <Input
                    id="inflation_rate"
                    type="number"
                    step="0.1"
                    value={form.economic_assumptions.inflation_rate}
                    onChange={(e) =>
                      handleChange("economic_assumptions.inflation_rate", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="pension_increase_rate">Rentensteigerung (%)</Label>
                  <Input
                    id="pension_increase_rate"
                    type="number"
                    step="0.1"
                    value={form.economic_assumptions.pension_increase_rate}
                    onChange={(e) =>
                      handleChange("economic_assumptions.pension_increase_rate", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="investment_return_rate">Kapitalrendite (%)</Label>
                  <Input
                    id="investment_return_rate"
                    type="number"
                    step="0.1"
                    value={form.economic_assumptions.investment_return_rate}
                    onChange={(e) =>
                      handleChange("economic_assumptions.investment_return_rate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Sozialversicherung</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="health_insurance_rate">KV Beitrag (%)</Label>
                  <Input
                    id="health_insurance_rate"
                    type="number"
                    step="0.01"
                    value={s.health_insurance_rate}
                    onChange={(e) =>
                      handleChange("social_insurance.health_insurance_rate", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="additional_health_insurance_rate">Zusatzbeitrag KV (%)</Label>
                  <Input
                    id="additional_health_insurance_rate"
                    type="number"
                    step="0.01"
                    value={s.additional_health_insurance_rate}
                    onChange={(e) =>
                      handleChange(
                        "social_insurance.additional_health_insurance_rate",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="care_insurance_rate">Pflegeversicherung (%)</Label>
                  <Input
                    id="care_insurance_rate"
                    type="number"
                    step="0.01"
                    value={s.care_insurance_rate}
                    onChange={(e) =>
                      handleChange("social_insurance.care_insurance_rate", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label>Ges. KV gesamt (%)</Label>
                  <Input value={s.total_insurance_rate} readOnly />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="health_insurance_exemption_bav">Freibetrag BAV (EUR)</Label>
                  <Input
                    id="health_insurance_exemption_bav"
                    type="number"
                    step="0.01"
                    value={s.health_insurance_exemption_bav}
                    onChange={(e) =>
                      handleChange(
                        "social_insurance.health_insurance_exemption_bav",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="care_insurance_childless_surcharge">
                    PV-Zuschlag Kinderlose (%)
                  </Label>
                  <Input
                    id="care_insurance_childless_surcharge"
                    type="number"
                    step="0.1"
                    value={s.care_insurance_childless_surcharge ?? 0.6}
                    onChange={(e) =>
                      handleChange(
                        "social_insurance.care_insurance_childless_surcharge",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <Label htmlFor="bbg_health_monthly">BBG-KV monatlich (EUR)</Label>
                  <Input
                    id="bbg_health_monthly"
                    type="number"
                    step="0.01"
                    value={s.bbg_health_monthly ?? 5812.5}
                    onChange={(e) =>
                      handleChange("social_insurance.bbg_health_monthly", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium mb-3">Einkommensteuer (§32a EStG)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Zonengrenzen und Koeffizienten des amtlichen Steuertarifs — jährlich mit dem
                Jahressteuergesetz aktualisieren.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <ZoneField
                    label="Grundfreibetrag (EUR)"
                    path="tax_system.income_tax_zones.zone1_end"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Ende Progressionszone 1 (EUR)"
                    path="tax_system.income_tax_zones.zone2_end"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Ende Progressionszone 2 (EUR)"
                    path="tax_system.income_tax_zones.zone3_end"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Beginn Reichensteuer (EUR)"
                    path="tax_system.income_tax_zones.zone4_end"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Werbungskosten-Pauschbetrag (EUR)"
                    path="tax_system.income_tax_zones.werbungskosten_pauschbetrag"
                    form={form}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <ZoneField
                    label="Spitzensteuersatz Zone 4 (%)"
                    path="tax_system.income_tax_zones.zone4_rate"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Reichensteuersatz Zone 5 (%)"
                    path="tax_system.income_tax_zones.zone5_rate"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Besteuerungsanteil gesetzl. Rente (%)"
                    path="tax_system.statutory_pension_taxable_share"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Soli (%)"
                    path="tax_system.solidarity_surcharge_rate"
                    form={form}
                    onChange={handleChange}
                  />
                  <ZoneField
                    label="Soli-Freigrenze (EUR Steuer)"
                    path="tax_system.solidarity_surcharge_threshold"
                    form={form}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium mb-2">Progressionskoeffizienten (§32a)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {(
                      [
                        ["Zone 2 Faktor", "zone2_factor"],
                        ["Zone 2 Basis", "zone2_base"],
                        ["Zone 3 Faktor", "zone3_factor"],
                        ["Zone 3 Basis", "zone3_base"],
                        ["Zone 3 Konstante", "zone3_const"],
                        ["Zone 4 Konstante", "zone4_const"],
                        ["Zone 5 Konstante", "zone5_const"],
                      ] as const
                    ).map(([label, key]) => (
                      <ZoneField
                        key={key}
                        label={label}
                        path={`tax_system.income_tax_zones.${key}`}
                        form={form}
                        onChange={handleChange}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium mb-3">Regionale Steuern & Demografie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Kirchensteuer BY/BW (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.regional_taxes?.church_tax_bavaria_bw ?? 8}
                      onChange={(e) =>
                        handleChange("regional_taxes.church_tax_bavaria_bw", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Kirchensteuer Rest (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.regional_taxes?.church_tax_other_states ?? 9}
                      onChange={(e) =>
                        handleChange("regional_taxes.church_tax_other_states", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Renteneintrittsalter</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.demographics?.retirement_age ?? 67}
                      onChange={(e) => handleChange("demographics.retirement_age", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Lebensalter (Ende Rente)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.demographics?.life_expectancy ?? 85}
                      onChange={(e) => handleChange("demographics.life_expectancy", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              Zurücksetzen
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Speichert..." : "Änderungen speichern"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
