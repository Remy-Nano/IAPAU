import React, { useState } from "react";

interface UserFormData {
  prenom: string;
  nom: string;
  email: string;
  dateNaissance: string;
  numeroEtudiant: string;
  role: string;
  consentementRGPD: boolean;
}

const initialFormState: UserFormData = {
  prenom: "",
  nom: "",
  email: "",
  dateNaissance: "",
  numeroEtudiant: "",
  role: "",
  consentementRGPD: false,
};

export default function CreateUserForm() {
  const [formData, setFormData] = useState<UserFormData>(initialFormState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Utilisateur créé !");
        setFormData(initialFormState); // Réinitialiser le formulaire
      } else {
        alert("❌ Erreur : " + result.message);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("❌ Erreur réseau");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 w-full max-w-md mx-auto"
    >
      <input
        name="prenom"
        placeholder="Prénom"
        value={formData.prenom}
        onChange={handleChange}
      />
      <input
        name="nom"
        placeholder="Nom"
        value={formData.nom}
        onChange={handleChange}
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="date"
        name="dateNaissance"
        value={formData.dateNaissance}
        onChange={handleChange}
      />
      <input
        name="numeroEtudiant"
        placeholder="Numéro Étudiant"
        value={formData.numeroEtudiant}
        onChange={handleChange}
      />
      <input
        name="role"
        placeholder="Rôle"
        value={formData.role}
        onChange={handleChange}
      />

      <label htmlFor="consentementRGPD" className="flex items-center gap-2">
        <input
          type="checkbox"
          id="consentementRGPD"
          name="consentementRGPD"
          checked={formData.consentementRGPD}
          onChange={handleChange}
        />
        Consentement RGPD
      </label>

      <button type="submit" className="bg-blue-600 text-white py-2 rounded">
        Créer l'utilisateur
      </button>
    </form>
  );
}
