"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePensionSettings } from "../hooks/use-pension-settings";

export type { SettingsPayload } from "../hooks/use-pension-settings";

export function PensionSettingsPanel() {
  const { loading, saving, form, handleChange, handleSave, handleReset } = usePensionSettings();

  if (loading || !form) {
    return <div className="p-8 text-center text-gray-600">Einstellungen werden geladen...</div>;
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
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-medium mb-3">Steuersystem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Stufe 1 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tax_system.rates.stufe_1}
                      onChange={(e) => handleChange("tax_system.rates.stufe_1", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Stufe 2 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tax_system.rates.stufe_2}
                      onChange={(e) => handleChange("tax_system.rates.stufe_2", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Stufe 3 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tax_system.rates.stufe_3}
                      onChange={(e) => handleChange("tax_system.rates.stufe_3", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Stufe 4 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tax_system.rates.stufe_4}
                      onChange={(e) => handleChange("tax_system.rates.stufe_4", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Stufe 5 (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tax_system.rates.stufe_5}
                      onChange={(e) => handleChange("tax_system.rates.stufe_5", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Grenze 1 (EUR)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.tax_system.thresholds.threshold_1}
                      onChange={(e) =>
                        handleChange("tax_system.thresholds.threshold_1", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Grenze 2 (EUR)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.tax_system.thresholds.threshold_2}
                      onChange={(e) =>
                        handleChange("tax_system.thresholds.threshold_2", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Grenze 3 (EUR)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.tax_system.thresholds.threshold_3}
                      onChange={(e) =>
                        handleChange("tax_system.thresholds.threshold_3", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Grenze 4 (EUR)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.tax_system.thresholds.threshold_4}
                      onChange={(e) =>
                        handleChange("tax_system.thresholds.threshold_4", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Soli (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tax_system.solidarity_surcharge_rate}
                      onChange={(e) =>
                        handleChange("tax_system.solidarity_surcharge_rate", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <Label>Soli Schwelle (EUR)</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form.tax_system.solidarity_surcharge_threshold}
                      onChange={(e) =>
                        handleChange("tax_system.solidarity_surcharge_threshold", e.target.value)
                      }
                    />
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
