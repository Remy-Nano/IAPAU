"use client";

import { Slider } from "@/components/ui/slider";
import { useFormContext } from "react-hook-form";

export function TemperatureSlider() {
  const { watch, setValue } = useFormContext();
  const temperature = watch("temperature");

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <label className="block mb-2">
        <span className="text-sm font-medium">
          Température ({temperature.toFixed(2)})
        </span>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[temperature]}
          onValueChange={(values) => setValue("temperature", values[0])}
        />
      </label>
    </div>
  );
}
