// src/app/layout.tsx
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

export const metadata = {
  title: "Prompt Challenge",
  description: "Hackathon IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning={true}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
