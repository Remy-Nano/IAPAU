"use client";

import { FormProvider, useForm } from "react-hook-form";
import { PromptInput } from "./PromptInput";

interface ChatData {
  prompt: string;
}

interface FixedPromptInputProps {
  onSendPrompt: (prompt: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function FixedPromptInput({
  onSendPrompt,
  isLoading = false,
  isDisabled = false,
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

  return (
    <div className="fixed bottom-0 left-0 md:left-80 lg:left-96 right-0 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-md border-t-2 border-indigo-200/70 shadow-2xl shadow-indigo-900/10 z-50">
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse shadow-sm"></div>
      )}

      <div className="w-full p-6">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-200/60 hover:border-indigo-300/80 hover:shadow-indigo-100/30 p-4 transition-all duration-300 ring-1 ring-indigo-100/50">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)}>
              <PromptInput isLoading={isLoading} isDisabled={isDisabled} />
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
