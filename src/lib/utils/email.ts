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

  const origin = new URL(link).origin;
  const logoUrl = `${origin}/ia-pau-logo.png?v=3`;
  const info = await transporter.sendMail({
    to: email,
    from: smtpFrom,
    subject: "Votre lien magique - Studia",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; background: #F3F7FB; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.9); border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <img src="${logoUrl}" alt="Studia" width="48" height="48" style="display:block; object-fit:contain;" />
            <div style="font-size: 18px; font-weight: 600; color: #0F172A; letter-spacing: 0.08em;">STUDIA</div>
          </div>
          <h2 style="color: #0F172A; margin: 0 0 8px;">Bonjour !</h2>
          <p style="color: #475569; margin: 0 0 16px;">
            Voici votre lien de connexion unique pour Studia :
          </p>
          <a href="${link}" 
             style="display: inline-block; padding: 12px 24px; background-color: #06b6d4; color: white; 
                    text-decoration: none; border-radius: 10px; font-weight: 600; box-shadow: 0 10px 24px -16px rgba(6,182,212,0.6);">
            Se connecter
          </a>
          <p style="color: #64748B; margin: 16px 0 0;">Ce lien expirera dans 10 minutes.</p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">
            Si vous n'avez pas demandé de connexion, vous pouvez ignorer cet email.
          </p>
        </div>
      </div>
    `,
  });

  log("✅ Email envoyé:", info.messageId);
  return true;
};
