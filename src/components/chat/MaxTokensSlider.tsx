import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useId, useState } from "react";
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
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow md:p-6">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label} ({maxTokens})
        </Label>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setOpen(!open)}
              aria-label="Afficher les informations sur les tokens"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-xs p-2 border border-gray-200"
          >
            <p className="text-xs">
              Contrôle la longueur maximale de la réponse générée. Un token
              correspond à un fragment de mot.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
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
            className="w-full"
          />
        )}
      />
    </div>
  );
}
