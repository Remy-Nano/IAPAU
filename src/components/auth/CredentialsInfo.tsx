import Link from "next/link";
import React, { useState } from "react";

export const CredentialsInfo: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
      >
        <span>Identifiants pour tester</span>
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${
            open ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-4 text-sm bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2">Pour tester l'application :</p>
          <ul className="space-y-2 text-gray-600">
            <li>
              <span className="font-medium">Admin:</span> admin@example.com /{" "}
              <span className="font-mono bg-gray-100 p-0.5 rounded">
                admin123
              </span>
            </li>
            <li>
              <span className="font-medium">Examinateur:</span>{" "}
              examiner@example.com /{" "}
              <span className="font-mono bg-gray-100 p-0.5 rounded">
                examiner123
              </span>
            </li>
            <li>
              <span className="font-medium">Étudiant:</span> student@example.com
              (lien magique)
              <div className="mt-2">
                <Link
                  href="/magic-link?token=test123"
                  className="text-xs inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                >
                  → Simuler un lien magique
                </Link>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
