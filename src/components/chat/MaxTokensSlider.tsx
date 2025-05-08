import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

interface MaxTokensSliderProps {
  label?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Composant pour ajuster le nombre maximum de tokens pour les réponses IA
 */
export function MaxTokensSlider({
  label = "Max tokens",
  defaultValue = 512,
  min = 100,
  max = 2048,
  step = 50,
}: MaxTokensSliderProps) {
  const id = useId();
  const { control, watch } = useFormContext();
  const maxTokens = watch("maxTokens") || defaultValue;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} ({maxTokens})
      </Label>
      <Controller
        name="maxTokens"
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Slider
            id={id}
            min={min}
            max={max}
            step={step}
            value={[field.value]}
            onValueChange={(value: number[]) => field.onChange(value[0])}
          />
        )}
      />
    </div>
  );
}
