export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-600">⛔ Accès interdit</h1>
        <p className="text-gray-700">
          Vous n’avez pas les droits pour accéder à cette page.
        </p>
      </div>
    </div>
  );
}
