import { Send } from "lucide-react";
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
    <div className="space-y-1">
      <div className="flex items-end gap-2">
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
                      min-h-[40px] max-h-[120px] resize-none
                      border border-slate-200/80 rounded-2xl
                      focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200/30
                      transition-all duration-200 ease-in-out
                      placeholder:text-slate-400/90
                      text-sm leading-tight
                      pr-10 py-2 px-4
                      ${
                        isDisabled
                          ? "bg-slate-50 text-slate-400 border-slate-100"
                          : "bg-white/90 hover:border-slate-300/80"
                      }
                      ${
                        fieldState.error
                          ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
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
          disabled={isLoading || !isValid || isDisabled || promptValue.length === 0}
          className={`
            h-[40px] px-3 rounded-2xl
            bg-[#0F172A] hover:bg-[#1E293B]
            disabled:bg-slate-400/80
            text-white font-semibold
            shadow-[0_10px_24px_-18px_rgba(2,6,23,0.6)]
            transition-all duration-200 ease-in-out
            transform active:scale-95
            flex items-center justify-center gap-2
            min-w-[64px]
            ${isLoading ? "animate-pulse" : ""}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs">Envoi</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="text-xs">Envoyer</span>
            </>
          )}
        </Button>
      </div>

    </div>
  );
}
