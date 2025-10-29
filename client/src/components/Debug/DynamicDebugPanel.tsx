import React from "react";
import { useDebug } from "@/lib/debugContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const DynamicDebugPanel: React.FC = () => {
  const { schema, mergeSchema, resetSchemaToDefault } = useDebug();

  return (
    <div className="p-2 border rounded-md bg-muted/20 space-y-3 text-[12px]">
      {Object.entries(schema).map(([sectionKey, section]) => {
        const sectionLabel =
          section.fields?.label ||
          sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);

        const fieldEntries = section.fields
          ? Object.entries(section.fields).filter(([k]) => k !== "label")
          : [];
        const toggleEntries = section.toggles ? Object.entries(section.toggles) : [];

        return (
          <div
            key={sectionKey}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b last:border-0 border-gray-200 pb-2"
          >
            {/* Section title */}
            <div className="font-semibold text-gray-600 uppercase tracking-wide sm:w-32">
              {sectionLabel}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-1">
              {/* Toggles */}
              {toggleEntries.map(([toggleKey, value]) => (
                <div key={toggleKey} className="flex items-center gap-1.5">
                  <Label className="text-[12px] text-gray-700 capitalize">
                    {toggleKey.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Switch
                    checked={!!value}
                    onCheckedChange={(v) =>
                      mergeSchema({
                        [sectionKey]: {
                          toggles: { [toggleKey]: v },
                        },
                      })
                    }
                    className="scale-90 translate-y-[1px]"
                  />
                </div>
              ))}

              {/* Input Fields (controlled) */}
              {fieldEntries.map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <Label className="text-[12px] text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Input
                    type={typeof value === "number" ? "number" : "text"}
                    value={value ?? ""}
                    className="h-6 px-2 text-[12px] w-[140px]"
                    onChange={(e) =>
                      mergeSchema({
                        [sectionKey]: {
                          fields: { [key]: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer Actions */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-[11px] py-1 px-2 h-6"
          onClick={resetSchemaToDefault}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};
