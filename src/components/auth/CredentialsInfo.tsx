import React from "react";

export const CredentialsInfo: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow border border-gray-300 max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-3 text-indigo-700">
        Identifiants de test
      </h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700">Administrateur:</h4>
          <div className="pl-4 text-sm">
            <p>
              Email:{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                admin@example.com
              </span>
            </p>
            <p>
              Mot de passe:{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                admin123
              </span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Examinateur:</h4>
          <div className="pl-4 text-sm">
            <p>
              Email:{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                examiner@example.com
              </span>
            </p>
            <p>
              Mot de passe:{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                examiner123
              </span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700">Étudiant:</h4>
          <div className="pl-4 text-sm">
            <p>
              Email:{" "}
              <span className="font-mono bg-gray-200 px-1 rounded">
                student@example.com
              </span>
            </p>
            <p>
              Méthode: Lien magique (connexion automatique en mode
              démonstration)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
