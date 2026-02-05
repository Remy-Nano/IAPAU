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

interface ModelSelectProps {
  label?: string;
  defaultValue?: string;
}

/**
 * Composant de sélection du modèle d'IA (OpenAI ou Mistral)
 */
export function ModelSelect({
  label = "Modèle d'IA",
  defaultValue = "openai",
}: ModelSelectProps) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </Label>
      <Controller
        name="modelName"
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger
              id={id}
              className="h-9 rounded-full bg-white border border-slate-200 shadow-[0_8px_20px_-18px_rgba(2,6,23,0.25)] hover:bg-slate-50 focus:ring-2 focus:ring-cyan-400/30"
            >
              <SelectValue placeholder="Sélectionner un modèle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="mistral">Mistral AI</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
