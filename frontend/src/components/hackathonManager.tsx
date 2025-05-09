// src/components/HackathonManager.tsx
import {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent
} from 'react';
import {
  fetchHackathons,
  fetchHackathon,
  saveHackathon,
  deleteHackathon    // ← import deletion
} from '../services/hackathonService';
import { Hackathon } from '../types/Hackathon';
import { Plus, Trash2 } from 'lucide-react';

export function HackathonManager() {
  const [list, setList] = useState<Hackathon[]>([]);
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(false);

  // Template pour un nouveau hackathon
  const emptyHack: Hackathon = {
    _id: '',
    nom: '',
    description: '',
    objectifs: '',
    dates: { debut: '', fin: '' },
    anonymatActif: false,
    quotas: { promptsParEtudiant: 0, tokensParEtudiant: 0 },
    taches: [],
    statut: '',
    createdAt: '',
    updatedAt: ''
  };

  const reload = () =>
    fetchHackathons().then(setList);

  useEffect(() => {
    reload();
  }, []);

  // Lire un hackathon
  const onSelect = async (e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setHack(null);
      return;
    }
    setLoading(true);
    const h = await fetchHackathon(id);
    setHack(h);
    setLoading(false);
  };

  // Create / Update fields
  const onChange =
    (key: keyof Hackathon) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!hack) return;
      setHack({ ...hack, [key]: e.target.value } as Hackathon);
    };

  const onDateChange =
    (key: keyof Hackathon['dates']) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!hack) return;
      setHack({
        ...hack,
        dates: { ...hack.dates, [key]: e.target.value }
      });
    };

  const onToggleAnon = (e: ChangeEvent<HTMLInputElement>) => {
    if (!hack) return;
    setHack({ ...hack, anonymatActif: e.target.checked });
  };

  const onQuotaChange =
    (key: keyof Hackathon['quotas']) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!hack) return;
      setHack({
        ...hack,
        quotas: { ...hack.quotas, [key]: +e.target.value }
      });
    };

  // Tâches (exemple)
  const addTask = () => {
    if (!hack) return;
    setHack({ ...hack, taches: [...hack.taches, ''] });
  };
  const updateTask = (i: number, v: string) => {
    if (!hack) return;
    const t = [...hack.taches]; t[i] = v;
    setHack({ ...hack, taches: t });
  };
  const removeTask = (i: number) => {
    if (!hack) return;
    setHack({ ...hack, taches: hack.taches.filter((_, j) => j !== i) });
  };

  // Enregistrer (create ou update)
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hack) return;
    setLoading(true);
    const saved = await saveHackathon(hack);
    // Met à jour la liste
    setList((lst) =>
      lst.some((h) => h._id === saved._id)
        ? lst.map((h) => (h._id === saved._id ? saved : h))
        : [...lst, saved]
    );
    setHack(saved);
    setLoading(false);
    alert('✅ Sauvegardé !');
  };

  // Supprimer
  const onDelete = async () => {
    if (!hack?._id) return;
    if (!confirm('Supprimer ce hackathon ?')) return;
    await deleteHackathon(hack._id);
    alert('🗑 Supprimé !');
    setHack(null);
    reload();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow space-y-6">
      <h2 className="text-3xl font-semibold text-indigo-600 text-center mb-4">
        Gestion des Hackathons
      </h2>

      {/* Sélecteur + Nouvel hackathon + Supprimer */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 border-2 border-dashed border-indigo-400 rounded p-1">
          <select
            className="w-full bg-white px-3 py-2 rounded outline-none"
            onChange={onSelect}
            value={hack?._id || ''}
          >
            <option value="">— Choisir un hackathon —</option>
            {list.map((h) => (
              <option key={h._id} value={h._id}>
                {h.nom || '(Sans nom)'}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setHack(emptyHack)}
          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          + Nouveau
        </button>
        {hack?._id && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            🗑 Supprimer
          </button>
        )}
      </div>

      {/* Formulaire Create/Update */}
      {hack && (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Nom :</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={hack.nom}
                onChange={onChange('nom')}
              />
            </div>
            <div>
              <label>Statut :</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={hack.statut}
                onChange={onChange('statut')}
              />
            </div>
          </div>

          <div>
            <label>Description :</label>
            <textarea
              className="w-full border px-2 py-1 rounded"
              value={hack.description}
              onChange={onChange('description')}
            />
          </div>

          <div>
            <label>Objectifs :</label>
            <textarea
              className="w-full border px-2 py-1 rounded"
              value={hack.objectifs}
              onChange={onChange('objectifs')}
            />
          </div>

          <div className="flex gap-4 items-center">
            <div>
              <label>Début :</label>
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={hack.dates.debut.slice(0, 10)}
                onChange={onDateChange('debut')}
              />
            </div>
            <div>
              <label>Fin :</label>
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={hack.dates.fin.slice(0, 10)}
                onChange={onDateChange('fin')}
              />
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hack.anonymatActif}
                onChange={onToggleAnon}
                className="mr-2"
              />
              Anonymat actif
            </label>
          </div>

          <div className="flex gap-4">
            <div>
              <label>Prompts / étudiant :</label>
              <input
                type="number"
                className="w-full border px-2 py-1 rounded"
                value={hack.quotas.promptsParEtudiant}
                onChange={onQuotaChange('promptsParEtudiant')}
              />
            </div>
            <div>
              <label>Tokens / étudiant :</label>
              <input
                type="number"
                className="w-full border px-2 py-1 rounded"
                value={hack.quotas.tokensParEtudiant}
                onChange={onQuotaChange('tokensParEtudiant')}
              />
            </div>
          </div>

          {/* Tâches */}
          <div className="border rounded-lg p-4 relative">
            <h3 className="font-medium mb-2">Tâches :</h3>
            <ul className="space-y-2 max-h-48 overflow-auto">
              {hack.taches.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded"
                >
                  <input
                    className="flex-1 bg-transparent focus:outline-none"
                    value={t}
                    onChange={(e) => updateTask(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeTask(i)}
                    className="text-red-500 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addTask}
              className="absolute bottom-3 right-3 bg-indigo-600 text-white rounded-full p-2"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            {loading ? 'Enregistrement…' : hack._id ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      )}

      {!hack && (
        <p className="text-center text-gray-500">
          Sélectionnez ou créez un hackathon pour commencer.
        </p>
      )}
    </div>
  );
}
