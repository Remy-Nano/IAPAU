// src/app/layout.tsx
import ClientProviders from "@/components/ClientProviders";
import "./globals.css";

export const metadata = {
  title: "Studia",
  description: "Hackathon IA",
  icons: {
    icon: [
      { url: "/icon-32.png?v=3", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=3",
  },
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
