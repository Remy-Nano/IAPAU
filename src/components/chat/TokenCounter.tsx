import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Progress } from "../ui/progress";

interface TokenCounterProps {
  tokensUsed: number;
  tokensAuthorized: number;
}

export function TokenCounter({
  tokensUsed,
  tokensAuthorized,
}: TokenCounterProps) {
  const [percentage, setPercentage] = useState(0);

  // Calculer le pourcentage d'utilisation
  useEffect(() => {
    const calculatedPercentage = Math.min(
      Math.round((tokensUsed / tokensAuthorized) * 100),
      100
    );
    setPercentage(calculatedPercentage);
  }, [tokensUsed, tokensAuthorized]);

  // Déterminer le niveau de risque basé sur le pourcentage de tokens restants
  const remainingPercentage = 100 - percentage;
  const riskLevel =
    remainingPercentage > 20
      ? "low"
      : remainingPercentage >= 10
      ? "medium"
      : "high";

  // Définir la couleur de la barre de progression en fonction du niveau de risque
  const progressColor =
    riskLevel === "low"
      ? "bg-green-500"
      : riskLevel === "medium"
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {tokensUsed} / {tokensAuthorized} tokens utilisés
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            riskLevel === "low"
              ? "text-green-600"
              : riskLevel === "medium"
              ? "text-orange-600"
              : "text-red-600"
          )}
        >
          {percentage}%
        </span>
      </div>

      <Progress
        value={percentage}
        className="h-2 w-full"
        // Override la couleur de l'indicateur avec celle définie selon le niveau de risque
        indicatorClassName={cn(
          "transition-colors duration-500 ease-in-out",
          progressColor
        )}
      />

      {riskLevel === "high" && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Crédits presque épuisés</span>
        </div>
      )}
    </div>
  );
}
