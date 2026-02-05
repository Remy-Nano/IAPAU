"use client";

import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function TemperatureSlider() {
  const { watch, setValue } = useFormContext();
  const temperature = watch("temperature");
  const [open, setOpen] = useState(false);

  return (
    <div className="p-3 bg-white/90 border border-slate-200/80 rounded-xl shadow-[0_12px_24px_-20px_rgba(2,6,23,0.25)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">
          Température ({temperature.toFixed(2)})
        </span>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={() => setOpen(!open)}
              aria-label="Afficher les informations sur la température"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="max-w-xs p-2 border border-gray-200"
          >
            <p className="text-xs">
              Ajuste l&apos;aléa de la génération :
              <br />0 = très déterministe,
              <br />1 = très créatif.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={[temperature]}
        onValueChange={(values) => setValue("temperature", values[0])}
        className="w-full"
      />
    </div>
  );
}
