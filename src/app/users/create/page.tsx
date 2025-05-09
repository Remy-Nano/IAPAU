"use client";

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import { FormData } from '@/types/index';
import { userValidationSchema } from '@/types/userValidation';

export default function CreateUserPage() {
  const router = useRouter();
  const toast = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(userValidationSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'etudiant'
    }
  });

  const selectedRole = watch('role');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.message === 'Email already exists') {
          toast.error('Cet email est déjà utilisé');
        } else {
          toast.error(error.message || 'Erreur lors de la création');
        }
        return;
      }

      toast.success('Utilisateur créé avec succès');
      router.push('/users');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ajouter un utilisateur</h1>
      </div>
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Prénom</label>
              <input
                type="text"
                {...register('prenom')}
                className={`form-input ${errors.prenom ? 'border-red-500' : ''}`}
                placeholder="Entrez le prénom"
              />
              {errors.prenom && (
                <p className="text-red-500 text-sm mt-1">{errors.prenom.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Nom</label>
              <input
                type="text"
                {...register('nom')}
                className={`form-input ${errors.nom ? 'border-red-500' : ''}`}
                placeholder="Entrez le nom"
              />
              {errors.nom && (
                <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                {...register('email')}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="exemple@domaine.fr"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                {...register('password')}
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Rôle</label>
              <select
                {...register('role')}
                className={`form-select ${errors.role ? 'border-red-500' : ''}`}
              >
                <option value="etudiant">Étudiant</option>
                <option value="examinateur">Examinateur</option>
                <option value="admin">Administrateur</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>
            {selectedRole === 'etudiant' && (
              <div>
                <label className="form-label">Numéro étudiant</label>
                <input
                  type="text"
                  {...register('numeroEtudiant')}
                  className={`form-input ${errors.numeroEtudiant ? 'border-red-500' : ''}`}
                  placeholder="Optionnel"
                />
                {errors.numeroEtudiant && (
                  <p className="text-red-500 text-sm mt-1">{errors.numeroEtudiant.message}</p>
                )}
              </div>
            )}
            <div>
              <label className="form-label">Date de naissance</label>
              <input
                type="date"
                {...register('dateNaissance')}
                className={`form-input ${errors.dateNaissance ? 'border-red-500' : ''}`}
              />
              {errors.dateNaissance && (
                <p className="text-red-500 text-sm mt-1">{errors.dateNaissance.message}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Créer l'utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
