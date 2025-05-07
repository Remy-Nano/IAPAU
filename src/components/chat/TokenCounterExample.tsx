import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TokenCounter } from "./TokenCounter";

export function TokenCounterExample() {
  const [tokensUsed, setTokensUsed] = useState(250);
  const tokensAuthorized = 1000;

  // Fonction pour simuler l'utilisation de tokens
  const useMoreTokens = () => {
    setTokensUsed((prev) => Math.min(prev + 100, tokensAuthorized));
  };

  // Fonction pour réinitialiser les tokens
  const resetTokens = () => {
    setTokensUsed(250);
  };

  return (
    <Card className="w-80 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          Consommation de Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TokenCounter
          tokensUsed={tokensUsed}
          tokensAuthorized={tokensAuthorized}
        />

        <div className="flex gap-2">
          <Button onClick={useMoreTokens} size="sm" className="text-xs">
            Utiliser 100 tokens
          </Button>
          <Button
            onClick={resetTokens}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
