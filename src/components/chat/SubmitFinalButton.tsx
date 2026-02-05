import { Check } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";

interface SubmitFinalButtonProps {
  isSubmitting?: boolean;
  disabled?: boolean;
}

/**
 * Bouton pour soumettre la version finale
 */
export function SubmitFinalButton({
  isSubmitting = false,
  disabled = false,
}: SubmitFinalButtonProps) {
  const { watch } = useFormContext();
  const selectedPair = watch("selectedPair");

  // Vérifier si le bouton doit être activé
  const isButtonDisabled = disabled || isSubmitting || selectedPair === null;

  // Log pour débogage
  useEffect(() => {
    console.log("État du bouton de soumission:", {
      isButtonDisabled,
      disabled,
      isSubmitting,
      selectedPair,
    });
  }, [isButtonDisabled, disabled, isSubmitting, selectedPair]);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        {selectedPair !== null ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 px-2 py-1">
            <Check className="h-3.5 w-3.5" />
            Réponse sélectionnée
          </span>
        ) : (
          <span>Sélectionnez une réponse pour valider.</span>
        )}
      </div>

      <Button
        type="submit"
        variant="default"
        id="submit-final-button"
        className="flex items-center gap-2 h-10 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-[0_8px_20px_-14px_rgba(2,6,23,0.6)] disabled:bg-slate-400"
        disabled={isButtonDisabled}
        onClick={() => {
          console.log("Bouton de soumission cliqué", { selectedPair });
        }}
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Soumission...</span>
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            <span>Valider la finale</span>
          </>
        )}
      </Button>
    </div>
  );
}
