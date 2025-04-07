import React from "react";

interface StudentAuthProps {
  email?: string;
}

export const StudentAuth: React.FC<StudentAuthProps> = ({ email }) => {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-lg border border-gray-200 shadow-md">
      <h2 className="text-3xl font-bold text-center mb-8">
        Connexion étudiant
      </h2>

      <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
        <p className="text-center text-gray-700">
          Un lien de connexion vous a été envoyé dans votre boîte mail afin
          d'accéder à votre espace.
        </p>
        {email && (
          <p className="mt-2 text-center text-sm text-gray-500">
            Email: {email}
          </p>
        )}
      </div>
    </div>
  );
};
