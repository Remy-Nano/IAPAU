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
    <div className="space-y-3">
      {selectedPair !== null && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
          <p className="flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Vous avez sélectionné une réponse comme version finale.
          </p>
          <p className="text-xs mt-1 pl-6">
            Cliquez sur le bouton ci-dessous pour confirmer et enregistrer votre
            choix.
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        id="submit-final-button"
        className={`w-full flex items-center justify-center gap-2 h-12 text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
          selectedPair !== null
            ? "bg-green-600 hover:bg-green-700 animate-pulse"
            : ""
        }`}
        disabled={isButtonDisabled}
        onClick={() => {
          // Ajouter un log au clic du bouton
          console.log("Bouton de soumission cliqué", { selectedPair });
          // Ne pas arrêter la propagation pour permettre au formulaire de gérer l'événement
        }}
      >
        {isSubmitting ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            <span>Soumission en cours...</span>
          </>
        ) : (
          <>
            <Check className="h-5 w-5" />
            <span>
              {selectedPair !== null
                ? "Valider définitivement cette réponse"
                : "Soumettre la version finale"}
            </span>
          </>
        )}
      </Button>

      {selectedPair === null && !disabled && (
        <p className="text-xs text-center text-gray-500 mt-1">
          Sélectionnez d'abord une réponse en cochant la case "Sélectionner
          comme version finale"
        </p>
      )}
    </div>
  );
}
