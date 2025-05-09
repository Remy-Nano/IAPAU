"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ImportUsersPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    rows: string[][];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    inserted: number;
    updated: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResults(null);

    try {
      const text = await selectedFile.text();
      const rows = text.split("\n");
      const headers = rows[0].split(",").map((h) => h.trim());

      const previewRows = rows
        .slice(1, 6) // Prendre seulement 5 lignes pour l'aperçu
        .filter((row) => row.trim())
        .map((row) => row.split(",").map((cell) => cell.trim()));

      setPreview({ headers, rows: previewRows });
    } catch (error) {
      console.error("Erreur lors de la lecture du CSV:", error);
      toast({
        title: "Erreur de fichier",
        description: "Impossible de lire le fichier CSV",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const rows = text.split("\n");
      const headers = rows[0].split(",").map((h) => h.trim());

      const data = rows
        .slice(1)
        .filter((row) => row.trim()) // Ignorer les lignes vides
        .map((row) => {
          const values = row.split(",").map((v) => v.trim());
          return headers.reduce(
            (acc, key, i) => ({
              ...acc,
              [key]: values[i],
            }),
            {} as Record<string, string>
          );
        })
        .filter((row) => row.nom && row.prenom && row.email);

      const response = await fetch("/api/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResults(result);

      if (response.ok) {
        toast({
          title: "Import réussi",
          description: `${result.inserted} utilisateurs créés, ${result.updated} mis à jour`,
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur d'import",
          description: "Impossible d'importer les utilisateurs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'import CSV:", error);
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue pendant l'import",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Import d&apos;utilisateurs
          </h1>
          <Link href="/admin/users">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-2">
                1. Télécharger le modèle
              </h2>
              <p className="text-gray-600 mb-3">
                Utilisez ce modèle CSV pour votre import. Les colonnes requises
                sont: nom, prenom, email, password, dateNaissance (YYYY-MM-DD).
                Les colonnes role et numeroEtudiant sont optionnelles.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  (window.location.href = "/templates/template.csv")
                }
              >
                Télécharger le modèle CSV
              </Button>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-2">
                2. Importer vos utilisateurs
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-lg text-gray-700 mb-1">
                      Cliquez pour sélectionner un fichier CSV
                    </p>
                    <p className="text-sm text-gray-500">
                      ou glissez-déposez votre fichier ici
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {preview && (
              <div>
                <h2 className="text-lg font-medium mb-2">Aperçu des données</h2>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        {preview.headers.map((header, i) => (
                          <th
                            key={i}
                            className="py-2 px-4 text-left font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-muted/50">
                          {row.map((cell, j) => (
                            <td key={j} className="py-2 px-4">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  className="mt-4"
                  onClick={handleImport}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Import en cours..."
                    : "Importer les utilisateurs"}
                </Button>
              </div>
            )}

            {results && (
              <div
                className={`p-4 border rounded-md ${
                  results.errors.length
                    ? "bg-orange-50 border-orange-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <h2 className="text-lg font-medium mb-2">Résultats</h2>
                <p>
                  <strong>{results.inserted}</strong> utilisateurs créés,{" "}
                  <strong>{results.updated}</strong> utilisateurs mis à jour
                </p>

                {results.errors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-red-600">
                      Erreurs ({results.errors.length})
                    </h3>
                    <ul className="list-disc pl-5 mt-2 text-sm text-red-600">
                      {results.errors.slice(0, 10).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {results.errors.length > 10 && (
                        <li>
                          ... et {results.errors.length - 10} autres erreurs
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
