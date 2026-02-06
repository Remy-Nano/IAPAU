"use client";

import { FormProvider, useForm } from "react-hook-form";
import { PromptInput } from "./PromptInput";
import { appConfig } from "@/lib/config";
import { TokenCounter } from "./TokenCounter";

interface ChatData {
  prompt: string;
}

interface FixedPromptInputProps {
  onSendPrompt: (prompt: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  tokensUsed?: number;
  className?: string;
  position?: "static" | "sticky" | "fixed";
}

export function FixedPromptInput({
  onSendPrompt,
  isLoading = false,
  isDisabled = false,
  tokensUsed = 0,
  className = "",
  position = "sticky",
}: FixedPromptInputProps) {
  const methods = useForm<ChatData>({
    defaultValues: {
      prompt: "",
    },
  });

  const handleSubmit = (data: ChatData) => {
    if (!data.prompt || data.prompt.trim() === "") {
      return;
    }
    onSendPrompt(data.prompt);
    methods.reset({ prompt: "" });
  };

  const positionClass =
    position === "fixed"
      ? "fixed bottom-0 left-0 right-0 z-50"
      : position === "sticky"
      ? "sticky bottom-4 z-40"
      : "relative";

  return (
    <div className={`${positionClass} ${className}`}>
      {position === "fixed" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent" />
      )}
      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 pb-4">
        <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-[0_12px_26px_-20px_rgba(15,23,42,0.3)]">
          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="absolute left-3 right-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-slate-900 to-cyan-500 animate-pulse"></div>
          )}

          <div className="p-2.5">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleSubmit)}>
                <PromptInput isLoading={isLoading} isDisabled={isDisabled} />
              </form>
            </FormProvider>
          </div>
        </div>

        <div className="mt-2">
          <TokenCounter
            tokensUsed={tokensUsed}
            tokensAuthorized={appConfig.tokens.defaultLimit}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
}
