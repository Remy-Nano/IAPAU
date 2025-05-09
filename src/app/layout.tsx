import "../styles/main.css";
import { LayoutClient } from '@/components/LayoutClient';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white">
        <div className="container mx-auto max-w-3xl px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <LayoutClient>
              {children}
            </LayoutClient>
          </div>
        </div>
      </body>
    </html>
  );
}
