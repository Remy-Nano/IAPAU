import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Role } from '@/types/index';
import { userValidationSchema, FormData } from '@/types/userValidation';

export const validationSchema = userValidationSchema;

export function UserForm({ user, onSubmit }: { user?: FormData; onSubmit: (data: FormData) => void }) {
  const [role, setRole] = useState<Role>(user?.role || 'etudiant');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: user || {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'etudiant',
      dateNaissance: '',
      numeroEtudiant: ''
    }
  });

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setRole(newRole);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Prénom</label>
          <input
            type="text"
            {...register('prenom')}
            className="form-input"
            placeholder="Entrez le prénom"
          />
        </div>
        <div>
          <label className="form-label">Nom</label>
          <input
            type="text"
            {...register('nom')}
            className="form-input"
            placeholder="Entrez le nom"
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            {...register('email')}
            className="form-input"
            placeholder="exemple@domaine.fr"
          />
        </div>
        <div>
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            {...register('password')}
            className="form-input"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="form-label">Rôle</label>
          <select
            {...register('role')}
            value={role}
            onChange={handleRoleChange}
            className="form-select"
          >
            <option value="etudiant">Étudiant</option>
            <option value="examinateur">Examinateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        {role === 'etudiant' && (
          <>
            <div>
              <label className="form-label">Numéro étudiant</label>
              <input
                type="text"
                {...register('numeroEtudiant')}
                className="form-input"
                placeholder="Optionnel"
              />
            </div>
            <div>
              <label className="form-label">Date de naissance</label>
              <input
                type="date"
                {...register('dateNaissance')}
                className="form-input"
              />
            </div>
          </>
        )}
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="btn btn-primary"
        >
          {user ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
