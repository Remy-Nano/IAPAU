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
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name="modelName"
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger id={id}>
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
