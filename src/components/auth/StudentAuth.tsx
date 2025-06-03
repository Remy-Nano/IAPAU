import React from "react";

interface StudentAuthProps {
  email: string;
}

export const StudentAuth: React.FC<StudentAuthProps> = ({ email }) => {
  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-lg border border-gray-200 shadow-md">
      <h2 className="text-3xl font-bold text-center mb-8">
        Connexion étudiant
      </h2>

      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
        <p className="text-green-700 mb-2">
          Un lien de connexion vous a été envoyé dans votre boîte mail afin de
          vous identifier.
        </p>
        <p className="text-green-600 text-sm">
          Veuillez vérifier votre boîte mail ({email}) et cliquez sur le lien
          pour vous connecter.
        </p>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-4 py-2 text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50"
        >
          Retour
        </button>
      </div>
    </div>
  );
};
