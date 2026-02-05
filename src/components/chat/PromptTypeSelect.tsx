import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PromptTypeSelectProps {
  label?: string;
  defaultValue?: string;
}

/**
 * Composant de sélection du type de prompt (one shot ou contextuel)
 */
export function PromptTypeSelect({
  label = "Type de prompt",
  defaultValue = "one shot",
}: PromptTypeSelectProps) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </Label>
      <Controller
        name="promptType"
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger
              id={id}
              className="h-9 rounded-full bg-white border border-slate-200 shadow-[0_8px_20px_-18px_rgba(2,6,23,0.25)] hover:bg-slate-50 focus:ring-2 focus:ring-cyan-400/30"
            >
              <SelectValue placeholder="Sélectionner un type de prompt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one shot">One Shot</SelectItem>
              <SelectItem value="contextuel">Contextuel</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
