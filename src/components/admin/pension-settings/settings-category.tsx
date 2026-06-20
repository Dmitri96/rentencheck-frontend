import React, { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { PensionSetting, ModifiedValues, CategoryConfig } from "./types";

interface SettingsCategoryProps {
  config: CategoryConfig;
  settings: PensionSetting[];
  modifiedValues: ModifiedValues;
  onValueChange: (settingId: number, newValue: string) => void;
  getCurrentValue: (settingId: number, originalValue: number) => number;
}

/**
 * Einstellungs-Kategorie-Komponente
 *
 * Rendert eine Kategorie von Pensionseinstellungen mit Eingabefeldern.
 * Für Performance-Optimierung memoized.
 */
export const SettingsCategory = memo<SettingsCategoryProps>(
  ({ config, settings, modifiedValues, onValueChange, getCurrentValue }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>{config.icon}</div>
            <div>
              <h3 className="text-lg font-semibold">{config.title}</h3>
              <p className="text-sm text-gray-600 font-normal">{config.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {settings.map((setting) => {
              const currentValue = getCurrentValue(setting.id, setting.value);
              const isModified = modifiedValues[setting.id] !== undefined;

              return (
                <SettingInput
                  key={setting.id}
                  setting={setting}
                  currentValue={currentValue}
                  isModified={isModified}
                  onValueChange={onValueChange}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  },
);

SettingsCategory.displayName = "EinstellungsKategorie";

/**
 * Einzelne Einstellungs-Eingabe-Komponente
 *
 * Memoized Eingabe-Komponente für individuelle Einstellungen.
 */
interface SettingInputProps {
  setting: PensionSetting;
  currentValue: number;
  isModified: boolean;
  onValueChange: (settingId: number, newValue: string) => void;
}

const SettingInput = memo<SettingInputProps>(
  ({ setting, currentValue, isModified, onValueChange }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange(setting.id, e.target.value);
      },
      [setting.id, onValueChange],
    );

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`setting-${setting.id}`} className="text-sm font-medium text-gray-700">
            {setting.description_de}
          </Label>
          {isModified && (
            <Badge variant="secondary" className="text-xs">
              Geändert
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            id={`setting-${setting.id}`}
            type="number"
            step="0.01"
            min="0"
            max="1000"
            value={currentValue}
            onChange={handleChange}
            className={`flex-1 ${isModified ? "border-orange-300 bg-orange-50" : ""}`}
          />
          <span className="text-sm text-gray-500 w-8">{setting.unit}</span>
        </div>

        <p className="text-xs text-gray-500">{setting.description_de}</p>
      </div>
    );
  },
);

SettingInput.displayName = "EinstellungsEingabe";
