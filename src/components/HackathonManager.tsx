"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteHackathon,
  fetchHackathon,
  fetchHackathons,
  saveHackathon,
} from "@/services/hackathonService";
import { Hackathon } from "@/types/Hackathon";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export function HackathonManager() {
  const [list, setList] = useState<Hackathon[]>([]);
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [mobilePane, setMobilePane] = useState<"list" | "details">("list");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
  const selectHackathon = async (id: string) => {
    if (!id) {
      setHack(null);
      return;
    }
    setLoading(true);
    try {
      const h = await fetchHackathon(id);
      setHack(h);
      setMobilePane("details");
    } catch (error) {
      toast.error("Erreur lors du chargement du hackathon");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = list.filter((h) =>
    (h.nom || "").toLowerCase().includes(search.toLowerCase())
  );

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
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Gestion des hackathons
          </h2>
          <p className="text-sm text-slate-500">
            Créer, sélectionner et modifier les hackathons
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setHack(emptyHack)}
            disabled={loading}
            className="w-full justify-center bg-[#0F172A] text-white hover:bg-[#1E293B] sm:w-auto"
          >
            <Plus size={16} className="mr-2" />
            Nouveau hackathon
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobilePane("list")}
          className={`flex-1 rounded-full text-xs ${
            mobilePane === "list"
              ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          Hackathons
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobilePane("details")}
          className={`flex-1 rounded-full text-xs ${
            mobilePane === "details"
              ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          Détails
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <Card
          className={`hackathon-card rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] ${
            mobilePane === "details" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="p-5 border-b border-slate-200/70">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Hackathons
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sélectionnez un hackathon
            </p>
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Rechercher un hackathon…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-slate-200/80 bg-slate-50/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25"
              />
            </div>
          </div>
          <div className="p-4 max-h-[520px] overflow-y-auto space-y-2">
            {filteredList.length === 0 && (
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 text-xs text-slate-500">
                Aucun hackathon trouvé.
              </div>
            )}
            {filteredList.map((h) => {
              const isActive = h._id === hack?._id;
              const statusLabel = h.statut || "";
              return (
                <button
                  key={h._id}
                  onClick={() => selectHackathon(h._id)}
                  className={`group w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                    isActive
                      ? "border-cyan-400/50 bg-cyan-500/5 shadow-[0_10px_24px_-20px_rgba(56,189,248,0.3)]"
                      : "border-[#D7E3F2]/80 bg-white/90 hover:border-cyan-400/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {h.nom || "(Sans nom)"}
                      </p>
                      {statusLabel && (
                        <span className="mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-[#0F172A]/70 border-slate-200 bg-slate-50">
                          {statusLabel}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card
          className={`rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)] flex flex-col max-h-[calc(100dvh-180px)] sm:max-h-none ${
            mobilePane === "list" ? "hidden sm:block" : "block"
          }`}
        >
          <div className="p-5 border-b border-slate-200/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">
                Détails du hackathon
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {hack ? "Informations et actions" : "Sélectionnez un hackathon à gauche"}
              </p>
            </div>
            {hack?._id && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setHack(hack)}
                  className="w-full border-slate-200 text-slate-700 sm:w-auto"
                >
                  Modifier
                </Button>
                <Button
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 sm:w-auto"
                >
                  <Trash2 size={16} className="mr-1" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 pb-32 sm:pb-6 flex-1 overflow-y-auto">
            {!hack && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
                Sélectionne un hackathon à gauche.
              </div>
            )}

            {hack && (
              <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={hack.nom ?? ""}
                    onChange={onChange("nom")}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Input
                    id="statut"
                    value={hack.statut ?? ""}
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
                  value={hack.description ?? ""}
                  onChange={onChange("description")}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectifs">Objectifs</Label>
                <Textarea
                  id="objectifs"
                  value={hack.objectifs ?? ""}
                  onChange={onChange("objectifs")}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="debut">Date de début</Label>
                  <Input
                    id="debut"
                    type="date"
                    value={formatDateForInput(hack.dates.debut) ?? ""}
                    onChange={onDateChange("debut")}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fin">Date de fin</Label>
                  <Input
                    id="fin"
                    type="date"
                    value={formatDateForInput(hack.dates.fin) ?? ""}
                    onChange={onDateChange("fin")}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-start sm:items-end pb-1 sm:pb-2">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="promptsParEtudiant">Prompts / étudiant</Label>
                  <Input
                    id="promptsParEtudiant"
                    type="number"
                    value={hack.quotas.promptsParEtudiant ?? 0}
                    onChange={onQuotaChange("promptsParEtudiant")}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokensParEtudiant">Tokens / étudiant</Label>
                  <Input
                    id="tokensParEtudiant"
                    type="number"
                    value={hack.quotas.tokensParEtudiant ?? 0}
                    onChange={onQuotaChange("tokensParEtudiant")}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label>Tâches</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTask}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <Plus size={16} />
                    Ajouter
                  </Button>
                </div>

                {hack.taches.map((t, i) => (
                  <div key={i} className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={t ?? ""}
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
                      className="h-9 w-full sm:w-10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 sm:pt-6">
                <div className="sticky bottom-0 -mx-6 sm:mx-0 bg-white/90 backdrop-blur-sm border-t border-slate-200/70 px-6 py-4 sm:border-none sm:bg-transparent sm:backdrop-blur-0 sm:px-0 sm:py-0">
                  <Button
                    type="submit"
                    className="w-full bg-[#0F172A] text-white hover:bg-[#1E293B]"
                    disabled={loading}
                  >
                    {loading ? "Sauvegarde en cours..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </form>
            )}
          </div>
        </Card>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="w-[92vw] max-w-[420px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce hackathon ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
