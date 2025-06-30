import sgMail from "@sendgrid/mail";

// Configuration SendGrid
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

// Vérifications de configuration
if (!sendgridApiKey) {
  console.error("🛑 SENDGRID_API_KEY non définie dans .env.local");
} else {
  console.log("✅ SENDGRID_API_KEY trouvée");
  sgMail.setApiKey(sendgridApiKey);
}

if (!sendgridFromEmail) {
  console.error("🛑 SENDGRID_FROM_EMAIL non définie dans .env.local");
} else {
  console.log("✅ SENDGRID_FROM_EMAIL configurée:", sendgridFromEmail);
}

export const sendMagicLink = async (email: string, link: string) => {
  try {
    // Vérifications préalables
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY manquante");
    }
    if (!sendgridFromEmail) {
      throw new Error("SENDGRID_FROM_EMAIL manquante");
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide");
    }

    // Validation du lien
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      throw new Error("URL invalide");
    }

    console.log("🚀 Début de l'envoi de l'email");
    console.log("📧 Email destinataire:", email);
    console.log("🔗 Lien:", link);
    console.log("📤 Email expéditeur:", sendgridFromEmail);

    const msg = {
      to: email,
      from: {
        email: sendgridFromEmail,
        name: "Prompt Challenge",
      },
      subject: "Votre lien magique - Prompt Challenge",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Bonjour !</h2>
          <p style="color: #666;">Voici votre lien de connexion unique pour Prompt Challenge :</p>
          <a href="${link}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Se connecter
          </a>
          <p style="color: #666;">Ce lien expirera dans 10 minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Si vous n'avez pas demandé de connexion, vous pouvez ignorer cet email.
          </p>
        </div>
      `,
      // Ajouter des options pour éviter les erreurs communes
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false },
      },
    };

    console.log("⚡ Message configuré, envoi en cours...");

    const response = await sgMail.send(msg);

    console.log("✅ Email envoyé avec succès");
    console.log("📊 Response status:", response[0].statusCode);
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);

    // Log détaillé de l'erreur SendGrid
    if (error && typeof error === "object" && "response" in error) {
      const sgError = error as {
        code?: number;
        message?: string;
        response?: { body?: unknown };
      };
      console.error("🔍 Détails erreur SendGrid:");
      console.error("   - Status:", sgError.code);
      console.error("   - Message:", sgError.message);
      if (sgError.response && sgError.response.body) {
        console.error(
          "   - Body:",
          JSON.stringify(sgError.response.body, null, 2)
        );
      }
    }

    throw error instanceof Error
      ? error
      : new Error("Erreur lors de l'envoi de l'email");
  }
};
