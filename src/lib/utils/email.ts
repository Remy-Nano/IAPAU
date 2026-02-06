// src/lib/utils/email.ts
import nodemailer from "nodemailer";

// ⚙️ Configuration SMTP (ex: Gmail)
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpSecure = process.env.SMTP_SECURE; // "true" / "false"
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Valeur simple et robuste
const smtpFrom = process.env.SMTP_FROM || smtpUser || "";

const shouldLog = process.env.NODE_ENV !== "production";
const log = (...args: unknown[]) => {
  if (shouldLog) console.log(...args);
};
const logError = (...args: unknown[]) => {
  if (shouldLog) console.error(...args);
};

// 🔎 Logs utiles (dev uniquement)
if (!smtpHost || !smtpPort) {
  logError("🛑 SMTP_HOST ou SMTP_PORT non défini dans .env.local");
} else {
  log("✅ SMTP configuré:", `${smtpHost}:${smtpPort}`);
}

if (!smtpUser || !smtpPass) {
  logError("🛑 SMTP_USER ou SMTP_PASS non défini dans .env.local");
} else {
  log("✅ SMTP_USER configuré:", smtpUser);
  log("✅ SMTP_FROM utilisé:", smtpFrom);
}

// 🚚 Transport Nodemailer
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: Number(smtpPort || 587),
  secure: smtpSecure === "true", // false = STARTTLS (Gmail port 587)
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendMagicLink = async (email: string, link: string) => {
  if (!smtpHost || !smtpPort) {
    throw new Error("Configuration SMTP manquante (SMTP_HOST / SMTP_PORT)");
  }
  if (!smtpUser || !smtpPass) {
    throw new Error("Configuration SMTP manquante (SMTP_USER / SMTP_PASS)");
  }
  if (!smtpFrom) {
    throw new Error("Configuration SMTP manquante (SMTP_FROM / SMTP_USER)");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Format d'email invalide");
  }

  if (!link.startsWith("http://") && !link.startsWith("https://")) {
    throw new Error("URL invalide");
  }

  log("🚀 Envoi email (Nodemailer)");
  log("📧 Destinataire:", email);
  log("📤 From:", smtpFrom);
  log("🔗 Magic link:", link);

  const info = await transporter.sendMail({
    to: email,
    from: smtpFrom,
    subject: "Votre lien magique - Prompt Challenge",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Bonjour !</h2>
        <p style="color: #666;">Voici votre lien de connexion unique pour Prompt Challenge :</p>
        <a href="${link}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; 
                  text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Se connecter
        </a>
        <p style="color: #666;">Ce lien expirera dans 10 minutes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Si vous n'avez pas demandé de connexion, vous pouvez ignorer cet email.
        </p>
      </div>
    `,
  });

  log("✅ Email envoyé:", info.messageId);
  return true;
};
