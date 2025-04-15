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
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name="promptType"
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger id={id}>
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
