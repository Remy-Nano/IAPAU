import { Send, Sparkles } from "lucide-react";
import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface PromptInputProps {
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

/**
 * Composant pour saisir et envoyer un prompt à l'IA
 */
export function PromptInput({
  placeholder = "Posez votre question à l'IA...",
  isLoading = false,
  isDisabled = false,
}: PromptInputProps) {
  const id = useId();
  const {
    control,
    formState: { isValid },
    watch,
  } = useFormContext();

  const promptValue = watch("prompt") || "";
  const charCount = promptValue.length;
  const maxChars = 2000;

  // Fonction pour gérer les raccourcis clavier
  const handleKeyDown = (e: React.KeyboardEvent, onSubmit: () => void) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && !isDisabled && isValid && charCount > 0) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end space-x-4">
        <div className="flex-1 relative">
          <Controller
            name="prompt"
            control={control}
            defaultValue=""
            rules={{
              required: true,
              minLength: 5,
              maxLength: maxChars,
            }}
            render={({ field, fieldState }) => (
              <>
                <div className="relative">
                  <Textarea
                    id={id}
                    placeholder={
                      isDisabled
                        ? "Cette conversation a été finalisée et ne peut plus être modifiée"
                        : placeholder
                    }
                    className={`
                      min-h-[80px] max-h-[200px] resize-none 
                      border-2 border-gray-200 rounded-xl 
                      focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50
                      transition-all duration-200 ease-in-out
                      placeholder:text-gray-400 
                      text-base leading-relaxed
                      pr-16 py-4 px-4
                      ${
                        isDisabled
                          ? "bg-gray-50 text-gray-400 border-gray-100"
                          : "bg-white hover:border-gray-300"
                      }
                      ${
                        fieldState.error
                          ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                          : ""
                      }
                    `}
                    disabled={isLoading || isDisabled}
                    onKeyDown={(e) => {
                      // Récupérer le handler de soumission du formulaire parent
                      const form = e.currentTarget.closest("form");
                      if (form) {
                        handleKeyDown(e, () => {
                          const submitEvent = new Event("submit", {
                            bubbles: true,
                            cancelable: true,
                          });
                          form.dispatchEvent(submitEvent);
                        });
                      }
                    }}
                    {...field}
                  />

                  {/* Compteur de caractères */}
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    <span
                      className={
                        charCount > maxChars * 0.9 ? "text-amber-500" : ""
                      }
                    >
                      {charCount}
                    </span>
                    <span className="text-gray-300">/{maxChars}</span>
                  </div>
                </div>

                {/* Message d'erreur */}
                {fieldState.error && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {fieldState.error.type === "required" &&
                      "Veuillez saisir votre message"}
                    {fieldState.error.type === "minLength" &&
                      "Message trop court (minimum 5 caractères)"}
                    {fieldState.error.type === "maxLength" &&
                      "Message trop long (maximum 2000 caractères)"}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !isValid || isDisabled || charCount === 0}
          className={`
            h-[80px] px-6 rounded-xl
            bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-700 hover:to-purple-700
            disabled:from-gray-400 disabled:to-gray-500
            text-white font-semibold
            shadow-lg hover:shadow-xl
            transition-all duration-200 ease-in-out
            transform hover:scale-105 active:scale-95
            flex flex-col items-center justify-center space-y-1
            min-w-[80px]
            ${isLoading ? "animate-pulse" : ""}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs">Envoi...</span>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-1">
                <Send className="h-5 w-5" />
                <Sparkles className="h-3 w-3 opacity-70" />
              </div>
              <span className="text-xs">Envoyer</span>
            </>
          )}
        </Button>
      </div>

      {/* Aide contextuelle */}
      {!isDisabled && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                Entrée
              </kbd>
              <span>pour envoyer</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>IA prête à vous aider</span>
          </span>
        </div>
      )}
    </div>
  );
}
