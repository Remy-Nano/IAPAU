import { Send } from "lucide-react";
import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface PromptInputProps {
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

/**
 * Composant pour saisir et envoyer un prompt à l'IA
 */
export function PromptInput({
  label = "Votre prompt",
  placeholder = "Saisissez votre prompt ici...",
  isLoading = false,
  isDisabled = false,
}: PromptInputProps) {
  const id = useId();
  const {
    control,
    formState: { isValid },
  } = useFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col space-y-3">
        <Controller
          name="prompt"
          control={control}
          defaultValue=""
          rules={{ required: true, minLength: 5 }}
          render={({ field }) => (
            <Textarea
              id={id}
              placeholder={
                isDisabled
                  ? "Cette conversation a été soumise en version finale et ne peut plus être modifiée"
                  : placeholder
              }
              className={`min-h-24 resize-none ${
                isDisabled ? "bg-gray-100 text-gray-500" : ""
              }`}
              disabled={isLoading || isDisabled}
              {...field}
            />
          )}
        />
        <Button
          type="submit"
          disabled={isLoading || !isValid || isDisabled}
          className={`ml-auto flex gap-2 min-w-32 ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>Envoyer</span>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
