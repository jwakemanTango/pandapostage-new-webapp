import React from "react";
import { useDebug } from "@/components/Debug/debugContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

export const DynamicDebugPanel: React.FC = () => {
  const { schema, mergeSchema, resetSchemaToDefault } = useDebug();
  if (!schema) return null;

  const entries = Object.entries(schema);
  const collapsedSections = entries.filter(([_, s]) => s.hide);
  const expandedSections = entries.filter(([_, s]) => !s.hide);

  return (
    <div
      className="
        relative border border-amber-300 rounded-md 
        bg-amber-50/60 text-[12px] 
        p-2 shadow-sm backdrop-blur-[2px]
      "
    >
      {/* Reset Button */}
      <div className="absolute top-1 right-1 z-10">
        <Button
          variant="outline"
          size="icon"
          title="Reset Debug Schema"
          onClick={resetSchemaToDefault}
          className="
            h-6 w-6 p-0 border-amber-400 text-amber-700
            bg-white/80 hover:bg-amber-100/70
            rounded-sm shadow-sm
            transition-all
          "
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex gap-2 items-start pr-8">
        {/* Collapsed sidebar */}
        <div className="flex flex-col gap-1 w-[160px]">
          {collapsedSections.map(([sectionKey, section]) => {
            if (!section) return null;
            const sectionLabel =
              section.fields?.label ||
              sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
            const toggleCollapse = () =>
              mergeSchema({
                [sectionKey]: { hide: !section.hide },
              });

            return (
              <div
                key={sectionKey}
                className="
                  border border-gray-300 rounded-sm 
                  bg-white/80 text-gray-700 
                  px-2 py-1 cursor-pointer flex items-center justify-between 
                  hover:bg-amber-100/40 transition-colors
                "
                onClick={toggleCollapse}
              >
                <div className="flex items-center gap-1 truncate text-[11px] font-semibold uppercase">
                  <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                  <span className="truncate">{sectionLabel}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vertical Separator */}
        <div className="w-px bg-gray-300/70 self-stretch rounded-full mx-1" />

        {/* Expanded sections */}
        <div className="flex flex-wrap gap-2 content-start flex-1">
          {expandedSections.map(([sectionKey, section]) => {
            if (!section) return null;

            const sectionLabel =
              section.fields?.label ||
              sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
            const toggleCollapse = () =>
              mergeSchema({
                [sectionKey]: { hide: !section.hide },
              });

            // Defensive extraction
            const fieldEntries = Array.isArray(section.fields)
              ? []
              : Object.entries(section.fields ?? {}).filter(([k]) => k !== "label");

            const toggleEntries = Array.isArray(section.toggles)
              ? []
              : Object.entries(section.toggles ?? {});

            const selectEntries = Array.isArray(section.selects)
              ? []
              : Object.entries(section.selects ?? {});

            return (
              <div
                key={sectionKey}
                className="
                  border border-gray-200 rounded-sm bg-white/85 
                  transition-all overflow-hidden
                  min-w-[260px] max-w-[320px] flex-1
                "
              >
                {/* Section Header */}
                <div
                  className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-amber-100/40 transition-colors"
                  onClick={toggleCollapse}
                >
                  <div className="flex items-center gap-1 font-semibold uppercase tracking-wide text-[11px] text-gray-700 truncate">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    <span className="truncate">{sectionLabel}</span>
                  </div>
                </div>

                {/* Section Content */}
                <div className="space-y-2 px-2 pb-2">
                  {/* Selects */}
                  {selectEntries.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      {selectEntries.map(([selectKey, select]) => {
                        if (!select || typeof select !== "object") return null;
                        const value =
                          select.value === undefined || select.value === null
                            ? ""
                            : String(select.value);
                        const options = Array.isArray(select.options)
                          ? select.options
                          : [];

                        return (
                          <div key={selectKey} className="flex items-center gap-1">
                            <Label className="text-[11px] text-gray-700 capitalize">
                              {selectKey.replace(/([A-Z])/g, " $1")}
                            </Label>
                            <Select
                              value={value}
                              onValueChange={(newValue) =>
                                mergeSchema({
                                  [sectionKey]: {
                                    selects: {
                                      [selectKey]: { value: newValue, options },
                                    },
                                  },
                                })
                              }
                            >
                              <SelectTrigger className="h-6 text-[11px] px-1.5 w-[120px] bg-white/70 border-gray-300">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {options.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Inputs */}
                  {fieldEntries.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-gray-200 pt-2">
                      {fieldEntries.map(([key, value]) => {
                        const safeValue =
                          value === undefined || value === null
                            ? ""
                            : String(value);
                        return (
                          <div key={key} className="flex items-center gap-1">
                            <Label className="text-[11px] text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </Label>
                            <Input
                              type="text"
                              value={safeValue}
                              className="h-6 px-1 text-[11px] w-[120px] border-gray-300 bg-white/70"
                              onChange={(e) =>
                                mergeSchema({
                                  [sectionKey]: {
                                    fields: { [key]: e.target.value },
                                  },
                                })
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Toggles */}
                  {toggleEntries.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-gray-200 pt-2">
                      {toggleEntries.map(([toggleKey, value]) => (
                        <div key={toggleKey} className="flex items-center gap-1">
                          <Label className="text-[11px] text-gray-700 capitalize">
                            {toggleKey.replace(/([A-Z])/g, " $1")}
                          </Label>
                          <input
                            title={toggleKey}
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) =>
                              mergeSchema({
                                [sectionKey]: {
                                  toggles: { [toggleKey]: e.target.checked },
                                },
                              })
                            }
                            className="h-3 w-3 accent-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
