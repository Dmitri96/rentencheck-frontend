"use client";

/**
 * Manages fetch + save lifecycle for the admin pension settings panel.
 *
 * Extracted from pension-settings-panel.tsx so the component only handles
 * rendering. All API calls, state transitions, and diff logic live here.
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { get, set } from "@/lib/utils/object-access";

export type SettingRow = {
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

export type PensionParameters = {
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

function rowToPath(category: keyof SettingsPayload | "demographics", key: string): string | null {
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
}

interface UsePensionSettingsResult {
  loading: boolean;
  saving: boolean;
  form: PensionParameters | null;
  parameters: PensionParameters | null;
  handleChange: (path: string, raw: string) => void;
  handleSave: () => Promise<void>;
  handleReset: () => void;
}

export function usePensionSettings(): UsePensionSettingsResult {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsRows, setSettingsRows] = useState<SettingsPayload | null>(null);
  const [parameters, setParameters] = useState<PensionParameters | null>(null);
  const [form, setForm] = useState<PensionParameters | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: rawData, error } = await api.GET("/admin/pension-settings");
        if (error) throw new Error("API Fehler");

        const rows = rawData.data.settings as unknown as SettingsPayload;
        setSettingsRows(rows);

        const p = rawData.data.current_parameters as PensionParameters;
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

  const handleReset = () => {
    if (parameters) setForm(parameters);
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

      const { error: bulkError } = await api.PATCH("/admin/pension-settings/bulk-update", {
        body: { settings: changes },
      });
      if (bulkError) throw new Error("Speichern fehlgeschlagen");
      toast.success("Einstellungen gespeichert");
      setParameters(form);
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return { loading, saving, form, parameters, handleChange, handleSave, handleReset };
}
