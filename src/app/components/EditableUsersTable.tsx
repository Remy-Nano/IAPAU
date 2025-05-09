"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useToast } from '@/hooks/useToast';
import { Upload } from 'lucide-react';


type RoleKey = "" | "etudiant" | "examinateur" | "admin";

type FormData = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: RoleKey;
  dateNaissance?: string;
  numeroEtudiant?: string;
};

type User = {
  _id: string;
  prenom: string;
  nom: string;
  email: string;
  role: RoleKey;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// étiquettes FR
const ROLE_LABELS: Record<RoleKey, string> = {
  "":           "",
  "etudiant":    "Étudiant",
  "examinateur":"Examinateur",
  "admin":       "Administrateur",
};

export function EditableUsersTable() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'etudiant' | 'examinateur' | 'admin' | 'autres'>('etudiant');
  const { data: users = [], mutate } = useSWR<User[]>('/api/users', fetcher);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<User | null>(null);
  const toast = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      const data = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        return headers.reduce((acc, key, i) => ({
          ...acc,
          [key]: values[i]
        }), {} as Partial<FormData>);
      }).filter(row => row.nom && row.prenom && row.email);

      // Créer les utilisateurs via l'API
      for (const userData of data) {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      }

      mutate(); // Rafraîchir la liste des utilisateurs
      toast.success('Utilisateurs créés avec succès');
    } catch (error) {
      console.error('Erreur lors de la lecture du CSV:', error);
      toast.error('Erreur lors de l\'importation du CSV');
    }
  };

  const filtered = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(search.toLowerCase()) ||
      user.prenom.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === 'autres') {
      return matchesSearch && !['etudiant', 'examinateur', 'admin'].includes(user.role);
    }
    return matchesSearch && user.role === activeTab;
  });

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setDraft({ ...user });
  };

  const handleSave = async () => {
    if (!editingId || !draft) return;
    
    const res = await fetch(`/api/users/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    
    if (res.ok) {
      mutate();
      setEditingId(null);
      setDraft(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    
    if (res.ok) {
      mutate();
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('etudiant')}
              className={`px-3 py-1 rounded ${activeTab === 'etudiant' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Étudiant
            </button>
            <button
              onClick={() => setActiveTab('examinateur')}
              className={`px-3 py-1 rounded ${activeTab === 'examinateur' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Examinateur
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 rounded ${activeTab === 'admin' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Admin
            </button>
            <button
              onClick={() => setActiveTab('autres')}
              className={`px-3 py-1 rounded ${activeTab === 'autres' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Autres
            </button>
          </div>
          <div className="flex gap-2">

            {activeTab === 'etudiant' ? (
              <>
                <label className="relative group">
                  <button
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                    title="Importer CSV"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFile}
                    className="absolute opacity-0 w-0 h-0"
                    id="csv-upload"
                  />
                </label>
                <button
                  onClick={() => window.location.href = '/users/create'}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">+</span>
                    <span>Créer un utilisateur</span>
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={() => window.location.href = '/users/create'}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">+</span>
                  <span>Créer un utilisateur</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                {editingId === u._id ? (
                  <>
                    <td>
                      <input
                        value={draft?.nom || ""}
                        onChange={(e) => setDraft((d) => ({ ...d!, nom: e.target.value }))}
                        className="form-input w-full"
                      />
                    </td>
                    <td>
                      <input
                        value={draft?.prenom || ""}
                        onChange={(e) => setDraft((d) => ({ ...d!, prenom: e.target.value }))}
                        className="form-input w-full"
                      />
                    </td>
                    <td>{draft?.email}</td>
                    <td>
                      <select
                        value={draft?.role || ""}
                        onChange={(e) => setDraft((d) => ({ ...d!, role: e.target.value as RoleKey }))}
                        className="form-select w-full"
                      >
                        <option value="">Sélectionnez un rôle</option>
                        <option value="etudiant">Étudiant</option>
                        <option value="examinateur">Examinateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={handleSave}
                          className="btn btn-success"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setDraft(null);
                          }}
                          className="btn btn-danger"
                        >
                          Annuler
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="text-sm">{u.nom}</td>
                    <td className="text-sm">{u.prenom}</td>
                    <td className="text-sm">{u.email}</td>
                    <td className="text-sm">{ROLE_LABELS[u.role]}</td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="btn btn-primary"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="btn btn-danger"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
