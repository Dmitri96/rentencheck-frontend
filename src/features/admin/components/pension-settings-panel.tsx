"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { get, set } from "@/lib/utils/object-access";

type SettingRow = {
  id: number;
  key: string;
  value: number | string;
  unit: string;
  description_de: string;
};

export type SettingsPayload = {
  social_insurance: SettingRow[];
  economic_assumptions: SettingRow[];
  tax_brackets: SettingRow[];
  tax_thresholds: SettingRow[];
  regional_taxes: SettingRow[];
  demographics?: SettingRow[];
};

type PensionParameters = {
  economic_assumptions: {
    inflation_rate: number;
    pension_increase_rate: number;
    investment_return_rate: number;
  };
  social_insurance: {
    health_insurance_rate: number;
    additional_health_insurance_rate: number;
    care_insurance_rate: number;
    total_insurance_rate: number;
    health_insurance_exemption_bav: number;
  };
  tax_system: {
    rates: Record<string, number>;
    thresholds: Record<string, number>;
    solidarity_surcharge_rate: number;
    solidarity_surcharge_threshold: number;
  };
  regional_taxes?: {
    church_tax_bavaria_bw: number;
    church_tax_other_states: number;
  };
  demographics?: {
    retirement_age: number;
    life_expectancy: number;
  };
};

export function PensionSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsRows, setSettingsRows] = useState<SettingsPayload | null>(null);
  const [parameters, setParameters] = useState<PensionParameters | null>(null);
  const [form, setForm] = useState<PensionParameters | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // TODO Wave 3C: /admin/pension-settings schema typed as `string`; real shape is object.
        const { data: rawData, error } = await api.GET("/admin/pension-settings");
        if (error) throw new Error("API Fehler");

        const res = rawData as unknown as {
          success?: boolean;
          data?: SettingsPayload;
          current_parameters?: PensionParameters;
        };
        if (!res.success) throw new Error("API Fehler");

        // rows (already typed by backend resources)
        const rows = res.data as SettingsPayload;
        setSettingsRows(rows);

        // current parameters (already numeric from backend resource)
        const p = res.current_parameters as PensionParameters;
        setParameters(p);
        setForm(p);
      } catch (err) {
        console.error(err);
        toast.error("Fehler beim Laden der Einstellungen");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (path: string, raw: string) => {
    if (!form) return;
    const value = parseFloat(raw);
    const next = structuredClone(form);
    set(next, path, value);
    setForm(next);
  };

  const rowToPath = (
    category: keyof SettingsPayload | "demographics",
    key: string,
  ): string | null => {
    if (category === "economic_assumptions") return `economic_assumptions.${key}`;
    if (category === "social_insurance") return `social_insurance.${key}`;
    if (category === "tax_brackets") {
      const m = key.match(/^tax_rate_(stufe_\d)$/);
      return m ? `tax_system.rates.${m[1]}` : null;
    }
    if (category === "tax_thresholds") {
      const m = key.match(/^tax_threshold_(\d)$/);
      return m ? `tax_system.thresholds.threshold_${m[1]}` : null;
    }
    if (category === "regional_taxes") return `regional_taxes.${key}`;
    if (category === "demographics") return `demographics.${key}`;
    return null;
  };

  const handleSave = async () => {
    if (!form || !parameters || !settingsRows) return;
    try {
      setSaving(true);
      const changes: { id: number; value: number }[] = [];
      const categories: (keyof SettingsPayload | "demographics")[] = [
        "economic_assumptions",
        "social_insurance",
        "tax_brackets",
        "tax_thresholds",
        "regional_taxes",
        "demographics",
      ];
      categories.forEach((cat) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list = (settingsRows as any)[cat] as SettingRow[] | undefined;
        if (!Array.isArray(list)) return;
        list.forEach((row) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const path = rowToPath(cat as any, row.key);
          if (!path) return;
          const before = get(parameters, path);
          const after = get(form, path);
          if (typeof after === "number" && !Number.isNaN(after) && before !== after) {
            changes.push({ id: row.id, value: after });
          }
        });
      });

      if (changes.length === 0) {
        toast.info("Keine Änderungen");
        return;
      }
      // TODO Wave 3C: /admin/pension-settings/bulk-update schema typed as `string`.
      const { data: bulkRaw, error: bulkError } = await api.PATCH(
        "/admin/pension-settings/bulk-update",
        { body: { settings: changes } },
      );
      if (bulkError) throw new Error("Speichern fehlgeschlagen");
      const bulkRes = bulkRaw as unknown as { success?: boolean };
      if (!bulkRes.success) throw new Error("Speichern fehlgeschlagen");
      toast.success("Einstellungen gespeichert");
      setParameters(form);
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

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
            <Button variant="outline" onClick={() => setForm(parameters!)}>
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
