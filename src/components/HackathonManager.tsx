"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteHackathon,
  fetchHackathon,
  fetchHackathons,
  saveHackathon,
} from "@/services/hackathonService";
import { Hackathon } from "@/types/Hackathon";
import { Plus, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export function HackathonManager() {
  const [list, setList] = useState<Hackathon[]>([]);
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(false);

  // Template pour un nouveau hackathon avec des dates ISO
  const emptyHack: Hackathon = {
    _id: "",
    nom: "",
    description: "",
    objectifs: "",
    dates: {
      debut: new Date().toISOString(),
      fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    anonymatActif: false,
    quotas: { promptsParEtudiant: 0, tokensParEtudiant: 0 },
    taches: [],
    statut: "En cours",
    createdAt: "",
    updatedAt: "",
  };

  const reload = async () => {
    try {
      setLoading(true);
      console.log("🔄 Rechargement de la liste des hackathons");
      const data = await fetchHackathons();
      setList(data);
      console.log(`✅ ${data.length} hackathons chargés avec succès`);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des hackathons:", error);
      toast.error("Erreur lors du chargement des hackathons", {
        description: "Veuillez rafraîchir la page et réessayer",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload().catch((err) => {
      console.error("❌ Erreur non gérée lors du chargement initial:", err);
    });
  }, []);

  // Lire un hackathon
  const onSelect = async (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setHack(null);
      return;
    }
    setLoading(true);
    try {
      const h = await fetchHackathon(id);
      setHack(h);
    } catch (error) {
      toast.error("Erreur lors du chargement du hackathon");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Create / Update fields
  const onChange =
    (key: keyof Hackathon) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!hack) return;
      setHack({ ...hack, [key]: e.target.value } as Hackathon);
    };

  const onDateChange =
    (key: keyof Hackathon["dates"]) => (e: ChangeEvent<HTMLInputElement>) => {
      if (!hack) return;
      setHack({
        ...hack,
        dates: { ...hack.dates, [key]: e.target.value },
      });
    };

  const onToggleAnon = (checked: boolean) => {
    if (!hack) return;
    setHack({ ...hack, anonymatActif: checked });
  };

  const onQuotaChange =
    (key: keyof Hackathon["quotas"]) => (e: ChangeEvent<HTMLInputElement>) => {
      if (!hack) return;
      setHack({
        ...hack,
        quotas: { ...hack.quotas, [key]: +e.target.value },
      });
    };

  // Tâches (exemple)
  const addTask = () => {
    if (!hack) return;
    setHack({ ...hack, taches: [...hack.taches, ""] });
  };

  const updateTask = (i: number, v: string) => {
    if (!hack) return;
    const t = [...hack.taches];
    t[i] = v;
    setHack({ ...hack, taches: t });
  };

  const removeTask = (i: number) => {
    if (!hack) return;
    setHack({ ...hack, taches: hack.taches.filter((_, j) => j !== i) });
  };

  // Formatage des dates pour l'affichage dans les input[type="date"]
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return "";
    try {
      // Retourne la date au format YYYY-MM-DD
      return isoString.split("T")[0];
    } catch (e) {
      console.error("Erreur de formatage de date:", e);
      return "";
    }
  };

  // Enregistrer (create ou update)
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hack) return;

    console.log("Tentative de sauvegarde:", hack);
    setLoading(true);
    try {
      // Vérification des dates pour éviter des erreurs
      const dataToSave = { ...hack };

      // S'assurer que les dates sont formatées comme des ISO strings
      if (dataToSave.dates.debut && !dataToSave.dates.debut.includes("T")) {
        dataToSave.dates.debut = new Date(dataToSave.dates.debut).toISOString();
      }

      if (dataToSave.dates.fin && !dataToSave.dates.fin.includes("T")) {
        dataToSave.dates.fin = new Date(dataToSave.dates.fin).toISOString();
      }

      console.log("Données formatées:", dataToSave);
      const saved = await saveHackathon(dataToSave);
      console.log("Hackathon sauvegardé:", saved);

      // Met à jour la liste
      setList((lst) =>
        lst.some((h) => h._id === saved._id)
          ? lst.map((h) => (h._id === saved._id ? saved : h))
          : [...lst, saved]
      );
      setHack(saved);

      // Message de confirmation plus visible
      toast.success(
        hack._id
          ? "Le hackathon a été modifié avec succès"
          : "Nouveau hackathon créé avec succès",
        {
          duration: 3000,
          id: "hackathon-saved",
        }
      );

      // Ajouter également une mise en évidence visuelle temporaire
      const container = document.querySelector(".hackathon-card");
      if (container) {
        container.classList.add("highlight-success");
        setTimeout(() => {
          container.classList.remove("highlight-success");
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast.error(
        "Une erreur est survenue lors de la sauvegarde du hackathon",
        {
          duration: 4000,
          id: "hackathon-error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Supprimer
  const onDelete = async () => {
    if (!hack?._id) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce hackathon ?")) return;

    setLoading(true);
    try {
      await deleteHackathon(hack._id);

      // Message de confirmation plus visible
      toast.success("Le hackathon a été supprimé avec succès", {
        duration: 3000,
        id: "hackathon-deleted",
      });

      setHack(null);
      await reload();
    } catch (error) {
      console.error("Erreur détaillée:", error);
      toast.error(
        "Une erreur est survenue lors de la suppression du hackathon",
        {
          duration: 4000,
          id: "hackathon-error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <Card className="hackathon-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Gestion des Hackathons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Sélecteur + Nouvel hackathon + Supprimer */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <select
                className="w-full p-2 border rounded-md"
                onChange={onSelect}
                value={hack?._id || ""}
                disabled={loading}
              >
                <option value="">— Choisir un hackathon —</option>
                {list.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.nom || "(Sans nom)"}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => setHack(emptyHack)}
              disabled={loading}
              variant="outline"
              className="gap-1"
            >
              <Plus size={16} />
              Nouveau
            </Button>
            {hack?._id && (
              <Button
                onClick={onDelete}
                disabled={loading}
                variant="destructive"
                className="gap-1"
              >
                <Trash2 size={16} />
                Supprimer
              </Button>
            )}
          </div>

          {/* Formulaire Create/Update */}
          {hack && (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={hack.nom}
                    onChange={onChange("nom")}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Input
                    id="statut"
                    value={hack.statut}
                    onChange={onChange("statut")}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Statuts recommandés:{" "}
                    <span className="font-medium">En cours</span>,{" "}
                    <span className="font-medium">Actif</span>,{" "}
                    <span className="font-medium">Terminé</span>,{" "}
                    <span className="font-medium">Brouillon</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={hack.description}
                  onChange={onChange("description")}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectifs">Objectifs</Label>
                <Textarea
                  id="objectifs"
                  value={hack.objectifs}
                  onChange={onChange("objectifs")}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debut">Date de début</Label>
                  <Input
                    id="debut"
                    type="date"
                    value={formatDateForInput(hack.dates.debut)}
                    onChange={onDateChange("debut")}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fin">Date de fin</Label>
                  <Input
                    id="fin"
                    type="date"
                    value={formatDateForInput(hack.dates.fin)}
                    onChange={onDateChange("fin")}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymatActif"
                      checked={hack.anonymatActif}
                      onCheckedChange={onToggleAnon}
                      disabled={loading}
                    />
                    <Label htmlFor="anonymatActif">Anonymat actif</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promptsParEtudiant">Prompts / étudiant</Label>
                  <Input
                    id="promptsParEtudiant"
                    type="number"
                    value={hack.quotas.promptsParEtudiant}
                    onChange={onQuotaChange("promptsParEtudiant")}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokensParEtudiant">Tokens / étudiant</Label>
                  <Input
                    id="tokensParEtudiant"
                    type="number"
                    value={hack.quotas.tokensParEtudiant}
                    onChange={onQuotaChange("tokensParEtudiant")}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Tâches</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTask}
                    disabled={loading}
                  >
                    <Plus size={16} />
                    Ajouter
                  </Button>
                </div>

                {hack.taches.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={t}
                      onChange={(e) => updateTask(i, e.target.value)}
                      disabled={loading}
                      placeholder={`Tâche ${i + 1}`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeTask(i)}
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sauvegarde en cours..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
